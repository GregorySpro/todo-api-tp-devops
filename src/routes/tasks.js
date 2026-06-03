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

router.post('/', async (req, res, next) => {
	try {
		const errors = validateTaskPayload(req.body);
		if (errors.length > 0) {
			return res.status(400).json({ message: 'Payload invalide', errors });
		}

		const task = await createTask(req.body);
		return res.status(201).json(task);
	} catch (error) {
		return next(error);
	}
});

router.get('/', async (req, res, next) => {
	try {
		res.json(await getAllTasks());
	} catch (error) {
		next(error);
	}
});

router.get('/:id', async (req, res, next) => {
	try {
		const task = await getTaskById(req.params.id);
		if (!task) {
			return res.status(404).json({ message: 'Tache introuvable' });
		}

		return res.json(task);
	} catch (error) {
		next(error);
	}
});

router.put('/:id', async (req, res, next) => {
	try {
		const errors = validateTaskPayload(req.body, true);
		if (errors.length > 0) {
			return res.status(400).json({ message: 'Payload invalide', errors });
		}

		const updatedTask = await updateTaskById(req.params.id, req.body);
		if (!updatedTask) {
			return res.status(404).json({ message: 'Tache introuvable' });
		}

		return res.json(updatedTask);
	} catch (error) {
		next(error);
	}
});

router.delete('/:id', async (req, res, next) => {
	try {
		const deleted = await deleteTaskById(req.params.id);
		if (!deleted) {
			return res.status(404).json({ message: 'Tache introuvable' });
		}

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
});

module.exports = router;
