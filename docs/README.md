**digital-garden**: A Bun-driven modular digital garden runtime that hot-loads features from Git and routes every incoming request through plug-in modules for fast, reproducible setup.

# Requirements

- [Bun](https://bun.sh/) installed (runtime and package manager).
- [PostgreSQL](https://www.postgresql.org/) or [Docker](https://www.docker.com/) to host the shared database schema.
- [Git](https://git-scm.com/) (to fetch module repositories).
- [Nushell](https://www.nushell.sh/) (optional, recommended) for the included developer scripts in [`script/`](/script/).
- Basic familiarity with JavaScript/Node-style runtimes and [SQL](https://en.wikipedia.org/wiki/SQL).

# Setup

## Configuration

See [`script/env.nu`](/script/env.nu) for default environment variables (e.g. `DOMAIN`, `POSTGRES_URL`, `POSTGRES_*`). Edit these values to match your environment before starting the server. You can either export the variables in your shell or edit [`script/env.nu`](/script/env.nu) directly (the Nushell helper scripts will `source` it).

## Quickstart

1. Clone the repository and enter it:

```sh
$ git clone https://github.com/BeyondMagic/digital-garden
$ cd digital-garden
```

2. Review and set your environment (open [`script/env.nu`](/script/env.nu) and update `DOMAIN`, `POSTGRES_URL`, etc.).

3. (Optional) Start a local Postgres through the provided Docker compose:

```sh
$ ./script/index.nu database
```

4. Start the server in development mode (hot reload + logs):

```sh
$ ./script/index.nu dev
```

5. The server will bind to the `DOMAIN` you configured — open `http://$DOMAIN/` to verify.

# Usage

- The server entrypoint is [`source/index.js`](/source/index.js) and loads modules on boot via the module manager ([`source/module/`](/source/module/)).
- Modules are tracked in the `module` table and discovered by the module manager; adding a module record (repository URL, slug, enabled) lets the server clone and register it.
- Requests are dispatched as a `request` event; the first module to return a `Response` handles the request. If no module handles a request, a minimal configuration notice is returned.
- Developer helpers are in [`script/index.nu`](/script/index.nu) (commands: `dev`, `debug`, `cli`, `database`, `bun`). Use `debug` to enable verbose logging.

# Troubleshooting

- Logs are written to the `logs/` directory; check the latest log when the server fails to boot.
- Use `./script/index.nu debug` to run with `DEBUG=true` and more verbose output.
- If the database is misconfigured, double-check `POSTGRES_URL` and that Postgres is running (or restart the Docker compose with `./script/index.nu database`).
- For resetting a test DB schema, see [`source/database/query/reset.js`](/source/database/query/reset.js) (WARNING: destructive; use only on disposable test DBs).

# Principles

1. **Modularity**: must be implemented as independent modules that can be added/removed at runtime.
2. **Performance**: must be efficient, with minimal overhead on request handling.
3. **Isolation**: must not interfere with each other; each module runs in its own context, but can communicate via events and shared DB.
4. **Observability**: must provide clear logging and debugging tools to monitor module behavior and system health.
5. **Testability**: should be easy to test features in isolation and as part of the whole system.
6. **Knowability**: must be well-documented, with clear, concise and precise instructions of features, configuration and usage.

# Contributing

See [`CONTRIBUTING.md`](/docs/CONTRIBUTING.md) for contribution guidelines (if present). Feel free to open issues or PRs on this repository.

## Database schema

The database schema is available as a [DBML reference](/docs/schema.dbml).

# Citation

If you use `digital-garden` for your research, please cite it using the following BibTeX entry:

```bibtex
@misc{digital-garden,
  author = {João V. Farias},
  title = {digital-garden: A Bun-driven modular digital garden runtime},
  year = {2025},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/BeyondMagic/digital-garden}}
}
```

# License

See the [LICENSE](/LICENSES/LICENSE) file for licensing details.

Maintained by [João Farias (beyondmagic)](https://github.com/beyondmagic).