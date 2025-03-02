# Etapa 1: Construção do Vue.js
FROM node:18 AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install

# Instalar o Vite globalmente
RUN npm install -g vite

COPY . .

RUN npm run build

# Etapa 2: Configuração do Nginx para servir os arquivos estáticos
FROM nginx:alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Substitui a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5000 

CMD ["nginx", "-g", "daemon off;"]
