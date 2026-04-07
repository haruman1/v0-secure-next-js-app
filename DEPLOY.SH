#!/bin/bash
set -e

APP_DIR="/www/wwwroot/medivaq"
RELEASES_DIR="$APP_DIR/releases"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

echo "Deploy started at $TIMESTAMP"

# create release
mkdir -p "$RELEASE_DIR"

# extract
tar -xzf /tmp/deploy/dist-medivaq.tar.gz -C "$RELEASE_DIR"

# VALIDASI
if [ ! -f "$RELEASE_DIR/server.js" ]; then
  echo "❌ server.js not found!"
  exit 1
fi

# symlink
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

# env
cat > "$APP_DIR/current/.env" <<EOF
NODE_ENV=production
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
APP_URL=$APP_URL
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_FROM
EOF

chmod 600 "$APP_DIR/current/.env"

echo "Reload PM2 ecosystem"
/www/server/nvm/versions/node/v24.14.0/bin/pm2 startOrReload /www/wwwroot/medivaq/ecosystem.config.cjs --update-env

echo "Save PM2"
/www/server/nvm/versions/node/v24.14.0/bin/pm2 save

echo "Cleanup old releases"
# cleanup
rm -f /tmp/deploy/dist-medivaq.tar.gz /tmp/deploy/DEPLOY.SH
cd "$RELEASES_DIR"
ls -dt */ | tail -n +6 | xargs rm -rf

echo "Deploy success!"