package model

import "github.com/google/uuid"

// Personagem é a ficha preenchida pelo jogador.
type Personagem struct {
	ID         string `json:"id"`
	Nome       string `json:"nome"`
	JogadorID  string `json:"jogador_id"`
	CampanhaID string `json:"campanha_id"`

	DescricaoFisica string `json:"descricao_fisica"`
	Caracteristicas string `json:"caracteristicas"`

	Vida       int `json:"vida"`
	VidaMaxima int `json:"vida_maxima"`

	ImagemURL string `json:"imagem_url"`

	// Valores dinâmicos definidos pelo template da campanha.
	// A chave é o nome do atributo/habilidade; o valor é numérico.
	AtributosBase map[string]int `json:"atributos_base"`
	Habilidades   map[string]int `json:"habilidades"`
	Outros        map[string]int `json:"outros"`
}

func NewPersonagem(nome, jogadorID, campanhaID string) Personagem {
	return Personagem{
		ID:            uuid.New().String(),
		Nome:          nome,
		JogadorID:     jogadorID,
		CampanhaID:    campanhaID,
		Vida:          0,
		VidaMaxima:    0,
		AtributosBase: make(map[string]int),
		Habilidades:   make(map[string]int),
		Outros:        make(map[string]int),
	}
}
