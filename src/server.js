import app from './app.js';
import dataBase from './dataAccess/database.js';
import './dataAccess/models/index.js';

const PORT = 3000;

const startServer = async () => {
  try {
    // 1. Autenticamos la conexión (opcional, pero buena práctica)
    await dataBase.authenticate();
    console.log('Connection to the database has been established successfully.');

    // 2. Sincronizamos los modelos con la base de datos
    // { alter: true } revisará el estado actual y creará/modificará las tablas que falten
    await dataBase.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // 3. Levantamos el servidor SOLO cuando la base de datos esté lista
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
  }
};

startServer();