import app from './app.js';
import dataBase from './dataAccess/database.js';
import './dataAccess/models/index.js';

const PORT = 3000;
app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
// app.listen(PORT, () => {
//   then(async () => {
//     console.log('Database connection has been established successfully.');
    
//     //alter: true
//     await dataBase.sync({});
//     console.log('Database models synchronized and tables created successfully.');

    
// });
//borrar aqui