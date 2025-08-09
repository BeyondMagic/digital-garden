
def log [
    ...args: list<any> # Arguments to log.
]: nothing -> nothing {
    use std log
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