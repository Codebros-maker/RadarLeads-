FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json backend/
RUN npm install
RUN npx playwright install --with-deps chromium

FROM deps AS build
COPY backend backend
RUN npm run build --workspace backend

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PLAYWRIGHT_HEADLESS=true
COPY --from=deps /app/node_modules node_modules
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright
COPY --from=build /app/backend/dist backend/dist
COPY backend/package.json backend/package.json
EXPOSE 3333
CMD ["npm", "run", "start", "--workspace", "backend"]
