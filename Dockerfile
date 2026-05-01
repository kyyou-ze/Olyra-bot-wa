FROM node:18-bullseye

# Install system dependencies required for npm packages
RUN apt-get update && \
  apt-get install -y \
  build-essential \
  python3 \
  ffmpeg \
  imagemagick \
  webp \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-optional

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
