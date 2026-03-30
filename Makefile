infra-up:
	docker compose up -d db

dev:
	npm run dev

start:
	docker compose up --build

db-push:
	npm run db:push -w backend

db-studio:
	npm run db:studio -w backend
