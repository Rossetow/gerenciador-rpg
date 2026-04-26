package handler

import (
	"log"
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
	getAllJogadores                 = service.GetAllJogadores
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
		log.Printf("[LoginJogador] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[LoginJogador] nome=%q", req.Nome)
	usuario, err := getJogador(req.Nome)
	if err != nil {
		log.Printf("[LoginJogador] not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "jogador não encontrado"})
		return
	}
	c.JSON(http.StatusOK, usuario)
}

func CadastroJogador(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[CadastroJogador] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[CadastroJogador] nome=%q", req.Nome)
	usuario, err := createJogador(req.Nome)
	if err != nil {
		log.Printf("[CadastroJogador] create error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, usuario)
}

func LoginMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[LoginMestre] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[LoginMestre] nome=%q", req.Nome)
	usuario, err := getMestre(req.Nome)
	if err != nil {
		log.Printf("[LoginMestre] not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "mestre não encontrado"})
		return
	}
	c.JSON(http.StatusOK, usuario)
}

func CadastroMestre(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[CadastroMestre] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[CadastroMestre] nome=%q", req.Nome)
	usuario, err := createMestre(req.Nome)
	if err != nil {
		log.Printf("[CadastroMestre] create error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, usuario)
}

func GetAllJogadores(c *gin.Context) {
	jogadores, err := getAllJogadores()
	if err != nil {
		log.Printf("[GetAllJogadores] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetAllJogadores] returning %d jogadores", len(jogadores))
	c.JSON(http.StatusOK, jogadores)
}

func GetJogadorByID(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetJogadorByID] id=%q", id)
	jogador, err := getJogadorByID(id)
	if err != nil {
		log.Printf("[GetJogadorByID] not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "usuário não encontrado"})
		return
	}
	c.JSON(http.StatusOK, jogador)
}

// --- CAMPANHAS ---

func GetCampanhasByMestre(c *gin.Context) {
	mestreID := c.Param("mestre_id")
	log.Printf("[GetCampanhasByMestre] mestreID=%q", mestreID)
	campanhas, err := getCampanhaByMestre(mestreID)
	if err != nil {
		log.Printf("[GetCampanhasByMestre] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetCampanhasByMestre] returning %d campanhas", len(campanhas))
	c.JSON(http.StatusOK, campanhas)
}

func GetCampanhasByJogador(c *gin.Context) {
	jogadorID := c.Param("jogador_id")
	log.Printf("[GetCampanhasByJogador] jogadorID=%q", jogadorID)
	campanhas, err := getCampanhasByJogador(jogadorID)
	if err != nil {
		log.Printf("[GetCampanhasByJogador] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetCampanhasByJogador] returning %d campanhas", len(campanhas))
	c.JSON(http.StatusOK, campanhas)
}

func GetCampanhaByID(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetCampanhaByID] id=%q", id)
	campanha, err := getCampanhaByID(id)
	if err != nil {
		log.Printf("[GetCampanhaByID] not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "campanha não encontrada"})
		return
	}
	c.JSON(http.StatusOK, campanha)
}

func CreateCampanha(c *gin.Context) {
	var campanha model.Campanha
	if err := c.ShouldBindJSON(&campanha); err != nil {
		log.Printf("[CreateCampanha] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[CreateCampanha] nome=%q mestreID=%q", campanha.Nome, campanha.MestreID)
	novaCampanha, err := createCampanha(campanha)
	if err != nil {
		log.Printf("[CreateCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, novaCampanha)
}

func UpdateCampanhaTemplate(c *gin.Context) {
	idCampanha := c.Param("id")
	log.Printf("[UpdateCampanhaTemplate] campanhaID=%q", idCampanha)
	var req model.TemplateUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[UpdateCampanhaTemplate] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := updateCampanhaTemplate(idCampanha, req.TemplateAtributosBase, req.TemplateHabilidades, req.TemplateOutros); err != nil {
		log.Printf("[UpdateCampanhaTemplate] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "template atualizado"})
}

func GetPersonagensByCampanha(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetPersonagensByCampanha] campanhaID=%q", id)
	personagens, err := getPersonagensByCampanha(id)
	if err != nil {
		log.Printf("[GetPersonagensByCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetPersonagensByCampanha] returning %d personagens", len(personagens))
	c.JSON(http.StatusOK, personagens)
}

func GetPersonagensByCampanhaJogador(c *gin.Context) {
	idCampanha := c.Param("id")
	idJogador := c.Param("jogador_id")
	log.Printf("[GetPersonagensByCampanhaJogador] campanhaID=%q jogadorID=%q", idCampanha, idJogador)
	personagens, err := getPersonagensByCampanhaJogador(idCampanha, idJogador)
	if err != nil {
		log.Printf("[GetPersonagensByCampanhaJogador] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetPersonagensByCampanhaJogador] returning %d personagens", len(personagens))
	c.JSON(http.StatusOK, personagens)
}

func GetJogadoresPorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	log.Printf("[GetJogadoresPorCampanha] campanhaID=%q", campanhaID)
	jogadores, err := getJogadoresPorCampanha(campanhaID)
	if err != nil {
		log.Printf("[GetJogadoresPorCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetJogadoresPorCampanha] returning %d jogadores", len(jogadores))
	c.JSON(http.StatusOK, jogadores)
}

func AdicionarJogadorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	var req struct {
		JogadorID string `json:"jogador_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[AdicionarJogadorCampanha] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "jogador_id obrigatório"})
		return
	}
	log.Printf("[AdicionarJogadorCampanha] campanhaID=%q jogadorID=%q", campanhaID, req.JogadorID)
	if err := adicionarJogadorCampanha(campanhaID, req.JogadorID); err != nil {
		log.Printf("[AdicionarJogadorCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "jogador adicionado"})
}

func RemoverJogadorCampanha(c *gin.Context) {
	campanhaID := c.Param("id")
	jogadorID := c.Param("jogador_id")
	log.Printf("[RemoverJogadorCampanha] campanhaID=%q jogadorID=%q", campanhaID, jogadorID)
	if err := removerJogadorCampanha(campanhaID, jogadorID); err != nil {
		log.Printf("[RemoverJogadorCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "jogador removido"})
}

// --- PERSONAGENS ---

func GetPersonagensByJogador(c *gin.Context) {
	jogadorID := c.Param("jogador_id")
	log.Printf("[GetPersonagensByJogador] jogadorID=%q", jogadorID)
	personagens, err := getPersonagensByJogador(jogadorID)
	if err != nil {
		log.Printf("[GetPersonagensByJogador] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetPersonagensByJogador] returning %d personagens", len(personagens))
	c.JSON(http.StatusOK, personagens)
}

func CreatePersonagem(c *gin.Context) {
	var req model.Personagem
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[CreatePersonagem] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[CreatePersonagem] nome=%q jogadorID=%q campanhaID=%q", req.Nome, req.JogadorID, req.CampanhaID)
	novoPersonagem, err := createPersonagem(req)
	if err != nil {
		log.Printf("[CreatePersonagem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, novoPersonagem)
}

func GetPersonagemByID(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetPersonagemByID] id=%q", id)
	personagem, err := getPersonagemByID(id)
	if err != nil {
		log.Printf("[GetPersonagemByID] not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "personagem não encontrado"})
		return
	}
	c.JSON(http.StatusOK, personagem)
}

func UpdatePersonagem(c *gin.Context) {
	var req model.Personagem
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[UpdatePersonagem] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[UpdatePersonagem] id=%q", req.ID)
	if err := updatePersonagem(req); err != nil {
		log.Printf("[UpdatePersonagem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "personagem atualizado"})
}

func DeletePersonagem(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[DeletePersonagem] id=%q", id)
	if err := deletePersonagem(id); err != nil {
		log.Printf("[DeletePersonagem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "personagem deletado"})
}

// --- ITENS ---

func GetItensByPersonagem(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetItensByPersonagem] personagemID=%q", id)
	itens, err := getItensByPersonagem(id)
	if err != nil {
		log.Printf("[GetItensByPersonagem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetItensByPersonagem] returning %d itens", len(itens))
	c.JSON(http.StatusOK, itens)
}

func GetItensByCampanha(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[GetItensByCampanha] campanhaID=%q", id)
	itens, err := getItensByCampanha(id)
	if err != nil {
		log.Printf("[GetItensByCampanha] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[GetItensByCampanha] returning %d itens", len(itens))
	c.JSON(http.StatusOK, itens)
}

func AddItem(c *gin.Context) {
	var req model.ItemCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[AddItem] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[AddItem] campanhaID=%q personagemID=%v tipo=%q", req.CampanhaID, req.PersonagemID, req.Tipo)
	item, err := addItem(req.CampanhaID, req.PersonagemID, req.Tipo, req.Dados)
	if err != nil {
		log.Printf("[AddItem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateItem(c *gin.Context) {
	var req model.ItemUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[UpdateItem] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[UpdateItem] id=%q tipo=%q", req.ID, req.Tipo)
	if err := updateItem(req.ID, req.Tipo, req.Dados); err != nil {
		log.Printf("[UpdateItem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item atualizado"})
}

func DeleteItem(c *gin.Context) {
	var req model.ItemDeleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[DeleteItem] bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[DeleteItem] id=%q", req.ID)
	if err := deleteItem(req.ID); err != nil {
		log.Printf("[DeleteItem] error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "item deletado"})
}

// --- IMAGEM ---

func UploadPersonagemImagem(c *gin.Context) {
	id := c.Param("id")
	log.Printf("[UploadPersonagemImagem] personagemID=%q", id)

	file, fileHeader, err := c.Request.FormFile("file")
	if err != nil {
		log.Printf("[UploadPersonagemImagem] form file error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "arquivo não enviado (campo 'file' obrigatório)"})
		return
	}
	defer file.Close()

	contentType := fileHeader.Header.Get("Content-Type")
	log.Printf("[UploadPersonagemImagem] filename=%q contentType=%q size=%d", fileHeader.Filename, contentType, fileHeader.Size)

	url, err := supabasestorage.UploadImagem(id, file, contentType)
	if err != nil {
		log.Printf("[UploadPersonagemImagem] upload error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[UploadPersonagemImagem] upload success url=%q", url)

	personagem, err := getPersonagemByID(id)
	if err != nil {
		log.Printf("[UploadPersonagemImagem] personagem not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "personagem não encontrado"})
		return
	}

	personagem.ImagemURL = url
	if err := updatePersonagem(personagem); err != nil {
		log.Printf("[UploadPersonagemImagem] update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"imagem_url": url})
}
