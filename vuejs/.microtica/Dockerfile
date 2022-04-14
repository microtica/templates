# Stage 1; build and compile the frontend
FROM public.ecr.aws/docker/library/node:14.19.0-slim as build-stage

WORKDIR /app

COPY ./package.json ./
COPY ./yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2; nginx
FROM public.ecr.aws/nginx/nginx

COPY --from=build-stage /app/dist/ /usr/share/nginx/html
COPY ./.microtica/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]