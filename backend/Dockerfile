# --- Estágio 1: Build ---
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main .

# --- Estágio 2: Final ---
# Uses distroless/static instead of scratch so TLS certificates are available
# (required for HTTPS calls to Supabase Storage)
FROM gcr.io/distroless/static

COPY --from=builder /app/main /main

EXPOSE 8080

ENTRYPOINT ["/main"]
