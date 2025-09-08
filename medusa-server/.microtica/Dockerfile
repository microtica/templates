FROM public.ecr.aws/docker/library/node:22-slim

WORKDIR /medusa

COPY . .

ENV NODE_ENV production

CMD npx medusa db:migrate && cd .medusa/server && npm run start