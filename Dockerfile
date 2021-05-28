FROM node:alpine

WORKDIR /app
COPY . /app

RUN apk add --no-cache --update npm && \
    npm install

EXPOSE 3000
CMD ["node", "/app/app.js"]