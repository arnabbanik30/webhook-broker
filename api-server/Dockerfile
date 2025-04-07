# Use the official Node.js 23 image as a base
FROM node:23

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./


# Copy the rest of the application code to the working directory
COPY src/ ./src/
COPY tsconfig.json ./tsconfig.json

# Install the dependencies and build the application
RUN npm install
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]