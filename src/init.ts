import fs from "node:fs/promises";
import fsSync from "node:fs";
import process from "node:process";
import { CONFIG_LOC } from "./common";

export const INIT_FILE = `import { defineConfig, templates } from 'flap';

export default defineConfig({
  packages: {
    'packages/**': {
      requiredFiles: ['dist/**'],
    },
    // add more packages
  },
  changeset: {
    dir: '.changeset',
    template: templates.github,
  },
  requirements: {
    commands: {
      version: 'pnpm run build',
      publish: 'pnpm run build',
    },
    git: {
      clean: true,
      branch: 'main',
    },
    files: [
      // add required files, if any
    ],
  },
});
`;

export async function initCmd() {
  if (fsSync.existsSync(CONFIG_LOC)) {
    console.log("Config file already exists. Delete to generate a new one.");
    process.exit(0);
  }
  await fs.writeFile(CONFIG_LOC, INIT_FILE, "utf8");
}
