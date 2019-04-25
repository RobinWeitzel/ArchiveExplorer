FROM node:10

ENV mongourl url
ENV mongodb mailarchive

WORKDIR /app

COPY package.json /app
RUN npm install
COPY . /app

CMD node index.js
EXPOSE 8081