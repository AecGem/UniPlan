# UniPlan - DevOps and Out of Scope
Hello! This is a brief overview of all miscellaneous devops tooling used in the Uniplanner project. Items may be nested in folders, or in the root directory.

## Systemd Daemon:

### uniplanner.service
Callable systemd daemon file, placed in /lib/systemd/system for use in starting/restarting the service by name.

### dyndns.service and dyndns.timer
Automatic systemd daemon files, placed in /lib/systemd/system for running the Dynamic-DNS-Client. The .timer file defines when unix runs the .service.

## Dynamic-DNS-Client:
Python script from github.com/AecGem/Dynamic-DNS-Client

Used to run Dynamic Domain Name Service registry updates, so that uniplanner.ca points to the correct server. Used with permission (because I made it lol).

## Git Deployment Lain:

### deploy.php:
A fork of the git deployment hamster. An apache2 webserver listens on exclusively http://uniplanner.ca/deploy.php, and if an allowed IP address makes a request, it serves deploy.php, which runs/reads out the results of the update.sh script.

### update.sh:
Custom update script used to automatically update and deploy the uniplanner app. It handles cleaning, dependencies, database schema/migration, bundling, cpp make, and etc.