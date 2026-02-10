<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
</p>

# DotGroup Backend

Backend da aplicação DotGroup desenvolvido com NestJS e PostgreSQL.

## Descrição

Este é um backend progressivo construído com o framework [Nest](https://github.com/nestjs/nest) para gerenciamento de cursos, turmas, usuários e matrículas.

## Pré-requisitos

Para rodar este projeto, é necessário ter instalado:

- **VS Code** ou IDE de sua escolha
- **Node.js** (versão 22.22.0 ou superior)
- **Docker** e **Docker Compose**

## Instalação e Configuração

### 1. Preencher as variáveis de ambiente

Preencha todos os dados do arquivo `.env` na raíz do projeto com as credenciais necessárias:

```bash
POSTGRES_USER=seu_usuario
POSTGRES_PASSWORD=sua_senha
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=dotgroup
```

### 2. Instalar dependências

Instale todas as dependências do projeto:

```bash
npm install
```

### 3. Iniciar o banco de dados

Suba o container Docker com o PostgreSQL:

```bash
docker compose up -d
```

### 4. ⚠️ Primeiro Passo: Sincronizar as Tabelas

**IMPORTANTE:** O projeto usa `synchronize: true`, o que significa que as tabelas são criadas automaticamente quando a aplicação inicia. Para sincronizar todas as tabelas no banco de dados:

Inicie a aplicação em modo desenvolvimento:

```bash
npm run start:dev
```

Crie um usuário através da API (POST request):

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome do Usuário",
    "email": "usuario@example.com",
    "type": "STUDENT"
  }'
```

Isto acionará o TypeORM para sincronizar todas as tabelas e suas relações com Foreign Keys.

## Execução do projeto

### Modo desenvolvimento (com watch)

```bash
npm run start:dev
```

### Modo produção

```bash
npm run build
npm run start:prod
```

## Testes

```bash
# Testes unitários
npm run test

# Testes unitários em modo watch
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes e2e
npm run test:e2e
```

## Estrutura do Projeto

```
src/
├── users/              # Módulo de usuários
├── courses/            # Módulo de cursos
├── classes/            # Módulo de turmas
├── enrollments/        # Módulo de matrículas
├── common/             # Utilitários e helpers compartilhados
├── db/                 # Configuração do banco de dados
├── app.module.ts       # Módulo raiz da aplicação
└── main.ts             # Arquivo principal
```

## Relações do Banco de Dados

### Foreign Keys e Integridade Referencial

O projeto implementa Foreign Keys com as seguintes regras:

- **Course → Classes**: `onDelete: 'RESTRICT'` - Impede deletar um curso que possui turmas
- **User → Classes**: `onDelete: 'RESTRICT'` - Impede deletar um professor que possui turmas
- **Class → Enrollments**: `onDelete: 'CASCADE'` - Deleta automaticamente as matrículas ao deletar uma turma
- **User → Enrollments**: `onDelete: 'CASCADE'` - Deleta automaticamente as matrículas ao deletar um usuário
- **Course → Enrollments**: `onDelete: 'CASCADE'` - Deleta automaticamente as matrículas ao deletar um curso

### Comportamento de Deleção

- ✅ **Possível deletar**: Cursos/Usuários/Professores sem dependências
- ❌ **Não será possível deletar**:
  - Curso com turmas ativas
  - Professor com turmas atribuídas
  - Turma com matrículas ativas
- 🔄 **Deletado automaticamente**: Matrículas quando sua turma/curso/usuário for deletado

## Ferramentas e Tecnologias

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Linguagem**: TypeScript
- **Containerização**: Docker & Docker Compose
