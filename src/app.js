import express from 'express';
import playerRoute from './Presentation/Routes/playerRoute.js'
import {errorHandler} from './Middlewares/errorHandler.middleware.js'

const app = express();

app.use(express.json());
app.use('/player', playerRoute);

app.use(errorHandler);
export default app;