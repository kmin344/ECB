FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
COPY ../../shared-lib ../shared-lib

RUN npm install

COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
