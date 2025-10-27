// /cmd/server/main.go
package main

import (
	"fmt"
	"gerenciador-de-fichas/internal/router"
	"gerenciador-de-fichas/internal/storage"
)

func main() {
	storage.NewMemoryStorage()

	router := router.SetupRouter()

	fmt.Println("Servidor Gin rodando em http://localhost:8080")
	router.Run(":8080")
}