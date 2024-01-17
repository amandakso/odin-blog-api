# Dockerfile
FROM node:16
WORKDIR /app
COPY . /app
RUN npm install
ENV PORT 3000
EXPOSE 3000
CMD ["npm", "start"]