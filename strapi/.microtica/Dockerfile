FROM public.ecr.aws/docker/library/node:14.19.0-slim

WORKDIR /strapi

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]