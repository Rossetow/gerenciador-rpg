package model

// LoginRequest é usado para login e cadastro por nome.
type LoginRequest struct {
	Nome string `json:"nome" binding:"required"`
}

// TemplateUpdateRequest é usado para atualizar o template de uma campanha.
type TemplateUpdateRequest struct {
	TemplateAtributosBase []string `json:"template_atributos_base"`
	TemplateHabilidades   []string `json:"template_habilidades"`
	TemplateOutros        []string `json:"template_outros"`
}

// ItemCreateRequest é usado para adicionar um item.
// tipo: "Geral", "Arma", "Armadura", "Consumível", "Poção", "Ferramenta", "Material", "Informação", "Outro"
// dados: campos específicos do tipo (ver model/item.go)
type ItemCreateRequest struct {
	CampanhaID   string         `json:"campanha_id" binding:"required"`
	PersonagemID *string        `json:"personagem_id"` // nullable
	Tipo         string         `json:"tipo" binding:"required"`
	Dados        map[string]any `json:"dados" binding:"required"`
}

// ItemUpdateRequest usa o UUID do item para identificá-lo.
type ItemUpdateRequest struct {
	ID    string         `json:"id" binding:"required"`
	Tipo  string         `json:"tipo" binding:"required"`
	Dados map[string]any `json:"dados" binding:"required"`
}

// ItemDeleteRequest usa o UUID do item para identificá-lo.
type ItemDeleteRequest struct {
	ID string `json:"id" binding:"required"`
}
