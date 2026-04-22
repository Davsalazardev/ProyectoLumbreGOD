.PHONY: up down build logs seed reset dev-backend dev-frontend

# Docker
up:
	docker-compose up

build:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs -f

reset:
	docker-compose down -v
	docker-compose up --build

# Local dev
dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm start

install:
	cd backend && npm install
	cd frontend && npm install

seed:
	cd backend && npm run seed

db-push:
	cd backend && npm run prisma:push

# Docker individual services
ps:
	docker-compose ps
