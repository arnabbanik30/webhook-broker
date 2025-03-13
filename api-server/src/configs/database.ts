import { connect } from 'mongoose';
import config from './configvars';

export async function connectDb() {
    await connect(config.MONGO_URI);
};
