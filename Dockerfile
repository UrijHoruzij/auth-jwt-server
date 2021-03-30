FROM node:12

WORKDIR /auth-server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
CMD ["node","index.js"]