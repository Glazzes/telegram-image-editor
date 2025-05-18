FROM node:22.3.0-alpine
WORKDIR /app
COPY dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-p", "3000"]
