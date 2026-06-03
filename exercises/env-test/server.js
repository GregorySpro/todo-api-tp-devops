const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

app.get('/config', (req, res) => {
  res.json({
    port: PORT,
    hasApiKey: Boolean(API_KEY),
    environment: ENVIRONMENT,
    message: `Running in ${ENVIRONMENT} mode`,
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`API Key provided: ${Boolean(API_KEY)}`);
});
