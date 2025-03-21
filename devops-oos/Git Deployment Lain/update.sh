#!/bin/bash
echo "Current user: $USER "
export HOME="/var/www"
BUILDDIR="/var/www/frontend/dist"
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
echo "--------------------------------------"
echo "Repo updated!"


#Update Bun Dependencies
sudo systemctl stop uniplanner
cd /var/www/UniPlan/backend
/home/alex1/.bun/bin/bun install
/home/alex1/.bun/bin/bunx prisma db pull --force
/home/alex1/.bun/bin/bunx prisma generate
sudo chmod 775 /var/www/UniPlan -R
/home/alex1/.bun/bin/bunx @better-auth/cli generate -y
#sudo systemctl start uniplanner
#/home/alex1/.bun/bin/bunx prisma migrate dev
echo "--------------------------------------"
echo "Backend updates complete, daemon restarted!"


#Frontend Updates
cd /var/www/UniPlan/frontend
echo "Rebuilding frontend dependencies..."
/home/alex1/.bun/bin/bun install
echo "--------------------------------------"
echo "Done. Rebuilding frontend via vite..."

#Clear out the build directory
sudo rm -rf /var/www/UniPlan/frontend/dist/
/home/alex1/.bun/bin/bunx vite build
echo "--------------------------------------"
echo "Done. Frontend statics built to $BUILDDIR"
sudo systemctl start uniplanner
#Building
cd /var/www/UniPlan/backend/src/middleware
make all