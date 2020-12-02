FROM node:12-alpine3.10

# Create app directory.
WORKDIR /usr/cell

# Install dependencies.
COPY ./package.json ./

RUN yarn install --production

# Bundle source.
COPY ./lib ./lib

EXPOSE 8080
CMD [ "node", "lib/env.docker.js" ]
