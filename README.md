# Verdi

Verdi is a CLI helper for versioning and publishing multiple npm packages from one monorepos. Inspired by [Changesets](https://github.com/changesets/changesets).

## Setup

> [!NOTE]
> Verdi currently only works with [pnpm workspaces](https://pnpm.io/workspaces).

With [pnpm](https://pnpm.io) installed, run:

```sh
pnpm i -D verdi
```

Verdi uses your [pnpm-workspace.yaml](https://pnpm.io/workspaces) settings to understand your monorepo structure.

## Commands

### change

```sh
verdi change
        [--filter package1 --filter package2 ...]
        [--bump patch|minor|major]
        [--message "[Release notes]"]
```

Generate a changeset file. By default it will prompt for input, but these may be bypassed with individual flags.

#### semver

Verdi follows standard semantic versioning, but with a few more modern assumptions:

- Packages on 0.x use minor for breaking, patch for everything else
- Packages >= 1.0 follow standard major breaking, minor feature, patch bugfix

### version

```sh
verdi version
        [--filter package1 --filter package2 ...]
```

Cut new versions and update `package.json`s according to the current changesets. It will run the `command` option in [config](#config).

> [!TIP]
> Need to run a command in all packages? Try `pnpm -r run [command]` ([docs](https://pnpm.io/cli/recursive)) for simple cases, or [Turborepo](https://turborepo.com/) for more advanced setups.

### pre

```sh
verdi pre [tag]
        [--filter package1 --filter package2 ...]
        [--bump patch|minor|major] # default: patch
        [--dry-release]
```

Like `version` + `publish`, except for unstable prereleases. Requires a `[tag]`.

For example, if you ran `verdi pre beta`, it would version the following:

- `pkg-a@1.0.0` → `pkg-a@1.0.1-beta.0`
- `pkg-b@0.0.1-beta.0` → `pkg-b@0.0.1-beta.1`
- `pkg-b@0.0.1` → `pkg-b@0.0.2-beta.0`

And the new packages would be published at `pnpm i pkg-a@beta pkg-b@beta`.

The `[tag]` may be any arbitrary word other than [preset](#preset). Common tags are `beta`, `alpha`, or `next`. They are up to you!

#### presets

Any tag by default follows the `1.0.0-[tag].[increment]` suffix. But the following special tags are reserved, and generate the following format:

| Tag       | Example                                      | Description                                                                                            |
| :-------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `iso8601` | `1.0.0-20250829T165110Z`                     | [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime string.                                    |
| `uuidv4`  | `1.0.0-30f1b98f-ec71-4880-b1dd-688f39d3b55c` | Generate a random UUIDv4 ID (note: all packages published at this step will be tagged with this UUID). |

#### ---dry-release

Show what the changes would be, without releasing.

#### Difference from Changesets

If you’ve used [Changesets’ prereleases](https://github.com/changesets/changesets/blob/main/docs/prereleases.md), this works differently. Verdi discourages working off of a main trunk for too long by making prereleases simple and effective. 

`verdi pre [tag]` automatically versions and releases all packages without a prompt (`--filter [package]` may be used if only some packages should get a prerelease).

## Config

Verdi requires a `verdi.config.ts` file in the monorepo root.

```ts
import { defineConfig, templates } from "verdi";

export default defineConfig({
  ignorePackages: [
    "packages/secret-package", // Ignored
  ],
  changeset: {
    dir: ".changeset",
    template: templates.github,
  },
  requirements: {
    git: {
      clean: true, // Fail if git status is dirty
      branch: "main", // Fail if not on current branch
    },
  },
});
```

| Name                        | Type       | Default      | Description                                                                                        |
| :-------------------------- | :--------- | :----------- | :------------------------------------------------------------------------------------------------- |
| **ignorePackages**          | `string[]` |              | Ignore packages that are otherwise included in [pnpm-workspace.yaml](https://pnpm.io/workspaces).  |
| **changeset**               |            |              | Settings for changesets                                                                            |
| **changeset.dir**           | `string`   | `.changeset` | Path to the `.changeset` directory.                                                                |
| **changeset.template**      | `Template` |              | Set a custom template for generating changelog lines.                                              |
| **requirements**            |            |              | Settings for prerequisites to versioning and publishing.                                           |
| **requirements.git.clean**  | `boolean`  | `true`       | Fail if the git status is dirty.                                                                   |
| **requirements.git.branch** | `string`   | `"main"`     | Fail if this is not the current Git branch.                                                        |
| **requirements.files**      | `string[]` |              | Glob of files to ensure exist before publishing. Accepts globs, e.g. (`["packages/**/dist/*.js]`). |

### Templates

## Comparison to Changesets

Verdi mostly differs in a different versioning strategy. Where Changesets defends their choices to have “smarter” versioning, it results in [frequent unexpected major bumps](https://github.com/changesets/changesets/issues/1011) that are untenable in large monorepos. Verdi applies more guardrails and best practices in exchange for safer publishing. No unexpected behavior leads to fewer permanent mistakes.

The other major difference is Verdi has automatic publish checks, which will fail if a build does not meet certain criteria. Fewer mistakes also lead to fewer permanent mistakes.

## Acknowledgments

- Inspiration taken from [Changesets](https://github.com/changesets/changesets), obviously, without which this wouldn’t be possible.
- [@natemoo-re](https://github.com/natemoo-re) for building [Clack](https://github.com/bombshell-dev/clack) which this uses.
