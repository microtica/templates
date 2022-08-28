# Stage 1; build and compile the frontend
FROM public.ecr.aws/docker/library/node:16.16.0-slim

WORKDIR /app

COPY . .

RUN npm install

ENV NODE_ENV production

RUN npm run build

EXPOSE 9000

CMD npm run serve