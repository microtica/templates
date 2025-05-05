FROM public.ecr.aws/docker/library/golang:1.19.1-buster

WORKDIR /app

COPY . .

RUN go build

CMD ["go", "run", "main.go"]