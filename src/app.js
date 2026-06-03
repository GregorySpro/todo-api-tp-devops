const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/tasks', taskRoutes);

// 404 fallback
app.use((req, res) => {
	res.status(404).json({ message: 'Route introuvable' });
});

// Error handling
app.use(errorHandler);

module.exports = app;