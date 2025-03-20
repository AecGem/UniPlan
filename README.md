# UniPlan
University Degree Registration Planner

hai! :3


## Tech stack and dependancies:

### Tech stack.
Frontend frameworks: React/TailwindCSS + HTML/CSS/Js/Etc. with Vite tooling.

Service Backend: ElysiaJS on Bun/Yarn, Apache2, Prisma (Nginx distribution implementation out of scope pending further development.)

Databases: PostgreSQL

### Tool dependancies.
Git Deployment Hamster / deploy.php, running on apache2

AecGem Dynamic-DNS-Client, running via python3

## Site mapping rules:
Port 80 (HTTP): Redirected or denied on all except uniplanner.ca/deploy.php. Apache is now a glorified zoo for the deployment hamster.

Port 443 (HTTPS): Accept via Elysia. Only serves files allowed via /backend/src/index.ts