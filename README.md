# Gerenciador de RPG

Aplicação web para gerenciar campanhas e fichas de personagens de RPG de mesa. Mestres criam e configuram campanhas; jogadores criam personagens, preenchem atributos, gerenciam inventário e fazem upload de avatar.

## Funcionalidades

- **Mestre**: criar campanhas, definir templates de atributos/habilidades/outros, adicionar e remover jogadores, visualizar todos os personagens da campanha
- **Jogador**: entrar em campanhas, criar personagens vinculados a uma campanha, editar ficha (atributos, habilidades, vida), gerenciar inventário com itens tipados (arma, armadura, consumível, poção, ferramenta, material, informação)
- **Imagens**: upload de avatar por personagem, armazenado no Supabase Storage

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + React Router 7 |
| Backend | Go + Gin |
| Banco de dados | PostgreSQL (Supabase) |
| Armazenamento de imagens | Supabase Storage |
| Deploy frontend | Vercel |
| Deploy backend | Render |

## Arquitetura de deploy

```
Usuário
  │
  ▼
Vercel (frontend — React SPA)
  │  REACT_APP_API_URL
  ▼
Render (backend — Go/Gin)
  │  DATABASE_URL          SUPABASE_URL + SUPABASE_KEY
  ▼                              ▼
Supabase PostgreSQL       Supabase Storage
(tabelas: usuarios,        (bucket: personagens-imagens)
 campanhas, personagens,
 itens, campanha_jogadores)
```

- O frontend é uma SPA estática servida pelo Vercel. Todas as rotas redirecionam para `index.html` via `vercel.json`.
- O backend é um binário Go deployado no Render como web service. Expõe uma API REST em `/api/*` e um health check em `/health`.
- O banco de dados e o bucket de imagens vivem no Supabase. O backend se conecta ao PostgreSQL via `pgxpool` usando o connection pooler do Supabase (PgBouncer), com `QueryExecModeSimpleProtocol` para compatibilidade.

## Estrutura do repositório

```
gerenciador-rpg/
├── backend/
│   ├── main.go
│   ├── internal/
│   │   ├── handler/      # handlers HTTP (Gin)
│   │   ├── service/      # lógica de negócio
│   │   ├── storage/      # postgres.go + supabase/
│   │   ├── model/        # structs Go
│   │   └── router/       # rotas e CORS
│   ├── db/
│   │   └── schema.sql    # schema PostgreSQL
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/        # LoginPage, JogadorDashboard, MestreDashboard, etc.
│   │   ├── components/   # ItemModal, etc.
│   │   ├── api/          # api.js — todas as chamadas HTTP
│   │   └── context/      # AuthContext
│   ├── vercel.json
│   └── .env.example
└── render.yaml           # configuração de deploy do backend no Render
```

## Rodando localmente

### Pré-requisitos

- Go 1.22+
- Node 18+
- PostgreSQL rodando localmente (ou conexão com Supabase)

### Backend

```bash
cd backend
cp .env.example .env
# edite .env com suas credenciais
go run .
```

### Frontend

```bash
cd frontend
cp .env.example .env
# edite .env com REACT_APP_API_URL=http://localhost:8080
npm install
npm start
```

### Com Docker Compose

```bash
# crie backend/.env e frontend/.env a partir dos exemplos
docker compose up --build
```

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição                                                                         |
|---|-----------------------------------------------------------------------------------|
| `DATABASE_URL` | URI de conexão PostgreSQL (ex: `postgresql://user:pass@host:5432/db`)             |
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxx.supabase.co`)                          |
| `SUPABASE_BUCKET` | Bucket do Supabase                                                                |
| `SUPABASE_S3_ENDPOINT` | Endpoint do S3 do Supabase (ex: `https://xxxx.storage.supabase.co/storage/v1/s3`) |
| `SUPABASE_S3_ACCESS_KEY` | Chave pública do S3                                                               |
| `SUPABASE_S3_SECRET_KEY` | Chave secreta do S3                                                               |
| `CORS_ORIGIN` | Origin permitida pelo CORS (ex: `https://seu-app.vercel.app`) |
| `GIN_MODE` | `debug` em dev, `release` em produção |

### Frontend (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `REACT_APP_API_URL` | URL base da API (ex: `https://seu-backend.onrender.com`) |

## Setup do Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute `backend/db/schema.sql` no SQL Editor do projeto
3. Crie um bucket de Storage chamado `personagens-imagens` com acesso público
4. Copie a `DATABASE_URL` em Settings → Database → URI (use a URI do **connection pooler**)
5. Copie a `service_role` key em Settings → API

## Deploy

### Render (backend)

O arquivo `render.yaml` na raiz do repositório configura o serviço automaticamente. Configure as variáveis de ambiente (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, `CORS_ORIGIN`, `JWT_SECRET`) no dashboard do Render.

### Vercel (frontend)

Conecte o repositório no dashboard do Vercel com as configurações:
- **Root directory**: `frontend`
- **Framework**: Create React App
- **Environment variable**: `REACT_APP_API_URL` apontando para a URL do backend no Render
