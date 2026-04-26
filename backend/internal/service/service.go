package service

import (
	"encoding/base64"
	"gerenciador-de-fichas/internal/model"
	"gerenciador-de-fichas/internal/storage"
)

// --- JOGADOR ---

func GetJogador(nome string) (model.Jogador, error) {
	idJogador := base64.StdEncoding.EncodeToString([]byte(nome))
	return storage.GetJogador(idJogador)
}

func CreateJogador(nome string) (model.Jogador, error) {
	novoJogador := model.NovoJogador(nome)
	return storage.SetNovoJogador(novoJogador)
}

func GetMestre(nome string) (model.Jogador, error) {
	idJogador := base64.StdEncoding.EncodeToString([]byte(nome))
	return storage.GetMestre(idJogador)
}

func CreateMestre(nome string) (model.Jogador, error) {
	novoJogador := model.NovoJogador(nome)
	return storage.SetNovoMestre(novoJogador)
}

func GetAllJogadores() ([]model.Jogador, error) {
	return storage.GetAllJogadores()
}

func GetJogadorByID(id string) (model.Jogador, error) {
	return storage.GetJogador(id)
}
// --- CAMPANHAS ---

func GetCampanhas() ([]model.Campanha, error) {
	return storage.GetCampanhas()
}

func GetCampanhasByMestre(mestreID string) ([]model.Campanha, error) {
	return storage.GetCampanhasByMestre(mestreID)
}

func GetCampanhasByJogador(jogadorID string) ([]model.Campanha, error) {
	return storage.GetCampanhasByJogador(jogadorID)
}

func CreateCampanha(campanha model.Campanha) (model.Campanha, error) {
	
	campanha.ID = model.NewUUID()

	return storage.CreateCampanha(campanha)
}

func GetCampanhaByID(id string) (model.Campanha, error) {
	return storage.GetCampanhaByID(id)
}

func GetPersonagensByCampanha(idCampanha string) ([]model.Personagem, error) {
	return storage.GetPersonagensByCampanha(idCampanha)
}

func GetPersonagensByCampanhaJogador(idCampanha, idJogador string) ([]model.Personagem, error) {
	return storage.GetPersonagensByCampanhaJogador(idCampanha, idJogador)
}

func UpdateCampanhaTemplate(idCampanha string, templateAtributosBase, templateHabilidades, templateOutros []string) error {
	campanha, err := GetCampanhaByID(idCampanha)
	if err != nil {
		return err
	}

	campanha.TemplateAtributosBase = templateAtributosBase
	campanha.TemplateHabilidades = templateHabilidades
	campanha.TemplateOutros = templateOutros

	return storage.UpdateTemplateCampanha(campanha)
}

func GetJogadoresPorCampanha(campanhaID string) ([]model.Jogador, error) {
	return storage.GetJogadoresPorCampanha(campanhaID)
}

func AdicionarJogadorCampanha(campanhaID, jogadorID string) error {
	return storage.AdicionarJogadorCampanha(campanhaID, jogadorID)
}

func RemoverJogadorCampanha(campanhaID, jogadorID string) error {
	return storage.RemoverJogadorCampanha(campanhaID, jogadorID)
}

// --- PERSONAGENS ---

func GetPersonagensByJogador(jogadorID string) ([]model.Personagem, error) {
	return storage.GetPersonagensByJogador(jogadorID)
}

func CreatePersonagem(req model.Personagem) (model.Personagem, error) {
	novoPersonagem := model.NewPersonagem(
		req.Nome,
		req.JogadorID,
		req.CampanhaID,
	)
	// Copia campos adicionais quando informados na criação
	novoPersonagem.DescricaoFisica = req.DescricaoFisica
	novoPersonagem.Caracteristicas = req.Caracteristicas
	novoPersonagem.Vida = req.Vida
	novoPersonagem.VidaMaxima = req.VidaMaxima
	novoPersonagem.ImagemURL = req.ImagemURL

	return storage.CreatePersonagem(novoPersonagem)
}

func GetPersonagemByID(id string) (model.Personagem, error) {
	return storage.GetPersonagemByID(id)
}

func UpdatePersonagem(req model.Personagem) error {
	// Lógica de negócio:
	// Ex: recalcular atributos, checar se o inventário é válido, etc.
	return storage.UpdatePersonagem(req)
}

func DeletePersonagem(id string) error {
	return storage.DeletePersonagem(id)
}

// --- ITENS ---

func GetItensByPersonagem(personagemID string) ([]model.Item, error) {
	return storage.GetItensByPersonagem(personagemID)
}

func AddItem(personagemID string, item map[string]any) (error) {
	personagem, err := storage.GetPersonagemByID(personagemID)
	if err != nil {
		return err
	}

	personagem.Inventario = append(personagem.Inventario, item)

	return storage.UpdatePersonagem(personagem)
}

func UpdateItem(personagemID, itemNome string, item map[string]any) error {
	personagem, err := storage.GetPersonagemByID(personagemID)
	if err != nil {
		return err
	}

	for i := 0; i < len(personagem.Inventario); i++ {
		if nome, ok := personagem.Inventario[i]["Nome"].(string); !ok || nome == "" {
			if nome == itemNome {
				personagem.Inventario[i] = item
			}
		}
	}


	return storage.UpdatePersonagem(personagem)
}

func DeleteItem(personagemID, itemNome string) error {
		personagem, err := storage.GetPersonagemByID(personagemID)
	if err != nil {
		return err
	}

	for i := 0; i < len(personagem.Inventario); i++ {
		if nome, ok := personagem.Inventario[i]["Nome"].(string); !ok || nome == "" {
			if nome == itemNome {
				personagem.Inventario[i] = nil
			}
		}
	}


	return storage.UpdatePersonagem(personagem)
}
