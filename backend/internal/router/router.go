package router

import (
	"gerenciador-de-fichas/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)


func SetupRouter() *gin.Engine {
	r := gin.Default()


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
			campanhas.GET("/:id", handler.GetCampanhaByID)
			campanhas.PUT("/:id/template", handler.UpdateCampanhaTemplate)
			campanhas.GET("/:id/personagens", handler.GetPersonagensByCampanha)
			campanhas.GET("/:id/jogador/:jogador_id", handler.GetPersonagensByCampanhaJogador)
		}

		personagens := api.Group("/personagens")
		{
			personagens.GET("/jogador/:jogador_id", handler.GetPersonagensByJogador)
			personagens.POST("", handler.CreatePersonagem)
			personagens.GET("/:id", handler.GetPersonagemByID)
			personagens.PUT("/:id", handler.UpdatePersonagem)
			personagens.DELETE("/:id", handler.DeletePersonagem)

			personagens.GET("/:id/itens", handler.GetItensByPersonagem)
			personagens.POST("/:id/itens", handler.AddItem)
			personagens.PUT("/:id/items", handler.UpdateItem)
			personagens.DELETE("/:id/items/delete", handler.DeleteItem)
		}
		

	}

	return r
}