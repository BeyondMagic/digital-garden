# 

# Run the cli to delete the database.
export def delete_database []: nothing -> any {
	bun [
		'./source/cli/delete.js'
	]
}

# Run cli of developer mode of the server.
export def dev []: nothing -> any {
	bun [
		'--hot'
		'./source/cli/main.js'
	]

}

# Run the database in production mode.
export def database []: nothing -> any {
	docker [
		compose
		up	
	]
}

# Execute docker command with the given arguments.
export def docker [
	args: list<string> = []
]: nothing -> any {
	source ./env/env.nu

	(
		^docker 
		...$args
	)
}

# Execute bun command with the given arguments.
export def bun [
	args: list<string> = []
]: nothing -> any {
	source ./env/env.nu

	(
		^bun 
		...$args
	)
}
