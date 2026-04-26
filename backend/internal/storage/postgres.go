package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"gerenciador-de-fichas/internal/model"

	"github.com/jackc/pgx/v5/pgxpool"
)

var pool *pgxpool.Pool

func NewPostgresStorage() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL env var not set")
	}

	var err error
	pool, err = pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Could not connect to PostgreSQL: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Could not ping PostgreSQL: %v", err)
	}

	fmt.Println("Connected to PostgreSQL")
}

// --- USUARIOS ---

func GetJogador(nome string) (model.Usuario, error) {
	var u model.Usuario
	err := pool.QueryRow(context.Background(),
		`SELECT id, nome, tipo FROM usuarios WHERE nome=$1 AND tipo='jogador'`, nome,
	).Scan(&u.ID, &u.Nome, &u.Tipo)
	if err != nil {
		return model.Usuario{}, fmt.Errorf("jogador não encontrado: %w", err)
	}
	return u, nil
}

func SetNovoJogador(nome string) (model.Usuario, error) {
	var u model.Usuario
	err := pool.QueryRow(context.Background(),
		`INSERT INTO usuarios (nome, tipo) VALUES ($1, 'jogador') RETURNING id, nome, tipo`, nome,
	).Scan(&u.ID, &u.Nome, &u.Tipo)
	if err != nil {
		return model.Usuario{}, fmt.Errorf("erro ao criar jogador: %w", err)
	}
	return u, nil
}

func GetMestre(nome string) (model.Usuario, error) {
	var u model.Usuario
	err := pool.QueryRow(context.Background(),
		`SELECT id, nome, tipo FROM usuarios WHERE nome=$1 AND tipo='mestre'`, nome,
	).Scan(&u.ID, &u.Nome, &u.Tipo)
	if err != nil {
		return model.Usuario{}, fmt.Errorf("mestre não encontrado: %w", err)
	}
	return u, nil
}

func SetNovoMestre(nome string) (model.Usuario, error) {
	var u model.Usuario
	err := pool.QueryRow(context.Background(),
		`INSERT INTO usuarios (nome, tipo) VALUES ($1, 'mestre') RETURNING id, nome, tipo`, nome,
	).Scan(&u.ID, &u.Nome, &u.Tipo)
	if err != nil {
		return model.Usuario{}, fmt.Errorf("erro ao criar mestre: %w", err)
	}
	return u, nil
}

func GetAllJogadores() ([]model.Usuario, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, nome, tipo FROM usuarios WHERE tipo='jogador'`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jogadores []model.Usuario
	for rows.Next() {
		var u model.Usuario
		if err := rows.Scan(&u.ID, &u.Nome, &u.Tipo); err != nil {
			return nil, err
		}
		jogadores = append(jogadores, u)
	}
	if jogadores == nil {
		jogadores = []model.Usuario{}
	}
	return jogadores, nil
}

func GetJogadorByID(id string) (model.Usuario, error) {
	var u model.Usuario
	err := pool.QueryRow(context.Background(),
		`SELECT id, nome, tipo FROM usuarios WHERE id=$1`, id,
	).Scan(&u.ID, &u.Nome, &u.Tipo)
	if err != nil {
		return model.Usuario{}, fmt.Errorf("usuário não encontrado: %w", err)
	}
	return u, nil
}

// --- CAMPANHAS ---

func CreateCampanha(c model.Campanha) (model.Campanha, error) {
	var result model.Campanha
	err := pool.QueryRow(context.Background(),
		`INSERT INTO campanhas (nome, mestre_id, descricao, template_atributos_base, template_habilidades, template_outros)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, nome, mestre_id, descricao, template_atributos_base, template_habilidades, template_outros`,
		c.Nome, c.MestreID, c.Descricao,
		c.TemplateAtributosBase, c.TemplateHabilidades, c.TemplateOutros,
	).Scan(
		&result.ID, &result.Nome, &result.MestreID, &result.Descricao,
		&result.TemplateAtributosBase, &result.TemplateHabilidades, &result.TemplateOutros,
	)
	if err != nil {
		return model.Campanha{}, fmt.Errorf("erro ao criar campanha: %w", err)
	}
	return result, nil
}

func GetCampanhaByID(id string) (model.Campanha, error) {
	var c model.Campanha
	err := pool.QueryRow(context.Background(),
		`SELECT id, nome, mestre_id, descricao, template_atributos_base, template_habilidades, template_outros
		 FROM campanhas WHERE id=$1`, id,
	).Scan(
		&c.ID, &c.Nome, &c.MestreID, &c.Descricao,
		&c.TemplateAtributosBase, &c.TemplateHabilidades, &c.TemplateOutros,
	)
	if err != nil {
		return model.Campanha{}, fmt.Errorf("campanha não encontrada: %w", err)
	}
	return c, nil
}

func GetCampanhasByMestre(mestreID string) ([]model.Campanha, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, nome, mestre_id, descricao, template_atributos_base, template_habilidades, template_outros
		 FROM campanhas WHERE mestre_id=$1`, mestreID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanCampanhas(rows)
}

func GetCampanhasByJogador(jogadorID string) ([]model.Campanha, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT c.id, c.nome, c.mestre_id, c.descricao, c.template_atributos_base, c.template_habilidades, c.template_outros
		 FROM campanhas c
		 JOIN campanha_jogadores cj ON c.id = cj.campanha_id
		 WHERE cj.jogador_id=$1`, jogadorID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanCampanhas(rows)
}

func UpdateTemplateCampanha(c model.Campanha) error {
	_, err := pool.Exec(context.Background(),
		`UPDATE campanhas
		 SET template_atributos_base=$1, template_habilidades=$2, template_outros=$3
		 WHERE id=$4`,
		c.TemplateAtributosBase, c.TemplateHabilidades, c.TemplateOutros, c.ID,
	)
	return err
}

func GetJogadoresPorCampanha(campanhaID string) ([]model.Usuario, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT u.id, u.nome, u.tipo
		 FROM usuarios u
		 JOIN campanha_jogadores cj ON u.id = cj.jogador_id
		 WHERE cj.campanha_id=$1`, campanhaID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jogadores []model.Usuario
	for rows.Next() {
		var u model.Usuario
		if err := rows.Scan(&u.ID, &u.Nome, &u.Tipo); err != nil {
			return nil, err
		}
		jogadores = append(jogadores, u)
	}
	if jogadores == nil {
		jogadores = []model.Usuario{}
	}
	return jogadores, nil
}

func AdicionarJogadorCampanha(campanhaID, jogadorID string) error {
	_, err := pool.Exec(context.Background(),
		`INSERT INTO campanha_jogadores (campanha_id, jogador_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		campanhaID, jogadorID,
	)
	return err
}

func RemoverJogadorCampanha(campanhaID, jogadorID string) error {
	_, err := pool.Exec(context.Background(),
		`DELETE FROM campanha_jogadores WHERE campanha_id=$1 AND jogador_id=$2`,
		campanhaID, jogadorID,
	)
	return err
}

// --- PERSONAGENS ---

func CreatePersonagem(p model.Personagem) (model.Personagem, error) {
	atributosJSON, _ := json.Marshal(p.AtributosBase)
	habilidadesJSON, _ := json.Marshal(p.Habilidades)
	outrosJSON, _ := json.Marshal(p.Outros)

	var result model.Personagem
	var atributosRaw, habilidadesRaw, outrosRaw []byte

	err := pool.QueryRow(context.Background(),
		`INSERT INTO personagens (nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		 RETURNING id, nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros`,
		p.Nome, p.JogadorID, p.CampanhaID, p.DescricaoFisica, p.Caracteristicas,
		p.Vida, p.VidaMaxima, p.ImagemURL, atributosJSON, habilidadesJSON, outrosJSON,
	).Scan(
		&result.ID, &result.Nome, &result.JogadorID, &result.CampanhaID,
		&result.DescricaoFisica, &result.Caracteristicas,
		&result.Vida, &result.VidaMaxima, &result.ImagemURL,
		&atributosRaw, &habilidadesRaw, &outrosRaw,
	)
	if err != nil {
		return model.Personagem{}, fmt.Errorf("erro ao criar personagem: %w", err)
	}

	json.Unmarshal(atributosRaw, &result.AtributosBase)
	json.Unmarshal(habilidadesRaw, &result.Habilidades)
	json.Unmarshal(outrosRaw, &result.Outros)

	return result, nil
}

func GetPersonagemByID(id string) (model.Personagem, error) {
	var p model.Personagem
	var atributosRaw, habilidadesRaw, outrosRaw []byte

	err := pool.QueryRow(context.Background(),
		`SELECT id, nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros
		 FROM personagens WHERE id=$1`, id,
	).Scan(
		&p.ID, &p.Nome, &p.JogadorID, &p.CampanhaID,
		&p.DescricaoFisica, &p.Caracteristicas,
		&p.Vida, &p.VidaMaxima, &p.ImagemURL,
		&atributosRaw, &habilidadesRaw, &outrosRaw,
	)
	if err != nil {
		return model.Personagem{}, fmt.Errorf("personagem não encontrado: %w", err)
	}

	json.Unmarshal(atributosRaw, &p.AtributosBase)
	json.Unmarshal(habilidadesRaw, &p.Habilidades)
	json.Unmarshal(outrosRaw, &p.Outros)

	return p, nil
}

func GetPersonagensByJogador(jogadorID string) ([]model.Personagem, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros
		 FROM personagens WHERE jogador_id=$1`, jogadorID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPersonagens(rows)
}

func GetPersonagensByCampanha(campanhaID string) ([]model.Personagem, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros
		 FROM personagens WHERE campanha_id=$1`, campanhaID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPersonagens(rows)
}

func GetPersonagensByCampanhaJogador(campanhaID, jogadorID string) ([]model.Personagem, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, nome, jogador_id, campanha_id, descricao_fisica, caracteristicas, vida, vida_maxima, imagem_url, atributos_base, habilidades, outros
		 FROM personagens WHERE campanha_id=$1 AND jogador_id=$2`, campanhaID, jogadorID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanPersonagens(rows)
}

func UpdatePersonagem(p model.Personagem) error {
	atributosJSON, _ := json.Marshal(p.AtributosBase)
	habilidadesJSON, _ := json.Marshal(p.Habilidades)
	outrosJSON, _ := json.Marshal(p.Outros)

	_, err := pool.Exec(context.Background(),
		`UPDATE personagens
		 SET nome=$1, descricao_fisica=$2, caracteristicas=$3, vida=$4, vida_maxima=$5, imagem_url=$6,
		     atributos_base=$7, habilidades=$8, outros=$9
		 WHERE id=$10`,
		p.Nome, p.DescricaoFisica, p.Caracteristicas, p.Vida, p.VidaMaxima, p.ImagemURL,
		atributosJSON, habilidadesJSON, outrosJSON, p.ID,
	)
	return err
}

func DeletePersonagem(id string) error {
	_, err := pool.Exec(context.Background(), `DELETE FROM personagens WHERE id=$1`, id)
	return err
}

// --- ITENS ---

func GetItensByPersonagem(personagemID string) ([]model.Item, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, campanha_id, personagem_id, tipo, dados FROM itens WHERE personagem_id=$1 ORDER BY criado_em`,
		personagemID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItens(rows)
}

func GetItensByCampanha(campanhaID string) ([]model.Item, error) {
	rows, err := pool.Query(context.Background(),
		`SELECT id, campanha_id, personagem_id, tipo, dados FROM itens WHERE campanha_id=$1 ORDER BY criado_em`,
		campanhaID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItens(rows)
}

func AddItem(campanhaID string, personagemID *string, tipo string, dados map[string]any) (model.Item, error) {
	dadosJSON, err := json.Marshal(dados)
	if err != nil {
		return model.Item{}, err
	}

	var item model.Item
	var dadosRaw []byte

	err = pool.QueryRow(context.Background(),
		`INSERT INTO itens (campanha_id, personagem_id, tipo, dados)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, campanha_id, personagem_id, tipo, dados`,
		campanhaID, personagemID, tipo, dadosJSON,
	).Scan(&item.ID, &item.CampanhaID, &item.PersonagemID, &item.Tipo, &dadosRaw)
	if err != nil {
		return model.Item{}, fmt.Errorf("erro ao criar item: %w", err)
	}

	json.Unmarshal(dadosRaw, &item.Dados)
	return item, nil
}

func UpdateItem(itemID string, tipo string, dados map[string]any) error {
	dadosJSON, err := json.Marshal(dados)
	if err != nil {
		return err
	}
	_, err = pool.Exec(context.Background(),
		`UPDATE itens SET tipo=$1, dados=$2 WHERE id=$3`,
		tipo, dadosJSON, itemID,
	)
	return err
}

func DeleteItem(itemID string) error {
	_, err := pool.Exec(context.Background(), `DELETE FROM itens WHERE id=$1`, itemID)
	return err
}

// --- helpers ---

func scanCampanhas(rows interface{ Next() bool; Scan(...any) error; Err() error }) ([]model.Campanha, error) {
	var campanhas []model.Campanha
	for rows.Next() {
		var c model.Campanha
		if err := rows.Scan(
			&c.ID, &c.Nome, &c.MestreID, &c.Descricao,
			&c.TemplateAtributosBase, &c.TemplateHabilidades, &c.TemplateOutros,
		); err != nil {
			return nil, err
		}
		campanhas = append(campanhas, c)
	}
	if campanhas == nil {
		campanhas = []model.Campanha{}
	}
	return campanhas, rows.Err()
}

func scanPersonagens(rows interface{ Next() bool; Scan(...any) error; Err() error }) ([]model.Personagem, error) {
	var personagens []model.Personagem
	for rows.Next() {
		var p model.Personagem
		var atributosRaw, habilidadesRaw, outrosRaw []byte
		if err := rows.Scan(
			&p.ID, &p.Nome, &p.JogadorID, &p.CampanhaID,
			&p.DescricaoFisica, &p.Caracteristicas,
			&p.Vida, &p.VidaMaxima, &p.ImagemURL,
			&atributosRaw, &habilidadesRaw, &outrosRaw,
		); err != nil {
			return nil, err
		}
		json.Unmarshal(atributosRaw, &p.AtributosBase)
		json.Unmarshal(habilidadesRaw, &p.Habilidades)
		json.Unmarshal(outrosRaw, &p.Outros)
		personagens = append(personagens, p)
	}
	if personagens == nil {
		personagens = []model.Personagem{}
	}
	return personagens, rows.Err()
}

func scanItens(rows interface{ Next() bool; Scan(...any) error; Err() error }) ([]model.Item, error) {
	var itens []model.Item
	for rows.Next() {
		var item model.Item
		var dadosRaw []byte
		if err := rows.Scan(&item.ID, &item.CampanhaID, &item.PersonagemID, &item.Tipo, &dadosRaw); err != nil {
			return nil, err
		}
		json.Unmarshal(dadosRaw, &item.Dados)
		itens = append(itens, item)
	}
	if itens == nil {
		itens = []model.Item{}
	}
	return itens, rows.Err()
}
