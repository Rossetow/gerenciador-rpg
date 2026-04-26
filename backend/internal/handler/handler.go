package handler

import (
	"fmt"
	"os"
	"path/filepath"

	"gerenciador-de-fichas/internal/model"
	"gerenciador-de-fichas/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

var (
	getJogador                      = service.GetJogador
	createJogador                   = service.CreateJogador
	getMestre                       = service.GetMestre
	createMestre                    = service.CreateMestre
	getCampanhas                    = service.GetCampanhas
	getCampanhaByMestre             = service.GetCampanhasByMestre
	createCampanha                  = service.CreateCampanha
	getCampanhaByID                 = service.GetCampanhaByID
	updateCampanhaTemplate          = service.UpdateCampanhaTemplate
	getPersonagensByCampanha        = service.GetPersonagensByCampanha
	getPersonagensByJogador         = service.GetPersonagensByJogador
	getPersonagensByCampanhaJogador = service.GetPersonagensByCampanhaJogador
	createPersonagem                = service.CreatePersonagem
	getPersonagemByID               = service.GetPersonagemByID
	updatePersonagem                = service.UpdatePersonagem
	deletePersonagem                = service.DeletePersonagem
	getItensByPersonagem            = service.GetItensByPersonagem
	addItem                         = service.AddItem
	updateItem                      = service.UpdateItem
	deleteItem                      = service.DeleteItem
	getAllJogadores                 = service.GetAllJogadores
	getJogadoresPorCampanha         = service.GetJogadoresPorCampanha
	adicionarJogadorCampanha        = service.AdicionarJogadorCampanha
	removerJogadorCampanha          = service.RemoverJogadorCampanha
	getCampanhasByJogador           = service.GetCampanhasByJogador
	getJogadorByID                  = service.GetJogadorByID
)

// --- JOGADOR ---

func LoginJogador(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jogador, err := getJogador(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogador)
}

func CadastroJogador(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jogador, err := createJogador(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, jogador)
}

func LoginMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jogador, err := getMestre(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogador)
}

func CadastroMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	jogador, err := createMestre(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, jogador)
}

func GetAllJogadores(c *gin.Context) {
	jogadores, err := getAllJogadores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogadores)
}

// GET /api/jogadores/:id
func GetJogadorByID(c *gin.Context) {
	id := c.Param("id")
	jogador, err := getJogadorByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogador)
}

// --- CAMPANHAS ---

func GetCampanhas(c *gin.Context) {
	campanhas, err := getCampanhas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, campanhas)
}

func GetCampanhasByMestre(c *gin.Context) {
	mestreID := c.Param("mestre_id")
	campanhas, err := getCampanhaByMestre(mestreID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, campanhas)
}

func GetCampanhasByJogador(c *gin.Context) {
	jogadorID := c.Param("jogador_id")
	campanhas, err := getCampanhasByJogador(jogadorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, campanhas)
}

func GetCampanhaByID(c *gin.Context) {
	id := c.Param("id")
	campanha, err := getCampanhaByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, campanha)
}

func CreateCampanha(c *gin.Context) {
	var campanha model.Campanha
	if err := c.ShouldBindJSON(&campanha); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	novaCampanha, err := createCampanha(campanha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, novaCampanha)
}

func UpdateCampanhaTemplate(c *gin.Context) {
	idCampanha := c.Param("id")
	var req model.TemplateUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	templateAtributosBase := req.TemplateAtributosBase
	templateHabilidades := req.TemplateHabilidades
	templateOutros := req.TemplateOutros

	if err := updateCampanhaTemplate(idCampanha, templateAtributosBase, templateHabilidades, templateOutros); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "template atualizado"})
}

func GetPersonagensByCampanha(c *gin.Context) {
	id := c.Param("id")
	personagens, err := getPersonagensByCampanha(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, personagens)
}

func GetPersonagensByCampanhaJogador(c *gin.Context) {
	idCampanha := c.Param("id")
	idJogador := c.Param("jogador_id")

	personagens, err := getPersonagensByCampanhaJogador(idCampanha, idJogador)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, personagens)
}

func GetJogadoresPorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	jogadores, err := getJogadoresPorCampanha(campanhaID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogadores)
}

func AdicionarJogadorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	var req struct {
		JogadorID string `json:"jogador_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := adicionarJogadorCampanha(campanhaID, req.JogadorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "jogador adicionado"})
}

func RemoverJogadorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	jogadorID := c.Param("jogador_id")

	if err := removerJogadorCampanha(campanhaID, jogadorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "jogador removido"})
}

// --- PERSONAGENS ---

func GetPersonagensByJogador(c *gin.Context) {
	jogadorID := c.Param("jogador_id")
	personagens, err := getPersonagensByJogador(jogadorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, personagens)
}

func CreatePersonagem(c *gin.Context) {
	var req model.Personagem
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	novoPersonagem, err := createPersonagem(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, novoPersonagem)
}

func GetPersonagemByID(c *gin.Context) {
	id := c.Param("id")
	personagem, err := getPersonagemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, personagem)
}

func UpdatePersonagem(c *gin.Context) {
	var req model.Personagem
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := updatePersonagem(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "personagem atualizado"})
}

func DeletePersonagem(c *gin.Context) {
	id := c.Param("id")
	if err := deletePersonagem(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "personagem deletado"})
}

// --- ITENS ---

func GetItensByPersonagem(c *gin.Context) {
	id := c.Param("id")
	itens, err := getItensByPersonagem(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, itens)
}

func AddItem(c *gin.Context) {
	personagemID := c.Param("id")

	var req model.ItemCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := addItem(personagemID, req.Item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func UpdateItem(c *gin.Context) {
	personagemID := c.Param("personagem_id")

	var req model.ItemUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := updateItem(personagemID, req.ItemNome, req.Item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item atualizado"})
}

func DeleteItem(c *gin.Context) {
	personagemID := c.Param("personagem_id")

	var req model.ItemDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := deleteItem(personagemID, req.ItemNome); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item deletado"})
}

// --- Upload de imagem do Personagem ---
func UploadPersonagemImagem(c *gin.Context) {
	id := c.Param("id")

	// Obtém o arquivo enviado (campo "file")
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "arquivo não enviado (campo 'file' obrigatório)"})
		return
	}

	// Garante a existência da pasta de uploads
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("falha ao criar pasta de uploads: %v", err)})
		return
	}

	// Monta um nome de arquivo previsível com o ID do personagem e a extensão original
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".png"
	}
	filename := id + ext
	destPath := filepath.Join(uploadDir, filename)

	// Salva o arquivo no disco
	if err := c.SaveUploadedFile(file, destPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("falha ao salvar arquivo: %v", err)})
		return
	}

	// Atualiza o Personagem com a URL pública da imagem
	personagem, err := getPersonagemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	personagem.ImagemURL = "/uploads/" + filename

	if err := updatePersonagem(personagem); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"imagem_url": personagem.ImagemURL})
}
