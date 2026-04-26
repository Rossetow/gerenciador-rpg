package router

import (
	"gerenciador-de-fichas/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)


func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Serve arquivos estáticos de imagens de personagens
	r.Static("/uploads", "./uploads")

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"} // A origem do seu React
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))

	r.POST("/jogador/login", handler.LoginJogador)
	r.POST("/jogador/cadastro", handler.CadastroJogador)
	r.POST("/mestre/login", handler.LoginMestre)
	r.POST("/mestre/cadastro", handler.CadastroMestre)

	api := r.Group("/api")
	{
		campanhas := api.Group("/campanhas")
		{
			campanhas.GET("", handler.GetCampanhas)
			campanhas.POST("", handler.CreateCampanha)
			campanhas.GET("/mestre/:mestre_id", handler.GetCampanhasByMestre)
			campanhas.GET("/jogador/:jogador_id", handler.GetCampanhasByJogador)
			campanhas.GET("/:id", handler.GetCampanhaByID)
			campanhas.PUT("/:id/template", handler.UpdateCampanhaTemplate)
			campanhas.GET("/:id/personagens", handler.GetPersonagensByCampanha)
			campanhas.GET("/:id/jogador/:jogador_id", handler.GetPersonagensByCampanhaJogador)

			// Novas rotas para gerenciamento de jogadores na campanha
			campanhas.GET("/:id/jogadores", handler.GetJogadoresPorCampanha)
			campanhas.POST("/:id/jogadores", handler.AdicionarJogadorCampanha)
			campanhas.DELETE("/:id/jogadores/:jogador_id", handler.RemoverJogadorCampanha)
		}

		jogadores := api.Group("/jogadores")
		{
			jogadores.GET("", handler.GetAllJogadores)
			jogadores.GET("/:id", handler.GetJogadorByID)
		}

		personagens := api.Group("/personagens")
		{
			personagens.GET("/jogador/:jogador_id", handler.GetPersonagensByJogador)
			personagens.POST("", handler.CreatePersonagem)
			personagens.GET("/:id", handler.GetPersonagemByID)
			personagens.PUT("/:id", handler.UpdatePersonagem)
			personagens.DELETE("/:id", handler.DeletePersonagem)
			// Upload de imagem do personagem (multipart/form-data com campo "file")
			personagens.POST("/:id/imagem", handler.UploadPersonagemImagem)

			personagens.GET("/:id/itens", handler.GetItensByPersonagem)
			personagens.POST("/:id/itens", handler.AddItem)
			personagens.PUT("/:id/items", handler.UpdateItem)
			personagens.DELETE("/:id/items/delete", handler.DeleteItem)
		}
		

	}

	return r
}
