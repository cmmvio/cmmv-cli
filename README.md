<p align="center">
  <a href="https://cmmv.io/" target="blank"><img src="https://raw.githubusercontent.com/cmmvio/docs.cmmv.io/main/public/assets/logo_CMMV2_icon.png" width="300" alt="CMMV Logo" /></a>
</p>
<p align="center">Contract-Model-Model-View (CMMV) <br/> Building scalable and modular applications using contracts.</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@cmmv/cli"><img src="https://img.shields.io/npm/v/@cmmv/cli.svg" alt="NPM Version" /></a>
    <a href="https://github.com/cmmvio/cmmv-cli/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@cmmv/cli.svg" alt="Package License" /></a>
</p>

<p align="center">
  <a href="https://cmmv.io">Documentation</a> &bull;
  <a href="https://github.com/cmmvio/cmmv-cli/issues">Report Issue</a>
</p>

## Description

The CMMV CLI is a versatile command-line tool designed to streamline the creation, development, and management of CMMV applications. It simplifies various tasks, such as generating the project structure, running the application in development mode, and preparing it for production with efficient building and bundling processes. This CLI promotes clean and modular architectural practices, encouraging well-organized and scalable applications.

For further details, explore the [documentation](https://cmmv.io/docs).

## Installation

The ``@cmmv/cli`` package provides a simple command-line interface for quickly scaffolding CMMV projects. You can use it with pnpm global installation or directly with npx for one-time use.

### Install `pnpm`

If you don't have `pnpm` installed, you can install it using npm:

```bash
npm install -g pnpm
```

For additional installation options, refer to the [pnpm installation guide](https://pnpm.io/installation).

### Install CMMV CLI

Once `pnpm` is installed, you can install the CMMV CLI globally:

```bash
pnpm add -g @cmmv/cli
```

Once installed globally, you can run the cmmv command anywhere:

```bash
cmmv create project-name
```

## Use with npx

For a one-time use without global installation, you can use ``npx``:

```bash
pnpm dlx @cmmv/cli@latest create project-name
```

## Commands

### ``create``

Generates a new CMMV project with a predefined structure. It provides options to enable or disable features like Vite, RPC, caching, and more.

```bash
cmmv create project-name
```

### ``module``

Creates a new module within an existing CMMV project. Modules are reusable components or feature-specific units of your application.

```bash
cmmv module module-name
```


### ``contract``

Create a new contract with the selected options such as cache, fields, validations

```bash
cmmv contract contract-name
```
