import type mongoose from 'mongoose';

declare global {
    type inferModel<T extends mongoose.Schema> = mongoose.Model<mongoose.InferSchemaType<T>>;
};

export {};