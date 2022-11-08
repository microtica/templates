FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /medusa

COPY package.json ./

RUN yarn install

COPY . .

ENV NODE_ENV production

RUN yarn build
RUN npm install @medusajs/medusa-cli -g

EXPOSE 9000

CMD ["./develop.sh", "start"]