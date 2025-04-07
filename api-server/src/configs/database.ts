import { connect } from 'mongoose';

export async function connectDb() {
    console.log(`Connecting to MongoDB: ${process.env.MONGO_URI}`);
    await connect(process.env.MONGO_URI);
};
