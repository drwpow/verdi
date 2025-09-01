#!/usr/bin/env node

import { parse } from '@bomb.sh/args';
import dotenv from 'dotenv';
import { changeCmd, helpCmd, initCmd } from '../dist/index.js';

dotenv.config();

const argv = process.argv.slice(2);
const args = parse(argv, {
  boolean: ['help', 'version'],
  array: ['filter'],
});

export default async function main() {
  const cmd = args._[0];

  // --version
  if (args.version) {
    versionCmd();
    process.exit(0);
  }

  // --help
  if (args.help || !cmd) {
    helpCmd();
    process.exit(0);
  }

  // ---
  // Full-run commands: build, check, lint
  switch (cmd) {
    case 'change': {
      await changeCmd();
      break;
    }
    case 'init': {
      await initCmd();
      break;
    }
    default: {
      helpCmd();
      break;
    }
  }

  // done
  process.exit(0);
}

main();
