FROM node:18-alpine AS development

RUN apk add --no-cache openssl
WORKDIR /app/usr/src/hackathon-nest-49-7soat-fiap

COPY package*.json ./

RUN npm install --ignore-scripts

COPY src ./src
COPY tsconfig.json ./
COPY nest-cli.json .
COPY prisma ./prisma
COPY test ./test

RUN npx prisma generate && npm run build


FROM node:18-alpine AS production

RUN addgroup -S nonroot \
    && adduser -S nonroot -G nonroot

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app/usr/src/hackathon-nest-49-7soat-fiap

COPY package*.json ./

RUN npm install --production --ignore-scripts

COPY tsconfig.json ./

COPY --from=development /app/usr/src/hackathon-nest-49-7soat-fiap/dist ./dist
COPY --from=development /app/usr/src/hackathon-nest-49-7soat-fiap/prisma ./prisma
RUN ls -l /app/usr/src/hackathon-nest-49-7soat-fiap/dist/src
RUN npx prisma generate

USER nonroot

CMD [ "npm", "run", "start:prod" ]