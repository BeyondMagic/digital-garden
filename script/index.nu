# Run cli of developer mode of the server.
export def cli [
    args: list<string> = [] # Arguments to pass to the bun command.
    --path: string = "./source/index.js" # The path to the server entry file.
]: nothing -> any {
    bun [
        --hot
        $path
        ...$args
    ]
}

# Run the database in production mode.
export def database []: nothing -> any {
    docker [
        compose
        up
    ]
}

# Get the root directory of the git repository.
def "git root" []: nothing -> string {
    ^git rev-parse --show-toplevel
}

# Execute bun command with the given arguments.
export def bun [
    args: list<string> = [] # Arguments to pass to the bun command.
]: nothing -> any {
    source ./env.nu

    ^bun ...$args
}

# Execute docker command with the given arguments.
export def docker [
    args: list<string> = [] # Arguments to pass to the docker command.
]: nothing -> any {
    source ./env.nu

    ^docker ...$args
}