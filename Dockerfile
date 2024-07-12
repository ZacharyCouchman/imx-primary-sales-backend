# Use the official Node.js image.
FROM node:18.16.1

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Run Prisma migrations and generate the client.
RUN npx prisma migrate dev
RUN npx prisma generate

# Build the TypeScript code.
RUN echo "Building TypeScript code..."
RUN npm run build

# Expose the port that the app runs on.
EXPOSE 3000

# Command to run the application.
CMD ["node", "dist/server.js"]