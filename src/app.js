import express from 'express';
import playerRoute from './presentation/routes/players.route.js'
import {errorHandler} from './middlewares/errorHandler.middleware.js'

const app = express();

app.use(express.json());
app.use('/player', playerRoute);

app.use(errorHandler);
export default app;