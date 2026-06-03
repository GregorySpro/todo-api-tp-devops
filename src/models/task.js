const { randomUUID } = require('crypto');
const { Pool } = require('pg');

const ALLOWED_STATUS = ['todo', 'in_progress', 'done'];
const STORAGE_MODE = process.env.STORAGE_MODE || (process.env.NODE_ENV === 'test' ? 'memory' : 'postgres');
const USE_POSTGRES = STORAGE_MODE === 'postgres';

const memoryTasks = [];
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'todo_user',
      password: process.env.DB_PASSWORD || 'todo_pass',
      database: process.env.DB_NAME || 'todo_db',
    });
  }

  return pool;
}

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateTaskPayload(payload = {}, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    const hasTitle = typeof payload.title === 'string' && payload.title.trim().length > 0;
    const hasDescription = typeof payload.description === 'string' && payload.description.trim().length > 0;
    if (!hasTitle && !hasDescription) {
      errors.push('title ou description est requis pour creer une tache');
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'title') && typeof payload.title !== 'string') {
    errors.push('title doit etre une chaine de caracteres');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description') && typeof payload.description !== 'string') {
    errors.push('description doit etre une chaine de caracteres');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'status') && !ALLOWED_STATUS.includes(payload.status)) {
    errors.push(`status doit etre parmi: ${ALLOWED_STATUS.join(', ')}`);
  }

  return errors;
}

async function initStorage() {
  if (!USE_POSTGRES) {
    return;
  }

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'todo',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function createTask(payload) {
  const task = {
    id: randomUUID(),
    title: payload.title || '',
    description: payload.description || '',
    status: payload.status || 'todo',
  };

  if (!USE_POSTGRES) {
    const now = new Date().toISOString();
    const saved = { ...task, createdAt: now, updatedAt: now };
    memoryTasks.push(saved);
    return saved;
  }

  const result = await getPool().query(
    `INSERT INTO tasks (id, title, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, status, created_at, updated_at`,
    [task.id, task.title, task.description, task.status]
  );

  return mapRow(result.rows[0]);
}

async function getAllTasks() {
  if (!USE_POSTGRES) {
    return memoryTasks;
  }

  const result = await getPool().query(
    'SELECT id, title, description, status, created_at, updated_at FROM tasks ORDER BY created_at ASC'
  );

  return result.rows.map(mapRow);
}

async function getTaskById(id) {
  if (!USE_POSTGRES) {
    return memoryTasks.find((task) => task.id === id) || null;
  }

  const result = await getPool().query(
    'SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = $1 LIMIT 1',
    [id]
  );

  if (result.rowCount === 0) {
    return null;
  }

  return mapRow(result.rows[0]);
}

async function updateTaskById(id, payload) {
  if (!USE_POSTGRES) {
    const task = memoryTasks.find((item) => item.id === id);
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

  const current = await getTaskById(id);
  if (!current) {
    return null;
  }

  const next = {
    title: Object.prototype.hasOwnProperty.call(payload, 'title') ? payload.title : current.title,
    description: Object.prototype.hasOwnProperty.call(payload, 'description') ? payload.description : current.description,
    status: Object.prototype.hasOwnProperty.call(payload, 'status') ? payload.status : current.status,
  };

  const result = await getPool().query(
    `UPDATE tasks
     SET title = $2, description = $3, status = $4, updated_at = NOW()
     WHERE id = $1
     RETURNING id, title, description, status, created_at, updated_at`,
    [id, next.title, next.description, next.status]
  );

  return mapRow(result.rows[0]);
}

async function deleteTaskById(id) {
  if (!USE_POSTGRES) {
    const index = memoryTasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return false;
    }

    memoryTasks.splice(index, 1);
    return true;
  }

  const result = await getPool().query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

async function clearAllTasks() {
  if (!USE_POSTGRES) {
    memoryTasks.splice(0, memoryTasks.length);
    return;
  }

  await getPool().query('DELETE FROM tasks');
}

module.exports = {
  ALLOWED_STATUS,
  STORAGE_MODE,
  validateTaskPayload,
  initStorage,
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  clearAllTasks,
};
