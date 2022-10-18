FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /strapi

COPY ./package.json ./
COPY ./yarn.* ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]