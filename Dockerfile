FROM nginx:alpine
COPY index.html styles.css app.js sites-incriveis.js sites-incriveis.css /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets
COPY links /usr/share/nginx/html/links
EXPOSE 80
