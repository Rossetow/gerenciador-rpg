package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"gerenciador-de-fichas/internal/model"
	"log"
	"os"
	"strings"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

func NewMemoryStorage() {
	redisPass := os.Getenv("REDIS_PASSWORD")
	ctx := context.Background()

	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis-service:6379", // Redis server address
		Password: redisPass,
		DB:       0, // Use default DB 0
	})

	// Ping the Redis server to check the connection
	pong, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	fmt.Println("Connected to Redis:", pong)

	// Example: Set and Get a key-value pair
	err = rdb.Set(ctx, "mykey", "myvalue", 0).Err()
	if err != nil {
		log.Fatalf("Failed to set key: %v", err)
	}

	val, err := rdb.Get(ctx, "mykey").Result()
	if err != nil {
		log.Fatalf("Failed to get key: %v", err)
	}
	fmt.Println("Value of mykey:", val)

}

const (
	jogadorPattern    = "jogadores:"
	campanhaPattern   = "campanhas:"
	personagemPattern = "personagens:"
	mestrePattern     = "mestre:"
)

// Jogador

func GetJogador(nome string) (model.Jogador, error) {
	var jogador model.Jogador

	jogadorData, err := rdb.Get(context.TODO(), (jogadorPattern + nome)).Bytes()
	if err != nil {
		return model.Jogador{}, err
	}

	err = json.Unmarshal(jogadorData, &jogador)
	if err != nil {
		return model.Jogador{}, err
	}

	return jogador, nil
}

func SetNovoJogador(novoJogador model.Jogador) (model.Jogador, error) {
	valueInJson, err := json.Marshal(novoJogador)
	if err != nil {
		return model.Jogador{}, fmt.Errorf("Erro convertendo jogador para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (jogadorPattern + novoJogador.ID), valueInJson, 0).Err()
	if err != nil {
		return model.Jogador{}, fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return novoJogador, nil
}

func GetMestre(nome string) (model.Jogador, error) {
	var jogador model.Jogador

	jogadorData, err := rdb.Get(context.TODO(), (mestrePattern + nome)).Bytes()
	if err != nil {
		return model.Jogador{}, err
	}

	err = json.Unmarshal(jogadorData, &jogador)
	if err != nil {
		return model.Jogador{}, err
	}

	return jogador, nil
}

func SetNovoMestre(novoJogador model.Jogador) (model.Jogador, error) {
	valueInJson, err := json.Marshal(novoJogador)
	if err != nil {
		return model.Jogador{}, fmt.Errorf("Erro convertendo jogador para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (mestrePattern + novoJogador.ID), valueInJson, 0).Err()
	if err != nil {
		return model.Jogador{}, fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return novoJogador, nil
}

func GetAllJogadores() ([]model.Jogador, error) {
	var jogadores []model.Jogador
	keys, err := rdb.Keys(context.TODO(), jogadorPattern+"*").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		jogadorData, err := rdb.Get(context.TODO(), key).Bytes()
		if err != nil {
			return nil, err
		}
		var jogador model.Jogador
		err = json.Unmarshal(jogadorData, &jogador)
		if err != nil {
			return nil, err
		}
		jogadores = append(jogadores, jogador)
	}
	return jogadores, nil
}

// Campanha

func CreateCampanha(campanha model.Campanha) (model.Campanha, error) {
	valueJson, err := json.Marshal(campanha)
	if err != nil {
		return model.Campanha{}, fmt.Errorf("Erro convertendo campanha para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (campanhaPattern + campanha.ID), valueJson, 0).Err()
	if err != nil {
		return model.Campanha{}, fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return campanha, nil
}

func GetCampanhas() ([]model.Campanha, error) {
	var campanhas []model.Campanha

	campanhasData, err := rdb.Get(context.TODO(), (campanhaPattern + "*")).Bytes()
	if err != nil {
		if err == redis.Nil {
			return []model.Campanha{}, nil
		}
		return nil, err
	}

	err = json.Unmarshal(campanhasData, &campanhas)
	if err != nil {
		return nil, err
	}

	return campanhas, nil
}

func GetCampanhasByMestre(idMestre string) ([]model.Campanha, error) {
	var campanhaMestre []model.Campanha

	keys, err := rdb.Keys(context.TODO(), campanhaPattern+"*").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		// Ignore membership sets like "campanhas:<id>:jogadores"
		if strings.HasSuffix(key, ":jogadores") {
			continue
		}

		data, err := rdb.Get(context.TODO(), key).Bytes()
		if err != nil {
			// Skip keys holding non-string values (WRONGTYPE) or missing keys
			continue
		}

		var c model.Campanha
		if err := json.Unmarshal(data, &c); err != nil {
			// Skip malformed entries
			continue
		}
		if c.MestreID == idMestre {
			campanhaMestre = append(campanhaMestre, c)
		}
	}

	return campanhaMestre, nil
}

func GetPersonagensByCampanha(idCampanha string) ([]model.Personagem, error) {
	personagensCampanha := make([]model.Personagem, 0)

	keys, err := rdb.Keys(context.TODO(), personagemPattern+"*").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		data, err := rdb.Get(context.TODO(), key).Bytes()
		if err != nil {
			// skip missing or wrong-typed keys
			continue
		}
		var p model.Personagem
		if err := json.Unmarshal(data, &p); err != nil {
			continue
		}
		if p.CampanhaID == idCampanha {
			personagensCampanha = append(personagensCampanha, p)
		}
	}

	return personagensCampanha, nil
}

func GetPersonagensByCampanhaJogador(idCampanha, idJogador string) ([]model.Personagem, error) {
	personagensCampanha := make([]model.Personagem, 0)

	keys, err := rdb.Keys(context.TODO(), personagemPattern+"*").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		data, err := rdb.Get(context.TODO(), key).Bytes()
		if err != nil {
			continue
		}
		var p model.Personagem
		if err := json.Unmarshal(data, &p); err != nil {
			continue
		}
		if p.CampanhaID == idCampanha && p.JogadorID == idJogador {
			personagensCampanha = append(personagensCampanha, p)
		}
	}

	return personagensCampanha, nil
}

func UpdateTemplateCampanha(campanha model.Campanha) error {
	valueJson, err := json.Marshal(campanha)
	if err != nil {
		return fmt.Errorf("Erro convertendo campanha para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (campanhaPattern + campanha.ID), valueJson, 0).Err()
	if err != nil {
		return fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return nil
}

func GetJogadoresPorCampanha(campanhaID string) ([]model.Jogador, error) {
	var jogadores []model.Jogador
	jogadorIDs, err := rdb.SMembers(context.TODO(), campanhaPattern+campanhaID+":jogadores").Result()
	if err != nil {
		return nil, err
	}

	for _, jogadorID := range jogadorIDs {
		jogador, err := GetJogador(jogadorID)
		if err != nil {
			return nil, err
		}
		jogadores = append(jogadores, jogador)
	}
	return jogadores, nil
}

func AdicionarJogadorCampanha(campanhaID, jogadorID string) error {
	_, err := rdb.SAdd(context.TODO(), campanhaPattern+campanhaID+":jogadores", jogadorID).Result()
	return err
}

func RemoverJogadorCampanha(campanhaID, jogadorID string) error {
	_, err := rdb.SRem(context.TODO(), campanhaPattern+campanhaID+":jogadores", jogadorID).Result()
	return err
}

func GetCampanhasByJogador(jogadorID string) ([]model.Campanha, error) {
	var campanhas []model.Campanha

	// Lista todos os conjuntos de jogadores por campanha: campanhas:*:jogadores
	keys, err := rdb.Keys(context.TODO(), campanhaPattern+"*:jogadores").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		isMember, err := rdb.SIsMember(context.TODO(), key, jogadorID).Result()
		if err != nil {
			return nil, err
		}
		if isMember {
			// Extrai o ID da campanha da chave "campanhas:<id>:jogadores"
			id := strings.TrimPrefix(key, campanhaPattern)
			id = strings.TrimSuffix(id, ":jogadores")

			campanha, err := GetCampanhaByID(id)
			if err != nil {
				return nil, err
			}
			campanhas = append(campanhas, campanha)
		}
	}

	return campanhas, nil
}

func GetCampanhaByID(idCampanha string) (model.Campanha, error) {
	var campanha model.Campanha

	campanhaData, err := rdb.Get(context.TODO(), (campanhaPattern + idCampanha)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return model.Campanha{}, fmt.Errorf("Campanha não encontrada")
		}
		return model.Campanha{}, err
	}

	err = json.Unmarshal(campanhaData, &campanha)
	if err != nil {
		return model.Campanha{}, err
	}

	return campanha, nil
}

// Personagens

func CreatePersonagem(novoPersonagem model.Personagem) (model.Personagem, error) {
	valueJson, err := json.Marshal(novoPersonagem)
	if err != nil {
		return model.Personagem{}, fmt.Errorf("Erro convertendo personagem para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (personagemPattern + novoPersonagem.ID), valueJson, 0).Err()
	if err != nil {
		return model.Personagem{}, fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return novoPersonagem, nil
}

func GetPersonagensByJogador(idJogador string) ([]model.Personagem, error) {
	personagensJogador := make([]model.Personagem, 0)

	keys, err := rdb.Keys(context.TODO(), personagemPattern+"*").Result()
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		data, err := rdb.Get(context.TODO(), key).Bytes()
		if err != nil {
			continue
		}
		var p model.Personagem
		if err := json.Unmarshal(data, &p); err != nil {
			continue
		}
		if p.JogadorID == idJogador {
			personagensJogador = append(personagensJogador, p)
		}
	}

	return personagensJogador, nil
}

func GetPersonagemByID(idPersonagem string) (model.Personagem, error) {
	var personagem model.Personagem

	personagemData, err := rdb.Get(context.TODO(), (personagemPattern + idPersonagem)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return model.Personagem{}, fmt.Errorf("Personagem não encontrado")
		}
		return model.Personagem{}, err
	}

	err = json.Unmarshal(personagemData, &personagem)
	if err != nil {
		return model.Personagem{}, err
	}

	return personagem, nil
}

func UpdatePersonagem(personagem model.Personagem) error {
	valueJson, err := json.Marshal(personagem)
	if err != nil {
		return fmt.Errorf("Erro convertendo personagem para JSON: %s", err.Error())
	}
	err = rdb.Set(context.TODO(), (personagemPattern + personagem.ID), valueJson, 0).Err()
	if err != nil {
		return fmt.Errorf("Erro salvando novo jogador no Redis: %w", err)
	}
	return nil
}

func DeletePersonagem(id string) error {
	err := rdb.Del(context.TODO(), (personagemPattern + id))
	if err != nil {
		return err.Err()
	}

	return nil
}

func GetItensByPersonagem(personagemID string) ([]model.Item, error) {
	var personagem model.Personagem

	personagemData, err := rdb.Get(context.TODO(), (personagemPattern + personagemID)).Bytes()
	if err != nil {
		if err == redis.Nil {
			return []model.Item{}, nil
		}
		return nil, err
	}

	err = json.Unmarshal(personagemData, &personagem)
	if err != nil {
		return nil, err
	}

	return personagem.Inventario, nil
}
