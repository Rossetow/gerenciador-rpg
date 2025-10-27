package model

// type Item struct {
// 	Nome        string            `json:"nome"`
// 	Tipo        string            `json:"tipo"` // Ex: "Arma", "Armadura", "Consumível"
// 	Descricao   string            `json:"descricao"`
// 	Quantidade  int               `json:"quantidade"`
// 	Peso        float64           `json:"peso"`
// 	Valor       int               `json:"valor"`
// 	Efeitos     map[string]string `json:"efeitos,omitempty"`
// }

// // Arma foi melhorada para clareza e flexibilidade.
// type Arma struct {
// 	Item // "Arma" É UM "Item" (Embedding)

// 	TipoArma          string `json:"tipo_arma"`           // Ex: "Corpo-a-corpo", "Distância"
// 	HabilidadeRequerida string `json:"habilidade_requerida"` // Ex: "Lutar", "Atirar"
// 	Dano              string `json:"dano"`                // MELHORIA: "1d8", "2d6+1"
// 	TipoDano          string `json:"tipo_dano,omitempty"` // NOVO: "Corte", "Perfurante", "Impacto"
// }

// func NewArma(nome, descricao, tipoArma, habilidade, dano, tipoDano string, peso float64, valor int) Arma {
// 	return Arma{
// 		// 1. Pré-configuramos os campos do Item embutido
// 		Item: Item{
// 			Nome:        nome,
// 			Tipo:        "Arma", // <-- GARANTE O TIPO CORRETO
// 			Descricao:   descricao,
// 			Quantidade:  1,
// 			Peso:        peso,
// 			Valor:       valor,
// 			Efeitos:     make(map[string]string), // Inicializa o mapa
// 		},
// 		// 2. Configuramos os campos específicos da Arma
// 		TipoArma:          tipoArma,
// 		HabilidadeRequerida: habilidade,
// 		Dano:              dano,
// 		TipoDano:          tipoDano,
// 	}
// }

// // --- Exemplo com outros tipos de item ---

// // Armadura segue o mesmo padrão
// type Armadura struct {
// 	Item
// 	ValorDefesa int    `json:"valor_defesa"`
// 	Localizacao string `json:"localizacao"` // "Cabeça", "Torso", "Pernas"
// }

// // NewArmadura é a construtora para Armadura
// func NewArmadura(nome, descricao, localizacao string, defesa int, peso float64, valor int) Armadura {
// 	return Armadura{
// 		Item: Item{
// 			Nome:       nome,
// 			Tipo:       "Armadura", // <-- GARANTE O TIPO CORRETO
// 			Descricao:  descricao,
// 			Quantidade: 1,
// 			Peso:       peso,
// 			Valor:      valor,
// 		},
// 		ValorDefesa: defesa,
// 		Localizacao: localizacao,
// 	}
// }

// // Consumivel pode nem precisar de campos extras,
// // seus efeitos podem ir todos no mapa 'Efeitos'.
// type Consumivel struct {
// 	Item
// }

// // NewConsumivel é a construtora para Consumíveis
// func NewConsumivel(nome, descricao string, quantidade int, peso float64, valor int, efeitos map[string]string) Consumivel {
// 	return Consumivel{
// 		Item: Item{
// 			Nome:       nome,
// 			Tipo:       "Consumível", // <-- GARANTE O TIPO CORRETO
// 			Descricao:  descricao,
// 			Quantidade: quantidade,
// 			Peso:       peso,
// 			Valor:      valor,
// 			Efeitos:    efeitos,
// 		},
// 	}
// }

type Item map[string]any