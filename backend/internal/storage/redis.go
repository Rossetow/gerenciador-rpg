package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"gerenciador-de-fichas/internal/model"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

func NewMemoryStorage() {
	redisPass := os.Getenv("REDIS_PASSWORD")
	ctx := context.Background()

	rdb = redis.NewClient(&redis.Options{
		Addr:     "redis-service:6379", // Redis server address
		Password: redisPass,
		DB:       0,                // Use default DB 0
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

	campanhaMestre := make([]model.Campanha, 0)

	for i := 0; i < len(campanhas); i++ {
		if campanhas[i].MestreID == idMestre {
			campanhaMestre = append(campanhaMestre, campanhas[i])
		}
	}

	return campanhas, nil
}

func GetPersonagensByCampanha(idCampanha string) ([]model.Personagem, error) {
	var personagens []model.Personagem

	personagensData, err := rdb.Get(context.TODO(), (personagemPattern + "*")).Bytes()
	if err != nil {
		if err == redis.Nil {
			return []model.Personagem{}, nil
		}
		return nil, err
	}

	err = json.Unmarshal(personagensData, &personagens)
	if err != nil {
		return nil, err
	}

	personagensCampanha := make([]model.Personagem, 0)

	for i := 0; i < len(personagens); i++ {
		if personagens[i].CampanhaID == idCampanha {
			personagensCampanha = append(personagensCampanha, personagens[i])
		}
	}

	return personagensCampanha, nil
}

func GetPersonagensByCampanhaJogador(idCampanha, idJogador string) ([]model.Personagem, error) {
	var personagens []model.Personagem

	personagensData, err := rdb.Get(context.TODO(), (personagemPattern + "*")).Bytes()
	if err != nil {
		if err == redis.Nil {
			return []model.Personagem{}, nil
		}
		return nil, err
	}

	err = json.Unmarshal(personagensData, &personagens)
	if err != nil {
		return nil, err
	}

	personagensCampanha := make([]model.Personagem, 0)

	for i := 0; i < len(personagens); i++ {
		if personagens[i].CampanhaID == idCampanha && personagens[i].JogadorID == idJogador {
			personagensCampanha = append(personagensCampanha, personagens[i])
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
	var personagens []model.Personagem

	personagensData, err := rdb.Get(context.TODO(), (personagemPattern + "*")).Bytes()
	if err != nil {
		if err == redis.Nil {
			return []model.Personagem{}, nil
		}
		return nil, err
	}

	err = json.Unmarshal(personagensData, &personagens)
	if err != nil {
		return nil, err
	}

	personagensCampanha := make([]model.Personagem, 0)

	for i := 0; i < len(personagens); i++ {
		if personagens[i].JogadorID == idJogador {
			personagensCampanha = append(personagensCampanha, personagens[i])
		}
	}

	return personagensCampanha, nil
}

func GetPersonagemByID(idPersonagem string) (model.Personagem, error){
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
