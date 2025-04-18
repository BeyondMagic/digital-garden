export-env {
	
	$env.POSTGRES_USER = 'postgres'
	$env.POSTGRES_PASSWORD = '123456'
	$env.POSTGRES_DB = 'postgres'

	# Alternative connection URL
	#$env.DATABASE_URL = 'postgres://postgres:123456@localhost:5432/postgres'

	# Primary connection URL for PostgreSQL
	$env.POSTGRES_URL = 'postgres://postgres:123456@localhost:5432/postgres'


	# SSL/TLS-enabled connection URL
	#$env.TLS_POSTGRES_DATABASE_URL =

	# Alternative SSL/TLS-enabled connection URL
	#$env.TLS_DATABASE_URL =

	# Database host
	#$env.PGHOST = 'localhost'

	# Database port
	#$env.PGPORT = '5432'

	# Database user
	#$env.PGUSERNAME = 'postgres'

	# Database password
	#$env.PGPASSWORD = '123456'

	# Database name
	#$env.PGDATABASE = 'postgres'
}