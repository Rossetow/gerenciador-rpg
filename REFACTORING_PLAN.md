# Refactoring Plan: gerenciador-rpg

## Context

This project is a React + Go RPG character sheet manager currently using Redis as its only data store, with business logic scattered across frontend components. The goal is to prepare it for cloud deployment (Vercel + Render + Supabase), replace Redis with PostgreSQL, and clean up frontend logic. Image uploads move from local disk to Supabase Storage.

**User decisions:**
- Auth: keep it simple — name-only login, no JWT, no passwords. Backend trusts the user ID sent by the frontend (same as today, stored in PostgreSQL now)
- Images: Supabase Storage (Render has an ephemeral filesystem)
- Frontend scope: move logic to backend, keep existing visual design
- No database indexes (overkill for project scale)
- Items are generic with a free-form `dados` JSONB blob; `tipo` is a top-level column so frontend can branch on it; `personagem_id` is nullable so items can belong to a campaign without being assigned to any character (future mestre item pool)

---

## Phase 0 — PostgreSQL Schema

**New file: `backend/db/schema.sql`**

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE usuarios (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome      TEXT NOT NULL UNIQUE,
    tipo      TEXT NOT NULL CHECK (tipo IN ('jogador', 'mestre')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campanhas (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome                    TEXT NOT NULL,
    mestre_id               UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao               TEXT NOT NULL DEFAULT '',
    template_atributos_base TEXT[] NOT NULL DEFAULT '{}',
    template_habilidades    TEXT[] NOT NULL DEFAULT '{}',
    template_outros         TEXT[] NOT NULL DEFAULT '{}',
    criado_em               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campanha_jogadores (
    campanha_id UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    jogador_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (campanha_id, jogador_id)
);

CREATE TABLE personagens (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome             TEXT NOT NULL,
    jogador_id       UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    campanha_id      UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    descricao_fisica TEXT NOT NULL DEFAULT '',
    caracteristicas  TEXT NOT NULL DEFAULT '',
    vida             INT NOT NULL DEFAULT 0,
    vida_maxima      INT NOT NULL DEFAULT 0,
    imagem_url       TEXT NOT NULL DEFAULT '',
    atributos_base   JSONB NOT NULL DEFAULT '{}',
    habilidades      JSONB NOT NULL DEFAULT '{}',
    outros           JSONB NOT NULL DEFAULT '{}',
    criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- personagem_id is nullable: NULL = item belongs to the campaign (mestre's pool),
-- not assigned to any character. campanha_id is always required.
CREATE TABLE itens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campanha_id   UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    personagem_id UUID REFERENCES personagens(id) ON DELETE CASCADE,
    tipo          TEXT NOT NULL DEFAULT 'Geral',
    dados         JSONB NOT NULL DEFAULT '{}',
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Key design decisions:**
- `jogadores` + `mestres` merged into `usuarios` with a `tipo` column — eliminates the `" - Mestre"` name suffix hack in `LoginPage.js`
- Items get their own table with `personagem_id` **nullable**: NULL = campaign-owned (mestre pool), not yet assigned. `campanha_id` is always set as the anchor
- `tipo` is a top-level column (not buried in JSONB) — backend and frontend branch on it without parsing the blob
- `dados` is free-form JSONB. Common fields (`nome`, `descricao`, `quantidade`, `peso`, `valor`, `efeitos`) always live there. Type-specific fields (`dano`, `tipo_dano` for weapons; `valor_defesa`, `localizacao` for armor) are added as-needed. No server-side validation of the shape — the frontend owns the contract
- `atributos_base`, `habilidades`, `outros` stored as JSONB
- All IDs are database-generated UUIDs (removes the `base64(nome)` and `base64(nome+campanhaID)` ID schemes)
- No indexes — unnecessary at this project scale

---

## Item Type Catalogue

Every item, regardless of type, shares a **base set of fields**. Type-specific fields are added on top. The backend defines one Go struct per type; all structs embed a common `ItemBase`. The `dados` JSONB column stores the serialised struct.

### Base fields (all types)

| Field | Type | Notes |
|---|---|---|
| `nome` | string | Item name, required |
| `descricao` | string | Flavour text / description |
| `quantidade` | int | Stack size, default 1 |
| `peso` | float | Weight per unit |
| `valor` | float | Monetary value |
| `efeitos` | string | Free-text effects/notes (one per line) |

### `Geral` / `Outro`

No extra fields. Catch-all for items that don't fit elsewhere (keys, quest items, misc loot).

```json
{
  "nome": "Chave da taverna",
  "descricao": "Uma chave enferrujada.",
  "quantidade": 1,
  "peso": 0.1,
  "valor": 0,
  "efeitos": ""
}
```

### `Arma`

| Extra field | Type | Notes |
|---|---|---|
| `dano` | string | Dice notation, e.g. `"2d6"` |
| `tipo_dano` | string | e.g. `"cortante"`, `"perfurante"` |
| `tipo_arma` | string | e.g. `"espada longa"`, `"arco curto"` |
| `habilidade_requerida` | string | Linked skill name |

```json
{
  "nome": "Espada Longa",
  "descricao": "Lâmina de aço bem balanceada.",
  "quantidade": 1,
  "peso": 3.0,
  "valor": 150,
  "efeitos": "",
  "dano": "1d8",
  "tipo_dano": "cortante",
  "tipo_arma": "espada longa",
  "habilidade_requerida": "Armas Marciais"
}
```

### `Armadura`

| Extra field | Type | Notes |
|---|---|---|
| `valor_defesa` | int | Flat defence bonus |
| `localizacao` | string | Body slot, e.g. `"peito"`, `"cabeça"` |
| `tipo_armadura` | string | e.g. `"leve"`, `"média"`, `"pesada"` |

```json
{
  "nome": "Cota de Malha",
  "descricao": "Anéis de aço entrelaçados.",
  "quantidade": 1,
  "peso": 20.0,
  "valor": 300,
  "efeitos": "",
  "valor_defesa": 5,
  "localizacao": "peito",
  "tipo_armadura": "média"
}
```

### `Consumível`

| Extra field | Type | Notes |
|---|---|---|
| `usos` | int | Number of uses remaining |
| `efeito_uso` | string | What happens when consumed |

```json
{
  "nome": "Ração de viagem",
  "descricao": "Comida compacta para a estrada.",
  "quantidade": 5,
  "peso": 0.5,
  "valor": 2,
  "efeitos": "",
  "usos": 1,
  "efeito_uso": "Recupera 1 ponto de Fome"
}
```

### `Poção`

| Extra field | Type | Notes |
|---|---|---|
| `usos` | int | Doses remaining |
| `efeito_uso` | string | Effect on consumption |
| `duracao` | string | Effect duration, e.g. `"1 hora"` |

```json
{
  "nome": "Poção de Cura Menor",
  "descricao": "Líquido vermelho que borbulha levemente.",
  "quantidade": 2,
  "peso": 0.3,
  "valor": 50,
  "efeitos": "",
  "usos": 1,
  "efeito_uso": "Cura 2d4+2 pontos de vida",
  "duracao": "instantâneo"
}
```

### `Ferramenta`

| Extra field | Type | Notes |
|---|---|---|
| `habilidade_requerida` | string | Linked skill |
| `bonus_habilidade` | string | Bonus granted, e.g. `"+2"` |

```json
{
  "nome": "Ferramentas de Ladrão",
  "descricao": "Conjunto de gazuas e ferramentas finas.",
  "quantidade": 1,
  "peso": 1.0,
  "valor": 25,
  "efeitos": "",
  "habilidade_requerida": "Ladinagem",
  "bonus_habilidade": "+2"
}
```

### `Material`

| Extra field | Type | Notes |
|---|---|---|
| `qualidade` | string | e.g. `"bruto"`, `"refinado"`, `"raro"` |
| `uso_craft` | string | What it can be crafted into |

```json
{
  "nome": "Minério de Ferro",
  "descricao": "Fragmento de minério ainda não processado.",
  "quantidade": 10,
  "peso": 2.0,
  "valor": 1,
  "efeitos": "",
  "qualidade": "bruto",
  "uso_craft": "Barra de Ferro"
}
```

### `Informação` *(new type — maps, cartas, pergaminhos)*

| Extra field | Type | Notes |
|---|---|---|
| `conteudo` | string | The actual information / text of the document |
| `idioma` | string | Language it is written in |

```json
{
  "nome": "Mapa da Masmorra",
  "descricao": "Mapa rabiscado em couro curtido.",
  "quantidade": 1,
  "peso": 0.1,
  "valor": 0,
  "efeitos": "",
  "conteudo": "Indica uma câmara secreta atrás da cachoeira no nível B2.",
  "idioma": "Comum"
}
```

---

### Backend Go structs (`backend/internal/model/item.go`)

```go
type ItemBase struct {
    Nome      string  `json:"nome"`
    Descricao string  `json:"descricao"`
    Quantidade int    `json:"quantidade"`
    Peso      float64 `json:"peso"`
    Valor     float64 `json:"valor"`
    Efeitos   string  `json:"efeitos"`
}

type ItemArma struct {
    ItemBase
    Dano                string `json:"dano"`
    TipoDano            string `json:"tipo_dano"`
    TipoArma            string `json:"tipo_arma"`
    HabilidadeRequerida string `json:"habilidade_requerida"`
}

type ItemArmadura struct {
    ItemBase
    ValorDefesa  int    `json:"valor_defesa"`
    Localizacao  string `json:"localizacao"`
    TipoArmadura string `json:"tipo_armadura"`
}

type ItemConsumivel struct {
    ItemBase
    Usos       int    `json:"usos"`
    EfeitoUso  string `json:"efeito_uso"`
}

type ItemPocao struct {
    ItemBase
    Usos      int    `json:"usos"`
    EfeitoUso string `json:"efeito_uso"`
    Duracao   string `json:"duracao"`
}

type ItemFerramenta struct {
    ItemBase
    HabilidadeRequerida string `json:"habilidade_requerida"`
    BonusHabilidade     string `json:"bonus_habilidade"`
}

type ItemMaterial struct {
    ItemBase
    Qualidade string `json:"qualidade"`
    UsoCraft  string `json:"uso_craft"`
}

type ItemInformacao struct {
    ItemBase
    Conteudo string `json:"conteudo"`
    Idioma   string `json:"idioma"`
}

// ItemGeral / ItemOutro use ItemBase directly — no extra fields.
```

The handler serialises the correct struct into `dados` based on the `tipo` value received in the request. Unknown/extra fields are silently dropped during deserialisation — the structs define the contract.

---

## Phase 1 — Backend: Dependencies

**Modify `backend/go.mod`:**
- Remove: `github.com/redis/go-redis/v9`
- Add: `github.com/jackc/pgx/v5` (PostgreSQL driver + pgxpool)
- Add: `github.com/supabase-community/storage-go`

No JWT library needed.

---

## Phase 2 — Backend: New/Modified Files

### 2.1 — Bug fixes first (`backend/internal/service/service.go`)

Fix `UpdateItem` and `DeleteItem` — both have inverted condition (`nome == ""` should be `nome != ""`), making item updates/deletes completely broken. Also fix key casing: service uses `"Nome"` but the JSON tag and frontend use `"nome"`.

### 2.2 — Environment variable extraction

**`backend/internal/storage/redis.go` line 22:** Change hardcoded `"redis-service:6379"` to `os.Getenv("REDIS_ADDR")` with fallback `"localhost:6379"` (temporary, until redis.go is deleted in cleanup).

**`backend/internal/router/router.go`:** Change hardcoded `"http://localhost:3000"` to `os.Getenv("CORS_ORIGIN")` with fallback `"http://localhost:3000"`.

### 2.3 — New: `backend/internal/storage/postgres.go`

Replaces `redis.go` entirely. Uses `pgxpool` for connection pooling.

Init: `pool, err = pgxpool.New(ctx, os.Getenv("DATABASE_URL"))`

Function mapping:

| Old Redis function | New SQL |
|---|---|
| `GetJogador(nome)` | `SELECT * FROM usuarios WHERE nome=$1 AND tipo='jogador'` |
| `SetNovoJogador(nome)` | `INSERT INTO usuarios (nome, tipo) VALUES ($1,'jogador') RETURNING *` |
| `GetMestre(nome)` | `SELECT * FROM usuarios WHERE nome=$1 AND tipo='mestre'` |
| `SetNovoMestre(nome)` | `INSERT INTO usuarios (nome, tipo) VALUES ($1,'mestre') RETURNING *` |
| `GetAllJogadores()` | `SELECT * FROM usuarios WHERE tipo='jogador'` |
| `GetJogadorByID(id)` | `SELECT * FROM usuarios WHERE id=$1` |
| `CreateCampanha(c)` | `INSERT INTO campanhas (...) RETURNING *` |
| `GetCampanhasByMestre(id)` | `SELECT * FROM campanhas WHERE mestre_id=$1` |
| `GetCampanhasByJogador(id)` | `SELECT c.* FROM campanhas c JOIN campanha_jogadores cj ON c.id=cj.campanha_id WHERE cj.jogador_id=$1` |
| `GetCampanhaByID(id)` | `SELECT * FROM campanhas WHERE id=$1` |
| `UpdateTemplateCampanha(...)` | `UPDATE campanhas SET ... WHERE id=$1` |
| `AdicionarJogadorCampanha(...)` | `INSERT INTO campanha_jogadores VALUES ($1,$2) ON CONFLICT DO NOTHING` |
| `RemoverJogadorCampanha(...)` | `DELETE FROM campanha_jogadores WHERE campanha_id=$1 AND jogador_id=$2` |
| `GetJogadoresPorCampanha(id)` | `SELECT u.* FROM usuarios u JOIN campanha_jogadores cj ON u.id=cj.jogador_id WHERE cj.campanha_id=$1` |
| `CreatePersonagem(p)` | `INSERT INTO personagens (...) RETURNING *` |
| `GetPersonagemByID(id)` | `SELECT * FROM personagens WHERE id=$1` |
| `GetPersonagensByJogador(id)` | `SELECT * FROM personagens WHERE jogador_id=$1` |
| `GetPersonagensByCampanha(id)` | `SELECT * FROM personagens WHERE campanha_id=$1` |
| `GetPersonagensByCampanhaJogador(c,j)` | `SELECT * FROM personagens WHERE campanha_id=$1 AND jogador_id=$2` |
| `UpdatePersonagem(p)` | `UPDATE personagens SET ... WHERE id=$1` |
| `DeletePersonagem(id)` | `DELETE FROM personagens WHERE id=$1` |
| `GetItensByPersonagem(id)` | `SELECT id, tipo, dados FROM itens WHERE personagem_id=$1 ORDER BY criado_em` |
| *(new)* `GetItensByCampanha(id)` | `SELECT id, tipo, dados FROM itens WHERE campanha_id=$1 ORDER BY criado_em` |
| `AddItem(campanhaID, personagemID *string, tipo, dados)` | `INSERT INTO itens (campanha_id, personagem_id, tipo, dados) VALUES ($1,$2,$3,$4) RETURNING id` |
| `UpdateItem(itemID, tipo, dados)` | `UPDATE itens SET tipo=$1, dados=$2 WHERE id=$3` |
| `DeleteItem(itemID)` | `DELETE FROM itens WHERE id=$1` |

### 2.4 — New: `backend/internal/model/usuario.go`

Replaces `model/jogador.go`:

```go
type Usuario struct {
    ID   string `json:"id"`
    Nome string `json:"nome"`
    Tipo string `json:"tipo"` // "jogador" or "mestre"
}
```

Update `Personagem` to use `uuid.New().String()` for ID (remove `base64` generation).

**Update `backend/internal/model/item.go`:**

```go
type Item struct {
    ID           string         `json:"id"`
    CampanhaID   string         `json:"campanha_id"`
    PersonagemID *string        `json:"personagem_id"` // nullable — nil = mestre pool
    Tipo         string         `json:"tipo"`          // "Geral", "Arma", "Armadura", etc.
    Dados        map[string]any `json:"dados"`         // free-form, varies by tipo
}
```

### 2.5 — Update: `backend/internal/handler/handler.go`

**Login/signup handlers** remain the same structure — return `{ id, nome, tipo }`. No token.

**Item handlers updated for new schema:**
- `AddItem`: accepts `{ campanha_id, personagem_id (optional/nullable), tipo, dados }` in request body
- `UpdateItem`: accepts `{ id, tipo, dados }` — UUID-based, not nome-based (fixes broken name lookup)
- `DeleteItem`: accepts `{ id }` — UUID-based
- Add `GetItensByCampanha` handler at `GET /api/campanhas/:id/itens`

**Remove:** `GET /api/campanhas` handler and route (broken in Redis, unused by frontend).

**Add:** `GET /health` → `200 OK` (for Render health checks).

**Image upload:** Replace `os.MkdirAll`/`SaveUploadedFile` with `storage.UploadImagemToSupabase(...)` which returns a full Supabase public URL. Store that URL in `personagem.imagem_url`.

### 2.6 — New: `backend/internal/storage/supabase.go`

```go
func UploadImagemToSupabase(personagemID string, file multipart.File, contentType string) (string, error)
// Uses SUPABASE_URL and SUPABASE_KEY (service_role) env vars
// Bucket: "personagens-imagens" (public bucket, created manually in Supabase dashboard)
// Returns full public URL: SUPABASE_URL + "/storage/v1/object/public/personagens-imagens/" + filename
```

### 2.7 — Update: `backend/main.go`

```go
storage.NewPostgresStorage()  // replaces storage.NewMemoryStorage()
```

### 2.8 — Update: `backend/Dockerfile`

Switch final stage from `scratch` to `gcr.io/distroless/static` — backend makes HTTPS calls to Supabase and needs TLS certificates.

---

## Phase 3 — Frontend Changes

### 3.1 — Update: `frontend/src/api/api.js`

- `BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080'`
- Auth stays as-is — user object in localStorage, no tokens
- Item functions updated for new schema:
  - `apiAddItem(personagemId, campanhaId, tipo, dados)` → body: `{ campanha_id, personagem_id, tipo, dados }`
  - `apiUpdateItem(itemId, tipo, dados)` → body: `{ id, tipo, dados }` (UUID-based, replaces nome-based)
  - `apiDeleteItem(itemId)` → body: `{ id }` (UUID-based, replaces nome-based)
- Fix URL typo: standardize `/itens` everywhere (current code has both `/itens` and `/items`)

### 3.2 — Update: `frontend/src/pages/LoginPage.js`

Remove the `" - Mestre"` suffix hack — the backend now distinguishes user type via route (`/mestre/login` vs `/jogador/login`) and the `tipo` column. Name is stored and displayed clean.

### 3.3 — Update: `frontend/src/pages/PersonagemFicha.js`

- Remove hardcoded `http://localhost:8080` prefix from avatar `<img src>` — backend returns full Supabase URL now
- Item delete/update: pass `item.id` (UUID) instead of `item.nome`
- Items from API are now `{ id, campanha_id, personagem_id, tipo, dados }` — update display to read `item.dados.nome`, `item.dados.descricao`, etc.
- The `tipo` field drives which extra fields are shown (already the pattern in `ItemModal.js`, no structural change needed there)

### 3.4 — Update: `frontend/src/components/ItemModal.js`

On save, send `{ tipo, dados: { nome, descricao, quantidade, peso, valor, efeitos, ...tipo-specific fields } }` — `tipo` top-level, everything else inside `dados`.

On load (edit mode), receive the same shape and unpack `dados` into form state. The `efeitos` textarea stays as-is (plain text).

Add the `Informação` type to the `<select>` and render its specific fields (`conteudo` textarea, `idioma` input) when selected. Also add `tipo_armadura` field to the Armadura section and `duracao` field to Poção (currently not in the form). The full field set per type is documented in the **Item Type Catalogue** above.

### 3.5 — Fix: `frontend/src/pages/JogadorDashboard.js`

Fix `apiGetCampanhaById()` called with no argument (existing bug).

---

## Phase 4 — Environment Files

### `backend/.env` (local dev, git-ignored)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerenciador_rpg
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:3000
GIN_MODE=debug
```

### `frontend/.env` (local dev, git-ignored)

```env
REACT_APP_API_URL=http://localhost:8080
```

Both files created as stubs with placeholder values and added to `.gitignore`. Fill in real values before running locally.

---

## Phase 5 — Deployment Configuration

### `frontend/vercel.json` (new file)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Replaces nginx's `try_files` for React Router. Vercel build settings: framework = Create React App, root dir = `frontend`.

### `render.yaml` (new file at repo root)

```yaml
services:
  - type: web
    name: gerenciador-rpg-backend
    runtime: go
    rootDir: backend
    buildCommand: go build -o main .
    startCommand: ./main
    healthCheckPath: /health
    envVars:
      - key: GIN_MODE
        value: release
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: CORS_ORIGIN
        sync: false
```

### Supabase manual setup (not code)

1. Create project → run `db/schema.sql` in SQL editor
2. Create Storage bucket `personagens-imagens` with public access enabled
3. Copy `DATABASE_URL` (Settings → Database → URI) and `service_role` key (Settings → API)

### Environment variables reference

**Render (backend):**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL URI |
| `SUPABASE_URL` | `https://[ref].supabase.co` |
| `SUPABASE_KEY` | service_role key from Supabase dashboard |
| `CORS_ORIGIN` | exact Vercel URL e.g. `https://gerenciador-rpg.vercel.app` |
| `GIN_MODE` | `release` |

**Vercel (frontend):**

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | Render backend URL |

---

## Phase 6 — Cleanup (deletions)

| Action | Target |
|---|---|
| Delete file | `backend/internal/storage/redis.go` |
| Delete file | `backend/internal/model/jogador.go` |
| Delete file | `k8s/01-redis.yaml` |
| Delete file | `frontend/src/components/Inventario.js` (unused — active inventory UI is inline in `PersonagemFicha.js`) |
| Remove from `docker-compose.yaml` | `redis-service` block, `redis-data` volume, `depends_on: redis-service` from backend |
| Remove from `backend/go.mod` | `github.com/redis/go-redis/v9` and its transitive deps |
| Remove from `backend/router/router.go` | `r.Static("/uploads", "./uploads")` route |
| Remove from `backend/router/router.go` | `GET /api/campanhas` route |
| Remove from `backend/handler/handler.go` | Local file upload logic (`os.MkdirAll`, `SaveUploadedFile`) |
| Remove from `frontend/nginx.conf` | `/api/` and `/jogador/login` proxy blocks (Vercel calls Render directly, no nginx proxy needed) |

---

## Implementation Order

1. **Bug fixes** — `service.go` item CRUD conditions; `JogadorDashboard.js` missing arg
2. **Env var extraction** — `CORS_ORIGIN` in router, `REDIS_ADDR` in storage (temporary)
3. **PostgreSQL storage layer** — write `postgres.go`, `db/schema.sql`; update `main.go`; test against local Postgres
4. **Model updates** — `usuario.go`, UUID-based IDs, new `Item` struct
5. **Handler updates** — item API contract change (UUID-based), new `GetItensByCampanha`, remove broken route, add `/health`
6. **Supabase image upload** — `supabase.go`; update image upload handler
7. **Frontend API contract** — item UUID ops and new shape; `LoginPage.js` name suffix removal; fix image URL; update `ItemModal.js`
8. **Env files** — create `backend/.env` and `frontend/.env` stubs; update `.gitignore`
9. **Deployment files** — `frontend/vercel.json`, `render.yaml`
10. **Cleanup** — delete Redis files, update `docker-compose.yaml`, update `go.mod`

---

## Verification

- Local: run backend with `backend/.env` pointing at local Postgres; run frontend with `frontend/.env`
- Auth flow: login as jogador and mestre, confirm user object stored, confirm name has no `" - Mestre"` suffix
- Item CRUD: create, update, delete an item — confirm all three work (previously broken due to inverted condition)
- Item types: create a Geral, Arma, and Armadura item — confirm type-specific fields saved and displayed correctly
- Image upload: upload avatar, confirm Supabase Storage URL returned and displayed (no `localhost:8080` prefix)
- Deploy: push → Vercel auto-deploys frontend → deploy backend on Render → confirm CORS works cross-origin
