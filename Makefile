infra-up:
	docker compose up -d db

dev:
	npm run dev

start:
	docker compose up --build
