FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port de développement Vite
EXPOSE 3000

# Commande de démarrage (serveur de dev)
CMD ["npm", "run", "dev"]
