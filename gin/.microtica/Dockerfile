FROM public.ecr.aws/docker/library/golang:1.19.0-buster

WORKDIR /app

COPY . .

RUN go build

EXPOSE 8080

CMD ["go", "run", "main.go"]