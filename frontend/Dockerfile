# --- Estágio 1: Build (Node) ---
# Usa a imagem do Node para compilar o React
FROM node:18-alpine AS builder

WORKDIR /app

# Copia o package.json e instala as dependências
COPY package.json package-lock.json ./
RUN npm install

# Copia o resto do código-fonte
COPY . .

# Compila o React para produção
RUN npm run build

# --- Estágio 2: Serve (Nginx) ---
# Usa a imagem oficial do Nginx para servir os arquivos estáticos
FROM nginx:1.25-alpine

# Copia os arquivos estáticos compilados (do /app/build)
COPY --from=builder /app/build /usr/share/nginx/html

# Copia nossa configuração personalizada do Nginx (o reverse proxy)
# Este é o arquivo mais importante!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (porta padrão do Nginx)
EXPOSE 80