import mongoose from 'mongoose';

const componentNodeSchema = new mongoose.Schema<ComponentNode>({
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

componentNodeSchema.add({
    children: { type: [ componentNodeSchema ], default: [] }
});

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

const componentSchema = new mongoose.Schema<Component>({
    name: { type: String,  required: true },
    lastEdited: { type: Number, required: true, default: Date.now },
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
    title: {
        type: String,
        required: function (this: any) { return this.type === 'page'; }
    },
    description: {
        type: String,
        required: function (this: any) { return this.type === 'page'; }
    },
    displayCondition: {
        type: [ displayCondition ],
        required: function (this: any) { return this.type === 'header' || this.type === 'footer'; }
    }
});

const Component: inferModel<typeof componentSchema> = mongoose.models.Component || mongoose.model<Component>('Component', componentSchema);

export default Component;