FROM node:24-alpine

WORKDIR /app

# Installer git
RUN apk add --no-cache git

# Configure Git pour utiliser HTTPS avec le token
ARG GITHUB_TOKEN
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080
CMD ["node", "src/index.js"]