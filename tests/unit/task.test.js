const test = require('node:test');
const assert = require('node:assert/strict');

const { validateTaskPayload } = require('../../src/models/task');

test('valide un payload de creation minimal', () => {
  const errors = validateTaskPayload({ title: 'Ma tache', status: 'todo' });
  assert.equal(errors.length, 0);
});

test('rejette un status invalide', () => {
  const errors = validateTaskPayload({ title: 'Tache', status: 'invalid' });
  assert.equal(errors.length, 1);
});

test('creation refusee sans title ni description', () => {
  const errors = validateTaskPayload({ status: 'todo' });
  assert.ok(errors.some((error) => error.includes('title ou description')));
});
