FROM --platform=linux/amd64 node:alpine
WORKDIR /usr/typescript-backend
COPY . .
RUN npm install --platform=linuxmusl --arch=x64 && npm install typescript -g
RUN tsc
CMD ["node", "./dist/index.js"]