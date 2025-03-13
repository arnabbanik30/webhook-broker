import express, { json } from 'express'

import { connectDb } from '../configs/database';
import router from '../controllers/webhook-api';
import config from '../configs/configvars';

connectDb().then(() => {
    const app = express();
    app.use(json());
    app.use('/api/v0', router);
    app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
});
