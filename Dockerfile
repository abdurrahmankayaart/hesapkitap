# Hesap Kitap web yayını (Coolify): yalnızca web dosyalarını Nginx ile sunar.
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html privacy.html manifest.webmanifest sw.js icon.svg icon-192.png icon-512.png og.png /usr/share/nginx/html/
EXPOSE 80
