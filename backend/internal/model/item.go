package model

// Item representa um objeto no inventário de um personagem ou no pool de uma campanha.
// personagem_id pode ser nulo (item pertence à campanha, sem dono específico).
type Item struct {
	ID           string         `json:"id"`
	CampanhaID   string         `json:"campanha_id"`
	PersonagemID *string        `json:"personagem_id"` // nullable
	Tipo         string         `json:"tipo"`
	Dados        map[string]any `json:"dados"`
}

// --- Structs tipadas por categoria de item ---
// Usadas para validar e serializar o campo Dados de acordo com o Tipo.

// ItemBase contém os campos presentes em todos os tipos de item.
type ItemBase struct {
	Nome      string  `json:"nome"`
	Descricao string  `json:"descricao"`
	Quantidade int    `json:"quantidade"`
	Peso      float64 `json:"peso"`
	Valor     float64 `json:"valor"`
	Efeitos   string  `json:"efeitos"` // texto livre, ex: "veneno: 1d4 por rodada"
}

// ItemArma representa uma arma (espada, arco, etc.)
type ItemArma struct {
	ItemBase
	Dano                string `json:"dano"`                  // ex: "1d8", "2d6+2"
	TipoDano            string `json:"tipo_dano"`             // ex: "cortante", "perfurante"
	TipoArma            string `json:"tipo_arma"`             // ex: "espada longa", "arco curto"
	HabilidadeRequerida string `json:"habilidade_requerida"` // nome da habilidade vinculada
}

// ItemArmadura representa uma peça de proteção.
type ItemArmadura struct {
	ItemBase
	ValorDefesa  int    `json:"valor_defesa"`  // bônus de defesa plano
	Localizacao  string `json:"localizacao"`   // ex: "peito", "cabeça", "pernas"
	TipoArmadura string `json:"tipo_armadura"` // ex: "leve", "média", "pesada"
}

// ItemConsumivel representa comida, materiais de uso único, etc.
type ItemConsumivel struct {
	ItemBase
	Usos      int    `json:"usos"`       // doses/usos restantes
	EfeitoUso string `json:"efeito_uso"` // o que acontece ao consumir
}

// ItemPocao representa poções e elixires.
type ItemPocao struct {
	ItemBase
	Usos      int    `json:"usos"`
	EfeitoUso string `json:"efeito_uso"`
	Duracao   string `json:"duracao"` // ex: "instantâneo", "1 hora"
}

// ItemFerramenta representa ferramentas e kits (ferramentas de ladrão, kit de cura, etc.)
type ItemFerramenta struct {
	ItemBase
	HabilidadeRequerida string `json:"habilidade_requerida"`
	BonusHabilidade     string `json:"bonus_habilidade"` // ex: "+2", "vantagem"
}

// ItemMaterial representa matérias-primas e componentes de crafting.
type ItemMaterial struct {
	ItemBase
	Qualidade string `json:"qualidade"` // ex: "bruto", "refinado", "raro"
	UsoCraft  string `json:"uso_craft"` // ex: "Barra de Ferro", "Pergaminho Encantado"
}

// ItemInformacao representa mapas, cartas, pergaminhos e documentos.
type ItemInformacao struct {
	ItemBase
	Conteudo string `json:"conteudo"` // o texto/informação em si
	Idioma   string `json:"idioma"`   // ex: "Comum", "Élfico"
}

// ItemGeral e ItemOutro usam ItemBase diretamente — sem campos extras.
// Não precisam de struct separada; o handler usa ItemBase ao serializar.
