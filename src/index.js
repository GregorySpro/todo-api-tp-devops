const app = require('./app');

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`todo-api running on http://localhost:${PORT}`);
});
