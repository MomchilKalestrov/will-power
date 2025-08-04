import mongoose from 'mongoose';

const displayCondition = new mongoose.Schema<displayCondition>({
    show: {
        type: String,
        required: true,
        default: 'all',
        enum: [ 'all', 'page', 'exclude' ]
    },
    name: { type: String, required: false }
}, {
    minimize: false,
    id: false,
    _id: false,
    versionKey: false
});

export default displayCondition;