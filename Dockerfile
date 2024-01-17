FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
# Expose port 8080
ARG port = normalizePort(process.env.PORT || '3000')
EXPOSE ${port}
USER node
CMD ["npm", "start"]
