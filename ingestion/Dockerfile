FROM node:14-bullseye
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY dist dist
CMD ["yarn", "prod"]
