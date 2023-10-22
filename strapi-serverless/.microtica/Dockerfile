FROM public.ecr.aws/docker/library/node:18-slim

WORKDIR /strapi

COPY ./package.json ./

RUN yarn install

COPY . .

ENV NODE_ENV production 

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]