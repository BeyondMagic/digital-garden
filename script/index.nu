# Run cli of developer mode of the server.
export def cli [
    args: list<string> = [] # Arguments to pass to the bun command.
    --path: string = "./source/index.js" # The path to the server entry file.
    --logs-dir: string = "./logs"
]: nothing -> any {
    let datetime = date now
        | format date '%+'

    let log_file = git root
        | path join $"($logs_dir)/($datetime).log"

    let newline = char newline

    let path = git root
        | path join $path

    bun [
        --hot
        $path
        ...$args
    ] o+e>| lines
    | each {|line|
        let raw = $line
            | str replace --all --regex `\x1b\[[0-9;]*m` ''

        print $line

        $raw + $newline | save --append $log_file
    }

    null
}

# Run the server in debug mode.
export def debug []: nothing -> any {
    $env.DEBUG = true
    cli
}

# Run the server in development mode.
export def dev []: nothing -> any {
    $env.DEV = true
    debug
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

    run-external bun ...$args
}

# Execute docker command with the given arguments.
export def docker [
    args: list<string> = [] # Arguments to pass to the docker command.
]: nothing -> any {
    source ./env.nu

    run-external docker ...$args
}