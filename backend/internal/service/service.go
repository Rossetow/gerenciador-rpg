package service

import (
	"encoding/json"
	"fmt"
	"gerenciador-de-fichas/internal/model"
	"gerenciador-de-fichas/internal/storage"
)

// --- USUARIOS ---

func GetJogador(nome string) (model.Usuario, error) {
	return storage.GetJogador(nome)
}

func CreateJogador(nome string) (model.Usuario, error) {
	return storage.SetNovoJogador(nome)
}

func GetMestre(nome string) (model.Usuario, error) {
	return storage.GetMestre(nome)
}

func CreateMestre(nome string) (model.Usuario, error) {
	return storage.SetNovoMestre(nome)
}

func GetAllJogadores() ([]model.Usuario, error) {
	return storage.GetAllJogadores()
}

func GetJogadorByID(id string) (model.Usuario, error) {
	return storage.GetJogadorByID(id)
}

// --- CAMPANHAS ---

func GetCampanhasByMestre(mestreID string) ([]model.Campanha, error) {
	return storage.GetCampanhasByMestre(mestreID)
}

func GetCampanhasByJogador(jogadorID string) ([]model.Campanha, error) {
	return storage.GetCampanhasByJogador(jogadorID)
}

func CreateCampanha(campanha model.Campanha) (model.Campanha, error) {
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

func GetJogadoresPorCampanha(campanhaID string) ([]model.Usuario, error) {
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
	novoPersonagem := model.NewPersonagem(req.Nome, req.JogadorID, req.CampanhaID)
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
	return storage.UpdatePersonagem(req)
}

func DeletePersonagem(id string) error {
	return storage.DeletePersonagem(id)
}

// --- ITENS ---

func GetItensByPersonagem(personagemID string) ([]model.Item, error) {
	return storage.GetItensByPersonagem(personagemID)
}

func GetItensByCampanha(campanhaID string) ([]model.Item, error) {
	return storage.GetItensByCampanha(campanhaID)
}

// normalizeDados deserialises the incoming dados map into the correct typed struct
// for the given tipo, then re-serialises it back to map[string]any.
// This strips unknown fields and ensures only valid fields for the type are stored.
func normalizeDados(tipo string, dados map[string]any) (map[string]any, error) {
	raw, err := json.Marshal(dados)
	if err != nil {
		return nil, err
	}

	var typed any
	switch tipo {
	case "Arma":
		typed = &model.ItemArma{}
	case "Armadura":
		typed = &model.ItemArmadura{}
	case "Consumível":
		typed = &model.ItemConsumivel{}
	case "Poção":
		typed = &model.ItemPocao{}
	case "Ferramenta":
		typed = &model.ItemFerramenta{}
	case "Material":
		typed = &model.ItemMaterial{}
	case "Informação":
		typed = &model.ItemInformacao{}
	default:
		// Geral / Outro — use base fields only
		typed = &model.ItemBase{}
	}

	if err := json.Unmarshal(raw, typed); err != nil {
		return nil, fmt.Errorf("dados inválidos para tipo %q: %w", tipo, err)
	}

	normalized, err := json.Marshal(typed)
	if err != nil {
		return nil, err
	}

	var result map[string]any
	json.Unmarshal(normalized, &result)
	return result, nil
}

func AddItem(campanhaID string, personagemID *string, tipo string, dados map[string]any) (model.Item, error) {
	normalized, err := normalizeDados(tipo, dados)
	if err != nil {
		return model.Item{}, err
	}
	return storage.AddItem(campanhaID, personagemID, tipo, normalized)
}

func UpdateItem(itemID, tipo string, dados map[string]any) error {
	normalized, err := normalizeDados(tipo, dados)
	if err != nil {
		return err
	}
	return storage.UpdateItem(itemID, tipo, normalized)
}

func DeleteItem(itemID string) error {
	return storage.DeleteItem(itemID)
}
