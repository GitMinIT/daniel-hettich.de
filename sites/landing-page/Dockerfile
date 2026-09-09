FROM nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html/ /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY lang/ /usr/share/nginx/html/lang/
EXPOSE 8080