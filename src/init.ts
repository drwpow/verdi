export const INIT_FILE = `import { defineConfig, templates } from 'flap';

export default defineConfig({
  packages: [
    'packages/**',
    // add packages here
  ],
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
