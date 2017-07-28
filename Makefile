serve:
	cd backend && rails s

watch_frontend:
	cd frontend && npm run watch

compile_frontend:
	cd frontend && npm run build