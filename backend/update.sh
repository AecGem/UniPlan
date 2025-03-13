#!/bin/bash
export HOME="/var/www"
BUILDDIR="var/www/frontend/dist"
git config --global --add safe.directory /var/www/UniPlan
cd /var/www/UniPlan
echo $PWD
whoami
git restore .
git pull
git status
git submodule sync
git submodule update
git submodule status
echo "updated!"
#visible separation
#Update node modules and whatnot
sudo systemctl stop uniplanner
cd /var/www/UniPlan/backend
/home/alex1/.bun/bin/bun install
npx prisma migrate dev
sudo systemctl start uniplanner
echo "Backend updates complete, daemon restarted!"
#Frontend Updates
cd /var/www/UniPlan/frontend
#sudo systemctl stop frontend
#/home/alex1/.bun/bin/bun install
echo "Rebuilding frontend dependencies..."
yarn install
echo "Rebuilding frontend via vite..."
#sudo systemctl start frontend
/home/alex1/.bun/bin/bunx vite build $BUILDDIR
echo "-----------------------"
echo "All updates complete!"