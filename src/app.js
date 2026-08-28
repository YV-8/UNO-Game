import express from 'express';
import playerRoute from './presentation/routes/player.route.js'
import gameRoute from './presentation/routes/game.router.js'
import cardsRoute from './presentation/routes/card.router.js'
import scoreRoute from './presentation/routes/score.router.js'
import authRoute from './presentation/routes/auth.route.js'
import statsRoute from './presentation/routes/stats.router.js'
import {errorHandler} from './middlewares/errorHandler.middleware.js'
import {withTracking} from './container.js';

const app = express();

app.use(express.json());
app.use(withTracking);
app.use('/api/players', playerRoute);
app.use('/api/auth', authRoute);
app.use('/api/games', gameRoute);
app.use('/api/cards', cardsRoute);
app.use('/api/scores', scoreRoute);
app.use('/api/stats', statsRoute)
app.use(errorHandler);
export default app;
