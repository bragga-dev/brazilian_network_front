# =========================================================
# Dockerfile do frontend (brazilian_network_frontend)
# Raiz do repositório do front. Quem builda é o docker-compose.prod.yml
# do back (serviço `nginx`, context = FRONTEND_DIR).
# =========================================================

# ---- Stage 1: build da SPA (Vite + React) ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL da API relativa: o próprio Nginx faz o proxy para /api,
# então frontend e backend ficam na mesma origem (sem CORS!)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Client ID do Google (público). Vem do build arg do compose (GOOGLE_CLIENT_ID do .env do back),
# pois o .env do front não entra na imagem (.dockerignore).
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ---- Stage 2: serve os arquivos estáticos com Nginx ----
FROM nginx:1.27-alpine

# A config do Nginx NÃO fica na imagem: o docker-compose do back monta
# infra/nginx/nginx.conf e infra/nginx/templates/* (renderizados na subida).
RUN rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80