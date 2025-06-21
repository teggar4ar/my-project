FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY ./simple-blog/package*.json ./

# Install app dependencies
RUN npm install --production

# Bundle app source
COPY ./simple-blog .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
