import express from 'express';
import playerRoute from './presentation/routes/player.route.js'
import gameRoute from './presentation/routes/game.router.js'
import cardsRoute from './presentation/routes/cards.router.js'
import scoreRoute from './presentation/routes/score.router.js'
import {errorHandler} from './middlewares/errorHandler.middleware.js'

const app = express();

app.use(express.json());
app.use('/api/players', playerRoute);

app.use('/api/games', gameRoute);
app.use('/api/cards', cardsRoute);
app.use('/api/scores', scoreRoute);
app.use(errorHandler);
export default app;