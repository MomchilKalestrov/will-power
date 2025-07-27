'use server'
import mongoose from 'mongoose';

const pageNodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    style: { type: Object, of: String }, // Changed from Map to Object
    attributes: { type: Object, of: String }, // Changed from Map to Object
    children: [
        {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                validator: function (value: string | any[]) {
                    return (
                        typeof value === 'string' ||
                        (Array.isArray(value) &&
                            value.every((v) => typeof v === 'object' && v.id && v.type))
                    );
                },
                message: 'children must be a string or an array of PageNode objects',
            },
        },
    ],
    props: { type: mongoose.Schema.Types.Mixed },
});

const pageSchema = new mongoose.Schema<PageNode>({
    name: { type: String, required: true },
    lastEdited: { type: Number, required: true },
    rootNode: { type: pageNodeSchema, required: true }
});

const db = mongoose.connection;
const Page = db.models.Page || mongoose.model('Page', pageSchema);

export default Page;