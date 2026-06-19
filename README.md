# RadarLeads

RadarLeads e um projeto fullstack para encontrar empresas locais com potencial de contratar servicos de desenvolvimento web. O backend abre o Google Maps com Playwright, coleta dados publicos de empresas, calcula score comercial e salva tudo no Firebase Firestore. O frontend exibe dashboard, filtros e tabela operacional.

## Stack

- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Node.js, Express, TypeScript
- Banco: Firebase Firestore via Firebase Admin SDK
- Scraping: Playwright
- Qualidade: ESLint, TypeScript build, Docker

## Requisitos

- Node.js 24 ou superior
- npm 11 ou superior
- Docker e Docker Compose, opcional

## Instalacao

```bash
npm install
npx playwright install chromium
```

Copie as variaveis de ambiente e preencha as credenciais do Firebase:

```bash
cp .env.example .env
```

Voce pode configurar o Firebase de duas formas:

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`
- ou `FIREBASE_SERVICE_ACCOUNT` com o JSON completo da service account

O bloco `firebaseConfig` do Web SDK contem `apiKey`, `authDomain`, `appId` e outros dados publicos do app web. Ele nao substitui a service account usada pelo backend. Para este projeto, gere uma chave em Firebase Console > Project settings > Service accounts > Generate new private key e copie os campos para o `.env`.

As empresas sao salvas na collection `companies`.

## Execucao local

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- Healthcheck: http://localhost:3333/health

## Comandos

```bash
npm run lint
npm run typecheck
npm run build
npm run dev --workspace backend
npm run dev --workspace frontend
```

## API REST

```http
GET /companies
GET /companies?noSite=true
GET /companies?hasSite=true
GET /companies?minScore=100
GET /companies/top
GET /companies/:id
POST /search
```

Body de busca:

```json
{
  "query": "restaurantes em Manaus"
}
```

## Score

- Sem site: +100
- Mais de 100 avaliacoes: +50
- Possui telefone: +20
- Possui site: -50

## Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333

## Estrutura

```text
RadarLeads/
  backend/
    src/
      db/
      routes/
      services/
      types/
  frontend/
    src/
      components/
      lib/
  docker-compose.yml
```

## Observacoes sobre scraping

O Google Maps muda seletores e pode aplicar bloqueios ou consentimentos por regiao. A implementacao usa Playwright real, sem dados ficticios, com seletores defensivos para nome, telefone, endereco, site, categoria, avaliacao e quantidade de avaliacoes. Caso um campo nao esteja visivel na pagina, ele e salvo como vazio.
"# RadarLeads" 
"# RadarLeads" 
