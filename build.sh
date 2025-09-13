#!/usr/bin/env bash
# Build script for Render

echo "Installing dependencies..."
npm install

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Generating Prisma client..."
npx prisma generate

echo "Build completed successfully!"
