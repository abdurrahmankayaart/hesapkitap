# Hesap Kitap (Coolify): web dosyalarını sunar ve cihazlar arası eşitleme verisini /data altında saklar.
# /data kalıcı disk olmalı (Coolify → Storages); yoksa her yayında eşitleme verisi silinir.
FROM node:22-alpine
WORKDIR /app
COPY server.js ./
COPY index.html privacy.html manifest.webmanifest sw.js icon.svg icon-192.png icon-512.png og.png ./public/
ENV PORT=80 DATA_DIR=/data
EXPOSE 80
CMD ["node", "server.js"]
