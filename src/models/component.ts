import mongoose from 'mongoose';
import componentNodeSchema from './pageNode';
import displayCondition from './displayCondition';

const componentSchema = new mongoose.Schema<Component>({
    name: { type: String,  required: true },
    lastEdited: { type: Number, required: true, default: Date.now() },
    rootNode: {
        type: componentNodeSchema,
        required: true,
        default: {
            id: 'root',
            type: 'Container',
            style: {},
            attributes: {},
            children: [],
            props: {},
            acceptChildren: true
        }
    },
    type: { type: String, required: true, enum: [ 'header', 'page', 'footer', 'component' ] },
    displayCondition: { type: [ displayCondition ], required: false }
});

const db = mongoose.connection;
const Component = db.models.Component || mongoose.model<Component>('Component', componentSchema);

export default Component;