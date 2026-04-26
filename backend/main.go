package main

import (
	"fmt"
	"gerenciador-de-fichas/internal/router"
	"gerenciador-de-fichas/internal/storage"
)

func main() {
	storage.NewPostgresStorage()

	r := router.SetupRouter()

	fmt.Println("Servidor Gin rodando em http://localhost:8080")
	r.Run(":8080")
}
