FROM node:11-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json yarn.lock ./

USER node
RUN yarn install --ignore-scripts --production

COPY --chown=node:node lib lib
ENV NODE_ENV="production"
ENV DOCKER="true"

