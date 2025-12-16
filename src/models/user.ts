import mongoose from 'mongoose';

const userSchema = new mongoose.Schema<User & { passwordHash: string }>({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: [ 'editor', 'admin', 'owner' ] }
});

const User: inferModel<typeof userSchema> = mongoose.models.User || mongoose.model<User & { passwordHash: string }>('User', userSchema);

export default User;