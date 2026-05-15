const app = require('./app');
const env = require('./config/env');
const { initDatabase } = require('./db/schema');

async function start() {
  try {
    await initDatabase();
    app.listen(env.port, () => {
      console.log(`API запущен на порту ${env.port}`);
    });
  } catch (error) {
    console.error('Ошибка запуска API:', error);
    process.exit(1);
  }
}

start();
