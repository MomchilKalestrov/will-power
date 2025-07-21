import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true }
});

const db = mongoose.connection;
const User = db.models.User || mongoose.model('User', userSchema);

export default User;