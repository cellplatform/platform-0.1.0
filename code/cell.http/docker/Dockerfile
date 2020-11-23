FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY ./package.json ./
COPY yarn.lock ./

RUN yarn install --production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "lib/index" ]
