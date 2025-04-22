**beyondmagic.space** is a digital garden platform to be yourself, where you can grow your ideas, thoughts, and knowledge.

<!-- # Summary -->

# System Design

- Database is a PostGreSQL database;
- Client is a web browser.
- Server is a Bun (Javascript) run web server, with direct support to contact the database and clone/update repository in the system.
    - Server receives a request from a client and sends to Parser;
    - Parser sees the request, and if asked by a module, sends it to them alongside other information;
    - Module sees the request, and sends back to the parser, continuing the cycle until the request is done parsing;
    - Server sends back a response to the client;

```txt
Database -> Server

Server:
    Parser -> Module
    Module -> Parser

Server -> Client
```

Modules export a default loader for the Server, the Server loads it and parses its information though event/subscriber architecture.

## Dependencies

- Server:
	- [bun](https://jsdoc.app/);
	- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript);
	- [JSDocs](https://jsdoc.app/);
- Database:
	- [ChartDB](https://chartdb.io/);
	- [PostgreSQL](https://www.postgresql.org/).

# Features

There are three types of users:
- visitors:
    - visitors can read the content;
- authors:
    - authors can create, edit, and delete content.
- admins:
    - admins have full control over the platform.

# Plugins

## Youtube (reference extractor)

Extracts information from a Youtube video.

## Startpage

A personal startpage to organize your digital life.

# To-dos

- [ ] Anonymous:
    - [ ] View content;
    - [ ] Save read content locally;
- [ ] Account:
    - [ ] Sign up;
        - [ ] Username;
        - [ ] Password;
    - [ ] Sign in;
        - [ ] Username;
        - [ ] Password;
    - [ ] Sign out;
    - [ ] Delete account;
    - [ ] Update information:
        - [ ] Username;
        - [ ] Password;
        - [ ] Email;
        - [ ] Profile picture;
        - [ ] Header;
        - [ ] Bio;
    - [ ] Reset password;
    - [ ] Delete pages;
    - [ ] Membership:
        - [ ] Write pages;
        - [ ] Edit pages;
        - [ ] Delete pages;
    - [ ] Admin:
        - [ ] Domains:
            - [ ] Subdomains:
                - [ ] Create subdomain;
                - [ ] Delete subdomain;
            - [ ] Update subdomain;
            - [ ] Delete domain;
- [ ] View user public profiles;

# Authors

- João V. Farias beyondmagic@mail.ru 2025