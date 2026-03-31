#!/bin/bash

# Configuration
APP_DIR="/www/wwwroot/medivaq"
RELEASES_DIR="$APP_DIR/releases"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

echo "=============================="
echo "Deploy started at $TIMESTAMP"
echo "=============================="

# Create release directory
echo "Create release folder"
mkdir -p "$RELEASE_DIR"

# Extract build
echo "Extract build"
tar -xzf /tmp/deploy/dist-medivaq.tar.gz -C "$RELEASE_DIR"

# Update symlink
echo "Update current symlink"
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

# Create .env file for runtime
echo "Generating .env file"
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

# Cleanup tmp files
echo "Cleanup tmp files"
rm -f /tmp/deploy/dist-medivaq.tar.gz /tmp/deploy/DEPLOY.SH

# Keep last 5 releases
echo "Removing old releases"
cd "$RELEASES_DIR" || exit
ls -dt */ | tail -n +6 | xargs rm -rf

# Restart service using PM2
echo "Reloading PM2 service"
# Note: Ensure the path to ecosystem.config.cjs is correct relative to the script
/www/server/nvm/versions/node/v24.14.0/bin/pm2 startOrReload "$APP_DIR/ecosystem.config.cjs" --update-env

echo "Saving PM2 state"
/www/server/nvm/versions/node/v24.14.0/bin/pm2 save

echo "=============================="
echo "Deploy success!"
echo "=============================="