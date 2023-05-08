<p align="center">
  <img src="https://user-images.githubusercontent.com/26466516/169722691-77a6ca86-df54-4a0e-b952-48c3f3ed7526.png" alt="Gatsby TypeScript Starter">
</p>

<br />

<div align="center"><strong>Non-opinionated TypeScript starter for Gatsby</strong></div>
<div align="center">A TypeScript starter for Gatsby. No plugins and styling. Exactly the necessary to start.</div>

<br />

<div align="center">
  <img src="https://img.shields.io/static/v1?label=PRs&message=welcome&style=flat-square&color=5e17eb&labelColor=000000" alt="PRs welcome!" />

  <img alt="License" src="https://img.shields.io/github/license/jpedroschmitz/gatsby-starter-ts?style=flat-square&color=5e17eb&labelColor=000000">

  <a href="https://twitter.com/intent/follow?screen_name=jpedroschmitz">
    <img src="https://img.shields.io/twitter/follow/jpedroschmitz?style=flat-square&color=5e17eb&labelColor=000000" alt="Follow @jpedroschmitz" />
  </a>
</div>

<div align="center">
  <sub>Created by <a href="https://twitter.com/jpedroschmitz">João Pedro</a> with the help of many <a href="https://github.com/jpedroschmitz/gatsby-starter-ts/graphs/contributors">wonderful contributors</a>.</sub>
</div>

<br />

## Features

- ⚡️ Gatsby 5
- ⚛️ React 18
- ⛑ TypeScript
- 🐐 Tests — Vitest and Testing Library out of the box
- 📏 ESLint — To find and fix problems in your code
- 💖 Prettier — Code Formatter for consistent style
- 🐶 Husky — For running scripts before committing
- 🚓 Commitlint — To make sure your commit messages follow the convention
- 🖌 Renovate — To keep your dependencies up to date
- 🚫 lint-staged — Run ESLint and Prettier against staged Git files
- 👷 PR Workflow — Run Type Check & Linters on Pull Requests
- ⚙️ EditorConfig - Consistent coding styles across editors and IDEs
- 🗂 Path Mapping — Import components or images using the `@` prefix

## Quick Start

The best way to start with this template is using the [Gatsby CLI](https://www.gatsbyjs.com/docs/reference/gatsby-cli/).

```
npx gatsby new starter-ts https://github.com/jpedroschmitz/gatsby-starter-ts
```

### Development

To start the project locally, run:

```bash
pnpm start
```

Open `http://localhost:8000` with your browser to see the result.

## Documentation

### Requirements

- Node.js >= 18
- pnpm 7

### Directory Structure

- [`__helpers__`](./__helpers__/) — Helpers files for testing configuration.<br>
- [`__mocks__`](./__mocks__/) — Mocks for testing.<br>
- [`.github`](.github) — GitHub configuration including the CI workflow.<br>
- [`.husky`](.husky) — Husky configuration and hooks.<br>
- [`src`](./src) — Application source code, including pages, components, styles.

### Scripts

- `pnpm start` — Starts the application in development mode at `http://localhost:8000`.
- `pnpm build` — Compile your application and make it ready for deployment.
- `pnpm serve` — Serve the production build of your site
- `pnpm clean` — Wipe out the cache (`.cache` folder).
- `pnpm type-check` — Validate code using TypeScript compiler.
- `pnpm lint` — Runs ESLint for all files in the `src` directory.
- `pnpm format` — Runs Prettier for all files in the `src` directory.
- `pnpm test` — Run tests with Vitest.
- `pnpm test:watch` — Run tests on watch mode.

### Path Mapping

TypeScript are pre-configured with custom path mappings. To import components or files, use the `@` prefix.

```tsx
import { Button } from '@/components/Button';

// To import images or other files from the static folder
import avatar from '@/static/avatar.png';
```

### Switch to Yarn/npm

This starter uses pnpm by default, but this choice is yours. If you'd like to switch to Yarn/npm, delete the `pnpm-lock.yaml` file, install the dependencies with Yarn/npm, change the CI workflow, Husky Git hooks to use Yarn/npm commands, and uninstall the `gatsby-plugin-pnpm` plugin (you also need to remove it from the `gatsby-config` file).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.
