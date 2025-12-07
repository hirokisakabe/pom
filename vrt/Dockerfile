FROM node:22-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "run", "vrt"]
