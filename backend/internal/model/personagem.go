package model

import (
	"encoding/base64"
)

// Personagem é a ficha preenchida pelo jogador.
// Ela "implementa" o template da Campanha.
type Personagem struct {
	ID         string `json:"id"`
	Nome       string `json:"nome"`
	JogadorID  string `json:"jogador_id"`  // O "dono" da ficha
	CampanhaID string `json:"campanha_id"` // A qual campanha pertence

	// Campos estáticos (provavelmente toda ficha tem)
	DescricaoFisica string `json:"descricao_fisica"`
	Caracteristicas string `json:"caracteristicas"`

	// --- OS VALORES DINÂMICOS ---
	// O Jogador preenche os valores.
	// A *chave* do map (string) deve ser um item do Template da Campanha.
	// O *valor* (int) é o valor do atributo.

	// Ex: {"Força": 10, "Destreza": 14, "Magia": 5}
	AtributosBase map[string]int `json:"atributos_base"`

	// Ex: {"Lutar": 5, "Furtividade": 2}
	Habilidades map[string]int `json:"habilidades"`

	// Ex: {"Vida": 10, "Mana": 15}
	Outros map[string]int `json:"outros"`

	// O inventário pode continuar sendo estático
	Inventario []Item `json:"inventario"`
}

// Construtor
func NewPersonagem(nome, jogadorID, campanhaID string) Personagem {
	return Personagem{
		ID:         base64.StdEncoding.EncodeToString([]byte(nome + campanhaID)),
		Nome:       nome,
		JogadorID:  jogadorID,
		CampanhaID: campanhaID,
		// Inicializa os maps e slices
		AtributosBase: make(map[string]int),
		Habilidades:   make(map[string]int),
		Outros:        make(map[string]int),
		Inventario:    make([]Item, 0),
	}
}
