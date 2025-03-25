FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "index.js"]