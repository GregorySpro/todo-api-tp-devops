const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { trackHttpMetrics, metricsHandler } = require('./monitoring');
const { getAllTasks, STORAGE_MODE } = require('./models/task');
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(trackHttpMetrics);

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/config', (req, res) => {
	res.json({
		port: process.env.PORT || 3000,
		hasApiKey: Boolean(process.env.API_KEY),
		environment: process.env.NODE_ENV || 'development',
		storageMode: STORAGE_MODE,
		message: `Running in ${process.env.NODE_ENV || 'development'} mode`,
	});
});

app.get('/db-test', async (req, res, next) => {
	try {
		await getAllTasks();
		res.json({ success: true, mode: STORAGE_MODE });
	} catch (error) {
		next(error);
	}
});

app.get('/metrics', metricsHandler);

// Routes
app.use('/api/tasks', taskRoutes);

// 404 fallback
app.use((req, res) => {
	res.status(404).json({ message: 'Route introuvable' });
});

// Error handling
app.use(errorHandler);

module.exports = app;