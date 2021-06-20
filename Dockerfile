FROM node:alpine3.12

RUN mkdir -p /usr/app

WORKDIR /usr/app

COPY package*.json .

RUN npm install

RUN mkdir /usr/app/build

COPY build  build

ENV PORT=80

EXPOSE 80

CMD npm start