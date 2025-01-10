FROM node:18-alpine AS development

RUN apk add --no-cache openssl
WORKDIR /usr/src/hackathon-nest-49-7soat-fiap

COPY package*.json ./

RUN yarn install --ignore-scripts

COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json .
COPY prisma ./prisma
COPY test ./test

RUN yarn prisma generate && yarn run build


FROM node:18-alpine AS production

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/hackathon-nest-49-7soat-fiap

COPY package*.json ./

RUN yarn install --production --ignore-scripts

COPY tsconfig.json ./

COPY --from=development /usr/src/hackathon-nest-49-7soat-fiap/dist ./dist
COPY --from=development /usr/src/hackathon-nest-49-7soat-fiap/prisma ./prisma

RUN yarn prisma generate

USER nonroot

CMD [ "yarn", "run", "start:prod" ]