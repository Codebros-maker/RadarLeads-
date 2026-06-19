FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json frontend/
RUN npm install
COPY frontend frontend
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
