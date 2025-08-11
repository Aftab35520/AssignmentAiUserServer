# Use Selenium standalone Chrome image
FROM selenium/standalone-chrome:latest

# Switch to root to install system packages
USER root

# Install Node.js 18
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app



# Copy package files and install dependencies first (for caching)
COPY package*.json ./
RUN npm install


RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Copy the rest of your application
COPY . .

# Optional: expose port 5000 (matches your app)
EXPOSE 5000

# Switch back to non-root Selenium user for security
USER root

# Run the server
CMD ["node", "server.js"]
