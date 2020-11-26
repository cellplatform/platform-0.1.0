FROM node:12-alpine3.10

# Create app directory
WORKDIR /usr/src/cell

# Install app dependencies
COPY ./package.json ./
COPY yarn.lock ./

RUN yarn install --production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "lib" ]
