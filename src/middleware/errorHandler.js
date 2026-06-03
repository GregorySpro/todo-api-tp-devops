function errorHandler(err, req, res, next) {
	if (res.headersSent) {
		return next(err);
	}

	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).json({ message: 'JSON invalide' });
	}

	const statusCode = err.statusCode || 500;
	const message = err.message || 'Erreur interne du serveur';

	return res.status(statusCode).json({ message });
}

module.exports = errorHandler;
