# Vervo

Vervo is a versioning, publishing, and changelog utility for npm packages. Vervo builds off of the Changesets workflow, adding more safety checks, more features, and more customization for a better publishing experience.

**Comparison**

| Feature           | Vervo | Changesets |
| :---------------- | :---: | :--------: |
| npm support       |  ✅   |     ✅     |
| pnpm support      |  ✅   |    ✅\*    |
| JSR support       |  ✅   |     ❌     |
| peerDeps config   |  ✅   |     ❌     |
| Prepublish checks |  ✅   |     ❌     |

\* Changesets doesn’t support some features like catalogs

## Setup

With [pnpm](https://pnpm.io) installed, run:

```sh
pnpm i -D vervo
```

Then run:

```sh
pnpm exec vervo init
```

To generate a `vervo.config.ts` file in the root of your project.

## Usage

For any PR that has a meaningful change, run one of the following:

- `vervo breaking`: describe a breaking change
- `vervo feature`: describe a non-breaking feature
- `vervo fix`: describe a non-breaking bugfix
- `vervo chore`: describe a non-breaking, insignificant change, but one that may affect runtime nonetheless (such as dependency bumps)
- `vervo docs`: describe a documentation change

Prompts will follow that then guide you toward the proper change descriptions.

```sh
vervo version
```

This will version all packages appropriately, and generate and/or update `CHANGELOG.md`s in each package. Lastly, run:

```sh
vervo publish
```

It will then publish to any [registries configured](#registries), one-by-one.

### Prereleases

Vervo’s opinion is that prereleasing should happen early and often.

```sh
vervo prerelease [tag]
```

#### presets

Any tag by default follows the `1.0.0-[tag].[increment]` suffix. But the following special tags are reserved, and generate the following format:

| Tag       | Example                                      | Description                                                                                            |
| :-------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `iso8601` | `1.0.0-20250829T165110Z`                     | [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime string.                                    |
| `uuidv4`  | `1.0.0-30f1b98f-ec71-4880-b1dd-688f39d3b55c` | Generate a random UUIDv4 ID (note: all packages published at this step will be tagged with this UUID). |

## CLI

### Global flags

These flags are generally available on all commands:

| Flag        | Default | Description                                                                             |
| :---------- | :------ | :-------------------------------------------------------------------------------------- |
| `--filter`  | All     | Filter to specific packages. Works the same as [pnpm filter](https://pnpm.io/filtering) |
| `--dry-run` |         | Safely preview changes and exit without changing anything.                              |

### breaking / feature / fix / chore / docs

The following commands affect versions in the following ways:

| Command    | Pre-1.0 | 1.0+   |
| :--------- | :------ | :----- |
| `breaking` | +0.1.0  | +1.1.0 |
| `feature`  | +0.0.1  | +0.1.0 |
| `fix`      | +0.0.1  | +0.0.1 |
| `chore`    | +0.0.1  | +0.0.1 |
| `docs`     | —       | —      |

You may also add [custom types](#custom-change-types) in the config.

### version

```sh
vervo version
```

Cut new versions and update `package.json`s according to the current changesets. It will run the `command` option in [config](#config).

## Config

Vervo requires a `vervo.config.ts` file in the monorepo root.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  // options
});
```

### Packages

Add packages, and control individual settings for each.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  packages: {
    "packages/**": {
      requiredFiles: ["dist/**"],
    },
    "packages/foo/bar": {
      requiredFiles: ["dist/**", "extra/file2.js"],
    },
    "packages/hidden": { ignore: true },
  },
});
```

Specify either a package name, or glob as the key of the object.

| Option            | Type       | Description                                                                                                             |
| :---------------- | :--------- | :---------------------------------------------------------------------------------------------------------------------- |
| **ignore**        | `boolean`  | (Optional) Set to `false` to ignore this package from publishing and versioning.                                        |
| **requiredFiles** | `string[]` | (Optional) Specify file globs that are required to publish this package. This prevents bad builds from being published. |

### Hooks

Commands that fire before certain processes. Primarily, hooks are used to ensure packages are built properly. But they may also serve the purpose of adding custom integrity checks, or other safeguards for publishing.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  hooks: [
    // ensure "pnpm run build" is always run before every publish & version
    {
      on: ["version", "publish"],
      command: "pnpm run build",
      scope: "package",
      allowFail: false,
    },
    // run size-limit before publish
    {
      on: ["publish"],
      command: "pnpm run size-limit",
      scope: "package",
    },
    // run @arethetypeswrong/cli before publish
    {
      on: ["publish"],
      command: "pnpm exec attw --profile esm-only --pack .",
      scope: "package",
    },
  ],
});
```

| Option        | Type                       | Description                                                                                                                               |
| :------------ | :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **on**        | `string[]`                 | Specify Vervo commands before which this runs. For example, `on: ['breaking', 'feat']` will run before `vervo breaking` and `vervo feat`. |
| **command**   | `string`                   | Command to run.                                                                                                                           |
| **scope**     | `"workspace" \| "package"` | Either run once in the workspace root, or run in every package.                                                                           |
| **allowFail** | `boolean`                  | Set to `true` to allow Vervo to continue running even if this throws an error.                                                            |

### Custom change types

By default, Vervo supports the standard conventional types: `breaking`, `feat`, `fix`, `chore`, and `docs`. You may add additional types by adding new keys to `customChangeTypes`:

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  customChangeTypes: {
    "my-type": {
      stable: "0.1.0", // 1.0 and later: +0.1.0
      unstable: "0.0.1", // 0.x: +0.0.1
    },
  },
});
```

| Option       | Type     | Description                                 |
| :----------- | :------- | :------------------------------------------ |
| **stable**   | `string` | Set the version increase for 1.0+ packages. |
| **unstable** | `string` | Set the version increase for 0.x packages.  |

### Registries

As many registries may be added as you desire. Specify a `command` for every registry, and that command will be run in every package’s folder to publish.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  registry: {
    npm: {
      enabled: true,
      command: "pnpm publish",
    },
    jsr: {
      enabled: false,
      command: "jsr publish",
    },
  },
});
```

| Option      | Type      | Description                                       |
| :---------- | :-------- | :------------------------------------------------ |
| **enabled** | `boolean` | Set to `false` to skip this registry.             |
| **command** | `string`  | CLI command to run inside this package directory. |

> [!NOTE]
> The registries will be published one-at-a-time. That way an error in one registry doesn’t block publishing in another.

### Changeset

Controls settings related to changeset files and templates.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  changeset: {
    dir: ".changeset",
    template: {
      breaking: "templates/breaking.template.md",
      feat: "templates/feat.template.md",
      fix: "templates/fix.template.md",
      chore: "templates/chore.template.md",
      docs: "templates/docs.template.md",
    },
  },
});
```

| Option       | Type                     | Description                                                                                                               |
| :----------- | :----------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **dir**      | `string`                 | Set the location of the changeset `.md` files, relative to `vervo.config.ts`.                                             |
| **template** | `Record<string, string>` | For each change type, set the location of the `.md` template. By default, Vervo looks for `templates/[type].template.md`. |

### Checks

Built-in checks that need to pass to publish.

```ts
import { defineConfig } from "vervo";

export default defineConfig({
  checks: {
    gitClean: true,
    gitBranch: "main",
  },
});
```

| Option        | Type      | Description                     |
| :------------ | :-------- | :------------------------------ |
| **gitClean**  | `boolean` | Require Git status to be clean. |
| **gitBranch** | `string`  | Require Git branch to be this.  |

## Additional info

### Acknowledgments

- Inspiration taken from [Changesets](https://github.com/changesets/changesets), obviously, without which this wouldn’t be possible.
- [@natemoo-re](https://github.com/natemoo-re) for building [Clack](https://github.com/bombshell-dev/clack) which this uses.
