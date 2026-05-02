FROM node:18-bullseye

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# Buat folder yang dibutuhkan
RUN mkdir -p media tmp

EXPOSE ${PORT:-5000}

CMD ["npm", "start"]
