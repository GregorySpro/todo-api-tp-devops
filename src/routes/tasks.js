const express = require('express');
const {
	validateTaskPayload,
	createTask,
	getAllTasks,
	getTaskById,
	updateTaskById,
	deleteTaskById,
} = require('../models/task');

const router = express.Router();

router.post('/', (req, res, next) => {
	try {
		const errors = validateTaskPayload(req.body);
		if (errors.length > 0) {
			return res.status(400).json({ message: 'Payload invalide', errors });
		}

		const task = createTask(req.body);
		return res.status(201).json(task);
	} catch (error) {
		return next(error);
	}
});

router.get('/', (req, res) => {
	res.json(getAllTasks());
});

router.get('/:id', (req, res) => {
	const task = getTaskById(req.params.id);
	if (!task) {
		return res.status(404).json({ message: 'Tache introuvable' });
	}

	return res.json(task);
});

router.put('/:id', (req, res) => {
	const errors = validateTaskPayload(req.body, true);
	if (errors.length > 0) {
		return res.status(400).json({ message: 'Payload invalide', errors });
	}

	const updatedTask = updateTaskById(req.params.id, req.body);
	if (!updatedTask) {
		return res.status(404).json({ message: 'Tache introuvable' });
	}

	return res.json(updatedTask);
});

router.delete('/:id', (req, res) => {
	const deleted = deleteTaskById(req.params.id);
	if (!deleted) {
		return res.status(404).json({ message: 'Tache introuvable' });
	}

	return res.status(204).send();
});

module.exports = router;
