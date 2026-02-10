<p align="center">
  <a href="https://nestjs.com/" target="_blank" rel="noreferrer">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

# DotGroup Backend

API da plataforma DotGroup, desenvolvida com NestJS + TypeORM + PostgreSQL + MinIO.

## Requisitos

- Node.js 22+
- npm
- Docker e Docker Compose

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Configure o `.env` (use `.env.example` como base):

```bash
POSTGRES_HOST="localhost"
POSTGRES_DB="dotgroup"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_PORT="5432"
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_CONSOLE_PORT="9001"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="dotgroup-images"
MINIO_REGION="us-east-1"
MINIO_URL_EXPIRY_SECONDS="3600"
UPLOAD_MAX_FILE_SIZE_BYTES="5242880"
```

3. Suba os containers de infraestrutura:

```bash
docker compose up -d
```

## Execução

- `npm run start:dev`: desenvolvimento (watch)
- `npm run start`: execução normal
- `npm run build && npm run start:prod`: produção

A API sobe por padrão em `http://localhost:3000`.

Swagger: `http://localhost:3000/swagger`

## Scripts

- `npm run test`

## Módulos

- `users`
- `courses`
- `classes`
- `enrollments`
- `uploads`

## Qualidade

Recomendado antes de merge:

```bash
npm run lint
npm run test
npm run build
```
