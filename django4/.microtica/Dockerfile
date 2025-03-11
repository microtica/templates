FROM public.ecr.aws/docker/library/python:3.11.0-slim

WORKDIR /app

ARG PORT=8000
ENV PORT=$PORT

COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000
CMD python manage.py runserver 0.0.0.0:${PORT}