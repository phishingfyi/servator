FROM node:alpine

WORKDIR /app
COPY . /app

RUN apk add --update npm && \
    rm -rf /var/cache/apk/* && \
    npm install

EXPOSE 3000
CMD ["node", "/app/app.js"]