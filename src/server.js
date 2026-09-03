// import { Server } from 'socket.io';
// import http from 'http';
import app from './app.js';
import dataBase from './dataAccess/database.js';
import './dataAccess/models/index.js';

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });
const PORT = 3000;

const startServer = async () => {
  try {
    await dataBase.authenticate();
    console.log('Connection to the database has been established successfully.');

    // modelos -> DB
    //alter -> alter table force-> build zero
    await dataBase.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // start DB
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
  }
};

startServer();