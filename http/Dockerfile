# Usa a imagem do Node.js
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do servidor
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]
