# Stage 1; build and compile the frontend
FROM public.ecr.aws/docker/library/node:16.16.0-slim as build-stage

WORKDIR /app

COPY ./package.json ./

RUN yarn install

COPY . .

RUN yarn build

# Stage 2; nginx
FROM public.ecr.aws/nginx/nginx

RUN apt-get update && apt-get install -y gettext-base

COPY --from=build-stage /app/dist/ /usr/share/nginx/html
COPY ./.microtica/nginx.conf /etc/nginx/conf.d/default.conf

COPY ./.microtica/nginx.conf /etc/nginx/conf.d/default.template

CMD envsubst '$PORT' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && \
    nginx -g 'daemon off;'