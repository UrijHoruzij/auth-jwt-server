FROM node:12

WORKDIR /auth-server

COPY package*.json ./

RUN npm install
RUN npm install pm2 -g

COPY . .

EXPOSE 5000
CMD ["pm2","start index.js"]