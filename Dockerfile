FROM node:alpine3.12

RUN mkdir -p /usr/app

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

RUN rm -r src

ENV PORT=80

EXPOSE 80

CMD npm start