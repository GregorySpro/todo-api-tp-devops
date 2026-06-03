const fs = require('fs');
const path = require('path');

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const logFilePath = path.join(logDir, 'access.log');

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  fs.mkdirSync(logDir, { recursive: true });

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const line = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms\n`;
    fs.appendFile(logFilePath, line, () => {});
  });

  next();
}

module.exports = requestLogger;
