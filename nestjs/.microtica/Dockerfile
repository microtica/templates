FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]