/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../.package-desktop');

fs.rm(buildDir, { recursive: true, force: true }, (err) => {
  if (err && err.code !== 'ENOENT') {
    console.error(`An error occurred while trying to remove the package directory: ${err.message}`);
    process.exit(1);
  } else {
    console.log('Package directory removed or not present.');
    process.exit(0);
  }
});
