FROM node:20 AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
ARG VITE_API_HOST
ENV VITE_API_HOST=$VITE_API_HOST
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
