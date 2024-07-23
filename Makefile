migrate_database:
	npx prisma migrate dev --name init

test_get_data:
	ab \
	-n 100000 \
	-c 20000 \
	-T application/json \
	-m GET \
	http://localhost:10000/account/api/v1/public/auth/ping