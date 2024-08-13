const { serve } = require('@hono/node-server');

const app = require('.');

const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Starting is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});
