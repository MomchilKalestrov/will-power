import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema<ComponentNode>({
    id: { type: String, required: true },
    type: { type: String, required: true },
    style: { type: Object, of: String, default: {} },
    attributes: { type: Object, of: String, default: {} },
    props: { type: Object, of: Object, default: {} },
    acceptChildren: { type: Boolean, default: false }
}, {
    minimize: false,
    id: false,
    _id: false,
    versionKey: false
});

nodeSchema.add({
    children: { type: [ nodeSchema ], default: [] }
});

export default nodeSchema;