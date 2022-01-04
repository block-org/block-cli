#!/usr/bin/env node

import { program } from 'commander';
import { print } from '@underspare/dev-utils';
import component from './scripts/build/component';

const { version } = require('../package.json');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

const subCommandList = [
  'dev:component',
  'build:component',
  'build:component:umd',
  'build:component:esm',
  'build:component:cjs',
  'build:component:css',
];

program
  .version(version)
  .name('block-scripts')
  .usage('command [options]')
  .arguments('<cmd>')
  .action((cmd) => {
    if (subCommandList.indexOf(cmd) === -1) {
      print.error('[block-scripts]', 'Invalid command...');
      program.help();
    }
  });

program.command('build:component:esm').action(() => {
  component.buildESM();
});

program.command('build:component:cjs').action(() => {
  component.buildCJS();
});

program.command('build:component:umd').action(() => {
  component.buildUMD();
});

program.command('build:component:css').action(() => {
  component.buildCSS();
});

program.parse(process.argv);
