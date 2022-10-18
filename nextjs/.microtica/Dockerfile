FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /app

COPY ./package.json ./
COPY ./yarn.* ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]