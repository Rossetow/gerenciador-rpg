# --- Estágio 1: Build ---
# Usa a imagem oficial do Go como 'builder'
FROM golang:1.25-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de módulo e baixa as dependências
COPY go.mod go.sum ./
RUN go mod download

# Copia todo o resto do código-fonte
COPY . .

# Compila a aplicação.
# CGO_ENABLED=0 cria um binário estático (essencial para o 'scratch')
# -o /app/main define o nome do arquivo de saída
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main .

# --- Estágio 2: Final ---
# Começa de uma imagem 'scratch' (vazia) para segurança e tamanho mínimo
FROM scratch

# Copia apenas o binário compilado do estágio 'builder'
COPY --from=builder /app/main /main

# (Opcional: Copia certificados, se seu app fizesse chamadas HTTPS)
# COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Expõe a porta que o Gin usa
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["/main"]