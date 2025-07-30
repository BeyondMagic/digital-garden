**beyondmagic.space** is a digital garden platform to be yourself, where you can grow your ideas, thoughts, and knowledge.

<!-- # Summary -->

# Installation

## DNS

You will need a Wildcard DNS Record:
   - Create a wildcard DNS record for your domain that points to your server's IP address.
   - This will allow you to access any subdomain of your domain, such as `*.domain.com`.
   1. Example using `nsupdate`:
	```bash
	nsupdate -k /etc/bind/rndc.key
	server
	localhost
	update add *.domain.com 3600 A <your_server_ip>
	send
	```
	2. DNS entry:
	```txt
	*.domain.com. 3600 IN A <your_server_ip>
	```

## SSH

You will need a Wildcard SSL Certificate:
   - Use a service like [Let's Encrypt](https://letsencrypt.org/) to obtain a wildcard SSL certificate for your domain.
   - Follow the instructions provided by your SSL provider to install the certificate on your server.
   1. Example as a root user:
	```bash
	# certbot certonly --manual --preferred-challenges=dns -d "*.domain.com"
	```

## Development

To install the necessary dependencies, run the following command:

```bash
bun install
```

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
    Module -> Module

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

There are two types of users:
- visitors:
    - visitors can read the content;
- authors:
    - authors can create, edit, and delete content that they have access over.

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

- João V. Farias <[beyondmagic@mail.ru](mailto:beyondmagic@mail.ru)> 2025