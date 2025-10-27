package model

import "github.com/google/uuid"

// Campanha armazena as regras e o template da ficha.
type Campanha struct {
	ID                  string   `json:"id"`
	Nome                string   `json:"nome"`
	MestreID            string   `json:"mestre_id"` // ID do Jogador que é o Mestre
	Descricao           string   `json:"descricao"`

	// --- O TEMPLATE DINÂMICO ---
	// O Mestre define quais campos existirão.
	// São apenas listas de nomes (strings).
	TemplateAtributosBase []string `json:"template_atributos_base"` // Ex: ["Força", "Destreza", "Magia"]
	TemplateHabilidades   []string `json:"template_habilidades"`    // Ex: ["Lutar", "Furtividade", "Medicina"]
	TemplateOutros        []string `json:"template_outros"`         // Ex: ["Vida", "Mana", "Sanidade"]
}

// Construtor
func NewCampanha(nome, mestreID, desc string) Campanha {
	return Campanha{
		ID:                  uuid.New().String(),
		Nome:                nome,
		MestreID:            mestreID,
		Descricao:           desc,
		// Inicializa as slices vazias (melhor que 'nil' para JSON)
		TemplateAtributosBase: make([]string, 0), 
		TemplateHabilidades:   make([]string, 0),
		TemplateOutros:        make([]string, 0),
	}
}

func NewUUID() string {
	return uuid.New().String()
}