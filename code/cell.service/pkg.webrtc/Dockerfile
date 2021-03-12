FROM node:12-alpine3.10

# Create app directory.
WORKDIR /usr/cell.rtc

# Install dependencies.
COPY ./package*.json ./
RUN npm install --production

# Bundle source.
COPY ./lib ./lib

EXPOSE 9000
CMD [ "node", "lib/start.js" ]
