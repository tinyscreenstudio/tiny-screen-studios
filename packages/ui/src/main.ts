// UI entry point
// This will be populated in later tasks

import { version } from '@tiny-screen-studios/core';

// eslint-disable-next-line no-console
console.log(`Tiny Screen Studios v${version}`);

// Placeholder - will be implemented in later tasks
const app = document.getElementById('app');
if (app) {
  app.innerHTML = `
    <h1>Tiny Screen Studios</h1>
    <p>Web tool for converting pixel art to tiny display formats</p>
    <p>Version: ${version}</p>
  `;
}
