FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /app

COPY ./package.json ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=${PORT}

CMD ["yarn", "start"]