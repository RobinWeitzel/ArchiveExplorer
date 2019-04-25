FROM node:10

ENV mongourl url
ENV mongodb mailarchive
ENV port 8080

WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

CMD node server.js