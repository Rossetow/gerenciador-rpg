package model

// LoginRequest é usado para o "login" de identificação.
type LoginRequest struct {
	Nome string `json:"nome" binding:"required"`
}

// CampanhaCreateRequest é usado para CRIAR uma nova campanha.
// Note que não tem ID, templates, etc.
type CampanhaCreateRequest struct {
	Nome      string `json:"nome" binding:"required"`
	MestreID  string `json:"mestre_id" binding:"required"`
	Descricao string `json:"descricao"`
}

// TemplateUpdateRequest é usado para ATUALIZAR o template.
type TemplateUpdateRequest struct {
	TemplateAtributosBase []string `json:"template_atributos_base"`
	TemplateHabilidades   []string `json:"template_habilidades"`
	TemplateOutros        []string `json:"template_outros"`
}

// PersonagemCreateRequest é usado para CRIAR um novo personagem.
type PersonagemCreateRequest struct {
	Nome          string         `json:"nome" binding:"required"`
	JogadorID     string         `json:"jogador_id" binding:"required"`
	CampanhaID    string         `json:"campanha_id" binding:"required"`
	AtributosBase map[string]int `json:"atributos_base"`
	Habilidades   map[string]int `json:"habilidades"`
}

// ItemCreateRequest é usado para criar ou atualizar um item.
// Ele espera um JSON no formato: {"dados": {...}}
type ItemCreateRequest struct {
	// 'Dados' contém o JSON completo do item (Arma, Armadura, etc.)
	Item map[string]any `json:"item" binding:"required"`
}

type ItemUpdateRequest struct {
	ItemNome string `json:"nome" binding:"required"`
	Item map[string]any `json:"item" binding:"required"`
}

type ItemDeleteRequest struct {
	ItemNome string `json:"nome" binding:"required"`
}

// Para o PUT (update) do personagem, como o frontend envia o objeto
// inteiro (incluindo o inventário), continuaremos a fazer o bind
// direto para a struct 'models.Personagem' principal.
