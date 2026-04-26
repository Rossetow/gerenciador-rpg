package handler

import (
	"net/http"

	"gerenciador-de-fichas/internal/model"
	"gerenciador-de-fichas/internal/service"
	supabasestorage "gerenciador-de-fichas/internal/storage/supabase"

	"github.com/gin-gonic/gin"
)

var (
	getJogador                      = service.GetJogador
	createJogador                   = service.CreateJogador
	getMestre                       = service.GetMestre
	createMestre                    = service.CreateMestre
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
	getItensByCampanha              = service.GetItensByCampanha
	addItem                         = service.AddItem
	updateItem                      = service.UpdateItem
	deleteItem                      = service.DeleteItem
	getAllJogadores                  = service.GetAllJogadores
	getJogadoresPorCampanha         = service.GetJogadoresPorCampanha
	adicionarJogadorCampanha        = service.AdicionarJogadorCampanha
	removerJogadorCampanha          = service.RemoverJogadorCampanha
	getCampanhasByJogador           = service.GetCampanhasByJogador
	getJogadorByID                  = service.GetJogadorByID
)

// --- HEALTH ---

func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// --- JOGADOR / MESTRE ---

func LoginJogador(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	usuario, err := getJogador(req.Nome)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "jogador não encontrado"})
		return
	}
	c.JSON(http.StatusOK, usuario)
}

func CadastroJogador(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	usuario, err := createJogador(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, usuario)
}

func LoginMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	usuario, err := getMestre(req.Nome)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "mestre não encontrado"})
		return
	}
	c.JSON(http.StatusOK, usuario)
}

func CadastroMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	usuario, err := createMestre(req.Nome)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, usuario)
}

func GetAllJogadores(c *gin.Context) {
	jogadores, err := getAllJogadores()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jogadores)
}

func GetJogadorByID(c *gin.Context) {
	id := c.Param("id")
	jogador, err := getJogadorByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, jogador)
}

// --- CAMPANHAS ---

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
		c.JSON(http.StatusNotFound, gin.H{"error": "campanha não encontrada"})
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
	if err := updateCampanhaTemplate(idCampanha, req.TemplateAtributosBase, req.TemplateHabilidades, req.TemplateOutros); err != nil {
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
		JogadorID string `json:"jogador_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "jogador_id obrigatório"})
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
		c.JSON(http.StatusNotFound, gin.H{"error": "personagem não encontrado"})
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

func GetItensByCampanha(c *gin.Context) {
	id := c.Param("id")
	itens, err := getItensByCampanha(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, itens)
}

func AddItem(c *gin.Context) {
	var req model.ItemCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item, err := addItem(req.CampanhaID, req.PersonagemID, req.Tipo, req.Dados)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateItem(c *gin.Context) {
	var req model.ItemUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := updateItem(req.ID, req.Tipo, req.Dados); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item atualizado"})
}

func DeleteItem(c *gin.Context) {
	var req model.ItemDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := deleteItem(req.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item deletado"})
}

// --- IMAGEM ---

func UploadPersonagemImagem(c *gin.Context) {
	id := c.Param("id")

	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "arquivo não enviado (campo 'file' obrigatório)"})
		return
	}
	defer file.Close()

	url, err := supabasestorage.UploadImagem(id, file, fileHeader.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	personagem, err := getPersonagemByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "personagem não encontrado"})
		return
	}

	personagem.ImagemURL = url
	if err := updatePersonagem(personagem); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"imagem_url": url})
}
