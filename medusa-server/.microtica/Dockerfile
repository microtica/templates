FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /medusa

COPY package.json ./

RUN yarn install

COPY . .

RUN yarn build
RUN npm install @medusajs/medusa-cli -g

ENV NODE_ENV production

CMD npx medusa db:migrate && cd .medusa/server && npm run start