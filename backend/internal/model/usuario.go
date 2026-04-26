package model

// Usuario representa um jogador ou mestre no sistema.
// O "login" é feito apenas pelo nome — sem senha.
type Usuario struct {
	ID   string `json:"id"`
	Nome string `json:"nome"`
	Tipo string `json:"tipo"` // "jogador" ou "mestre"
}
