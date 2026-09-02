FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html/ /usr/share/nginx/html/
# SSL certificates will be mounted as a volume for safety
EXPOSE 80 443
