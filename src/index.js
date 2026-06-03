const app = require('./app');
const { initStorage } = require('./models/task');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initStorage();
    app.listen(PORT, () => {
      console.log(`todo-api running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erreur de demarrage:', error.message);
    process.exit(1);
  }
}

start();
