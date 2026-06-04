const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
if (!process.env.STORAGE_MODE) {
  process.env.STORAGE_MODE = 'memory';
}

const app = require('../../src/app');
const { initStorage, clearAllTasks } = require('../../src/models/task');

let server;
let baseUrl;

test.before(async () => {
  await initStorage();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test.beforeEach(async () => {
  await clearAllTasks();
});

test('health check retourne 200', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
});

test('CRUD complet des taches', async () => {
  const createResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Task API', description: 'integration', status: 'todo' }),
  });

  assert.equal(createResponse.status, 201);
  const createdTask = await createResponse.json();
  assert.ok(createdTask.id);

  const listResponse = await fetch(`${baseUrl}/api/tasks`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.length, 1);

  const updateResponse = await fetch(`${baseUrl}/api/tasks/${createdTask.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'done' }),
  });

  assert.equal(updateResponse.status, 200);
  const updatedTask = await updateResponse.json();
  assert.equal(updatedTask.status, 'done');

  const deleteResponse = await fetch(`${baseUrl}/api/tasks/${createdTask.id}`, {
    method: 'DELETE',
  });

  assert.equal(deleteResponse.status, 204);

  const afterDelete = await fetch(`${baseUrl}/api/tasks`);
  const remaining = await afterDelete.json();
  assert.equal(remaining.length, 0);
});

test('GET /api/tasks/:id retourne 404 si la tache est absente', async () => {
  const response = await fetch(`${baseUrl}/api/tasks/00000000-0000-0000-0000-000000000000`);
  assert.equal(response.status, 404);
});

test('POST /api/tasks retourne 400 sur payload vide', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  assert.equal(response.status, 400);
});

test('GET /metrics expose les metriques Prometheus', async () => {
  await fetch(`${baseUrl}/health`);
  const response = await fetch(`${baseUrl}/metrics`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /text\/plain/);

  const body = await response.text();
  assert.match(body, /http_requests_total/);
  assert.match(body, /http_request_duration_seconds/);
});
