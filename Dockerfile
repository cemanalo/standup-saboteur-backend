FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm i -g @nestjs/cli
RUN npm install --only=production

COPY . .
RUN npm run build

CMD ["npm", "run", "start:prod"]