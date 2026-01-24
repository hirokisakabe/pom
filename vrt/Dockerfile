# syntax=docker/dockerfile:1
FROM node:22-slim

# システムパッケージのインストール（BuildKitキャッシュマウント使用）
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-impress \
    imagemagick \
    ghostscript \
    fonts-noto-cjk \
    fonts-noto-cjk-extra \
    && rm -rf /usr/share/doc/* \
    && rm -rf /usr/share/man/* \
    && sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml

WORKDIR /app

# npm依存のインストール（BuildKitキャッシュマウント使用）
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# アプリケーションコードのコピー
COPY . .

CMD ["npm", "run", "vrt"]
