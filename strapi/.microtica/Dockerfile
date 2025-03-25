FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /strapi

COPY ./package.json ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build

CMD ["yarn", "start"]