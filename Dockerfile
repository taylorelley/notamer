# Use the official Nginx image as base
FROM nginx:alpine

# Copy the web application files to the Nginx web directory
COPY src/ /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
