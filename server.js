import app from './src/app.js';
import dataBase from './src/dataAccess/database.js';
import './src/dataAccess/models/index.js';

const PORT = 3000;
dataBase.authenticate()
  .then(async () => {
    console.log('Database connection has been established successfully.');
    
    //alter: true
    await dataBase.sync({});
    console.log('Database models synchronized and tables created successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });