FROM node:12-alpine3.10

# Create app directory
WORKDIR /usr/cell

# Install app dependencies
COPY ./package.json ./
COPY yarn.lock ./

RUN yarn install --production

# Bundle app source
COPY ./lib ./lib

EXPOSE 8080
CMD [ "node", "lib/env.docker.js" ]
