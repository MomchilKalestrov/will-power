'use server';
import mongoose from 'mongoose';

let connection: Promise<mongoose.Mongoose> | null = null;

const connect = async (): Promise<mongoose.Mongoose> => {
    if (!connection) {
        connection = mongoose.connect(process.env.MONGODB_URI as string);
        connection.catch(_ => connection = null);
    };
    
    return await connection;
};

export default connect;