infra-up:
	docker compose up -d db

dev:
	npm run dev

start:
	docker compose up --build

db-push:
	npm run db:push -w backend

db-generate:
	npm run db:generate -w backend

db-migrate:
	npm run db:migrate -w backend

db-studio:
	npm run db:studio -w backend
