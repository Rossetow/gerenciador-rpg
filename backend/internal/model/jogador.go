package model

import (
	"encoding/base64"
)

// Jogador representa o usuário do sistema (Mestre ou Jogador).
// O "login" pode ser simplesmente buscar/criar um por nome.
type Jogador struct {
	ID   string `json:"id"`   // uuid
	Nome string `json:"nome"` // O "login"
}

// Construtor
func NovoJogador(nome string) Jogador {
	return Jogador{
		ID:   base64.StdEncoding.EncodeToString([]byte(nome)),
		Nome: nome,
	}
}
