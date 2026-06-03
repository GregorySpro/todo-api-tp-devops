const { randomUUID } = require('crypto');

const ALLOWED_STATUS = ['todo', 'in_progress', 'done'];
const tasks = [];

function validateTaskPayload(payload, isUpdate = false) {
	const errors = [];

	if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, 'description')) {
		if (typeof payload.description !== 'string' || payload.description.trim().length === 0) {
			errors.push('description est requis et doit etre une chaine non vide');
		}
	}

	if (Object.prototype.hasOwnProperty.call(payload, 'title') && typeof payload.title !== 'string') {
		errors.push('title doit etre une chaine de caracteres');
	}

	if (Object.prototype.hasOwnProperty.call(payload, 'status') && !ALLOWED_STATUS.includes(payload.status)) {
		errors.push(`status doit etre parmi: ${ALLOWED_STATUS.join(', ')}`);
	}

	return errors;
}

function createTask(payload) {
	const now = new Date().toISOString();
	const task = {
		id: randomUUID(),
		title: payload.title || '',
		description: payload.description,
		status: payload.status || 'todo',
		createdAt: now,
		updatedAt: now,
	};

	tasks.push(task);
	return task;
}

function getAllTasks() {
	return tasks;
}

function getTaskById(id) {
	return tasks.find((task) => task.id === id) || null;
}

function updateTaskById(id, payload) {
	const task = getTaskById(id);
	if (!task) {
		return null;
	}

	if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
		task.title = payload.title;
	}
	if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
		task.description = payload.description;
	}
	if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
		task.status = payload.status;
	}
	task.updatedAt = new Date().toISOString();

	return task;
}

function deleteTaskById(id) {
	const index = tasks.findIndex((task) => task.id === id);
	if (index === -1) {
		return false;
	}

	tasks.splice(index, 1);
	return true;
}

module.exports = {
	ALLOWED_STATUS,
	validateTaskPayload,
	createTask,
	getAllTasks,
	getTaskById,
	updateTaskById,
	deleteTaskById,
};
