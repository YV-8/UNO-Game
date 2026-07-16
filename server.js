import app from './src/app.js';
import dataBase from './src/DataAccess/DataBase/database.js';

const PORT = 3002;
dataBase.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    
    // 2. Levantar el servidor SOLO si la base de datos conectó con éxito
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });