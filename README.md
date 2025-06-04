# [https://tonebuilder.ai/](https://tonebuilder.ai/)

An AI-powered, chat-based tone architect that helps musicians create presets for any multi-effects processor.

## Installation

1. Clone the repository

2. Install [asdf](https://github.com/asdf-vm/asdf) and plugins

```bash
asdf plugin add nodejs
```

3. Run `asdf` install

```bash
asdf install
```

4. Install dependencies

```bash
npm install
```

5. Set up the environment variables:

- Copy the `.env.example` file to `.env`
- Open the `.env` file and fill in the necessary environment variables, including your PostgreSQL database URL

6. Set up Prisma and the database:

- Generate Prisma client:

```bash
npm run db:generate
```

- Run migrations and seed initial data:

```bash
npm run db:migrate
```

These commands will set up your database schema, apply all existing migrations, and populate the database with seed data.

7. Start the development server 🚀

```bash
npm run dev
```
