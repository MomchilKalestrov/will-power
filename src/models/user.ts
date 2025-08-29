import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: [ 'editor', 'admin', 'owner' ] }
});

const db = mongoose.connection;
const User = db.models.User || mongoose.model<User & { passwordHash: string }>('User', userSchema);

export default User;