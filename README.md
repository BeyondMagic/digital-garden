
# Requirements

1. Assets 

# Logic

## Example

```js
add_asset({
       domain: "/",
       content:  
})
```

# Architecture

```conf
/docker/                                  # Docker-related files:
       /docker-compose.yml                # - Docker Compose configuration
/script/                                  # Scripts for various tasks:
       /index.nu                          # - NuShell script for environment setup
       /env.nu                            # - NuShell environment configuration
       /cli.nu                            # - CLI configuration
/logs/                                    # Log folder.
       /**.log                            # - Log files.
/public/                                  # Public files and folders.
       /cdn/                              # - Content Delivery Network assets.
       /modules/                          # - Application modules.
/source/                                  # Source files.
       /database/                         # - Database configuration and scripts
              /query/                     # - Database query files
                     /create/             # - Database create scripts
                            /tables.js    # - Table definitions
                            /functions.js # - Functions definitions
                            /types.js     # - Types definitions
                            /trigger.js   # - Triggers definitions
                            /index.js     # - Create scripts index
                     /delete/
                            /tables.js    # - Table deletion
                            /functions.js # - Functions deletion
                            /types.js     # - Types deletion
                            /trigger.js   # - Triggers deletion
                            /index.js     # - Delete scripts index
                     /insert.js           # - Insert
                     /remove.js           # - Remove
                     /select.js           # - Select
                     /index.js            # - Query index
              /types.js                   # - Types definitions
              /wrapper.js                 # - Wrapper for queries.
       /tests/                            # - Test folder
              /query/                     # - Query tests
                     /create/             # - Create tests
                            /tables.js    # - Table creation tests
                     /delete/             # - Delete tests
                            /tables.js    # - Table deletion tests
                     /insert/             # - Insert tests
                     /remove/             # - Remove tests
                     /select/             # - Select tests
              /index.js                   # - Tests index
       /cli/
              /index.js                   # - CLI entry point
       /index.js                          # - Run the server.
       /logger.js                         # - Logger configuration and setup
       /types.js                          # - Type definitions
       /tsconfig.json                     # - TypeScript configuration
       /package.json                      # - NPM package configuration

```