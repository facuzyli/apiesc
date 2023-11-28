FROM node:18.4-alpine
WORKDIR /app
COPY /src .
RUN npm install --production
CMD [ "npm", "run", "start" ]