# Giai đoạn build
FROM node:20-alpine AS build
WORKDIR /app

# Cài đặt dependencies
# Copy package.json (we'll use npm inside the container to avoid yarn v4 lockfile issues)
COPY package.json ./
# Install dependencies using npm
RUN npm install --silent --no-audit --no-fund

# Copy source code
COPY . .

# Build production
RUN npm run build

# Giai đoạn chạy production
FROM node:20-alpine AS production
WORKDIR /app

# Cài đặt serve để chạy file tĩnh (dùng npm ở production để tránh phụ thuộc vào yarn)
RUN npm install -g serve --silent

# Copy file build từ giai đoạn build sang
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Dùng serve để serve thư mục dist
CMD ["serve", "-s", "dist", "-l", "3000"]
