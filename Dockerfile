FROM node:12

WORKDIR /express-jwt

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
CMD ["node","index.js"]