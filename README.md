# Lega

> <dfn>lega</dfn>, Italian for “alloy”, as in _lega tipografica_, the metal used in printmaking for forging movable type.
>
> Also short for _legacy_.

Lega is a CLI tool for forging npm package versions, primarily in monorepos. Inspired by [Changesets](https://github.com/changesets/changesets).

```sh
lega change
lega version
lega publish
```

## Setup

> [!NOTE]
> Lega assumes you’re managing a monorepo of packages with [pnpm workspaces](https://pnpm.io/workspaces). It requires pnpm commands to assess dependencies and workspace structure.

With [pnpm](https://pnpm.io) installed, run:

```sh
pnpm i -D lega
```

Lega uses your packages declared in [pnpm-workspace.yaml](https://pnpm.io/workspaces).

## Commands

### change

```sh
lega change
        [--filter package1 --filter package2 ...]
        [--bump patch|minor|major]
        [--message "[Release notes]"]
```

Generate a changeset file. By default, will prompt for all questions, but these may be bypassed with individual flags.

### version

```sh
lega version
        [--filter package1 --filter package2 ...]
```

Update all `package.json` versions according to the current changesets. It will run the `command` option in [config](#config).

> [!TIP]
> Need to run a command in all packages? Try `pnpm -r run [command]` ([docs](https://pnpm.io/cli/recursive)) for simple cases, or [Turborepo](https://turborepo.com/) for more advanced setups.

### pre

```sh
lega pre [tag]
        [--filter package1 --filter package2 ...]
        [--bump patch|minor|major] # default: patch
        [--dry-release]
```

Build and release a prerelease for all packages at `[tag]`.

For example, if you ran `lega pre beta`, it would make the following changes:

- `pkg-a@1.0.0` → `pkg-a@1.0.1-beta.0`
- `pkg-b@0.0.1-beta.0` → `pkg-b@0.0.1-beta.1`
- `pkg-b@0.0.1` → `pkg-b@0.0.2-beta.0`

The `tag` may be any arbitrary word other than [preset](#preset). Common tags are `beta`, `alpha`, or `next`. They are up to you!

#### presets

Any tag by default follows the `1.0.0-[tag].[increment]` suffix. But the following special tags are reserved, and generate the following format:

| Tag       | Example                                      | Description                                                                                            |
| :-------- | :------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `iso8601` | `1.0.0-20250829T165110Z`                     | [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) datetime string.                                    |
| `uuidv4`  | `1.0.0-30f1b98f-ec71-4880-b1dd-688f39d3b55c` | Generate a random UUIDv4 ID (note: all packages published at this step will be tagged with this UUID). |

#### ---dry-release

Simply show what the changes would be, without releasing.

#### Difference from Changesets

If you’ve used [Changesets’ prereleases](https://github.com/changesets/changesets/blob/main/docs/prereleases.md), this works _very_ differently. Lega is meant to encourage frequent prerelease habits off your `main` branch, rather than longrunning feature branches, while preventing simple mistakes. At a high level:

- `lega pre [tag]` automatically builds and releases for all packages without a prompt (`--filter [package]` may be used).
  - This assumes you are **not** tracking prereleases in Git in longrunning branches, rather, you are prereleasing off your `main` trunk more frequently.
- Lega uses the current package versions + tag, and automatically figures out the next `[increment]` number based on npm.
  - `[increment]` will always increment by `1` unless using a [preset](#preset).
- There is no `pre enter` / `pre exit` context (⚠️ `pre enter` would set `enter` as the tag!).
  - You can ony prerelease through `lega pre`.
  - You can only create stable versions through `lega publish`. There is no overlap.
  - Thus, you are never accidentally in the wrong context. There is no `pre.json` file that may accidentally missing in some CI contexts.

### init

```sh
lega init
```

Creates a `lega.config.yml` file with the default settings.

### --filter

The `--filter [glob]` flag skips the prompt, and automatically operates on only the package(s) specified. You can specify either a

## Config

Lega requires a `.changeset/lega.config.ts` file in the monorepo root.

```ts
import { defineConfig, templates } from "lega";

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

This mostly differs in automatic version strategy, and [fixing longstanding versioning bugs in Changesets](https://github.com/changesets/changesets/issues/1011) that have never been addressed. In larger monorepos this makes Changesets unusable.

Lega follows the same philosophy as Changesets and a similar API, but more strictly enforces version bumps. You’ll **never get an accidental major version bump when requesting a minor version.**

Beyond that, there are a few quality of life improvements such as [`lega pre`](#pre) that makes nightly or beta releases much simpler.

## Acknowledgments

- Inspiration taken from [Changesets](https://github.com/changesets/changesets), obviously, without which this wouldn’t be possible.
- [@natemoo-re](https://github.com/natemoo-re) for building [Clack](https://github.com/bombshell-dev/clack) which this uses.
