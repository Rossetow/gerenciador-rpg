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

-- personagem_id is nullable: NULL means the item belongs to the campaign (mestre pool),
-- not assigned to any character. campanha_id is always required.
CREATE TABLE itens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campanha_id   UUID NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    personagem_id UUID REFERENCES personagens(id) ON DELETE CASCADE,
    tipo          TEXT NOT NULL DEFAULT 'Geral',
    dados         JSONB NOT NULL DEFAULT '{}',
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
