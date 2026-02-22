#!/usr/bin/env -S nu --stdin
# 
# SPDX-FileCopyrightText: 2026 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
# SPDX-License-Identifier: AGPL-3.0-or-later

export-env {

	# Must be at least 32 characters long and contain a mix of uppercase, lowercase, numbers, and special characters for security.
	$env.JWT_SECRET = "sUPer@sEcreT!key.for-jwt_tOkEn-Generat1on"

	# The folder where assets will be stored.
	$env.PUBLIC_ROOT = (^git rev-parse --show-toplevel | str trim) + "/public/"

	# The domain of the website it will be running on.
	$env.DOMAIN = "localhost:3001"
	
	$env.POSTGRES_USER = 'postgres'
	$env.POSTGRES_PASSWORD = '123456'
	$env.POSTGRES_DB = 'postgres'

	# Alternative connection URL
	#$env.DATABASE_URL = 'postgres://postgres:123456@localhost:5432/postgres'

	# Primary connection URL for PostgreSQL
	$env.POSTGRES_URL = 'postgres://postgres:123456@localhost:5432/postgres'

	# Set the timezone (GMT-3)
	$env.TZ = 'America/Sao_Paulo'


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