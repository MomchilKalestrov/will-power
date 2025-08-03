'use server'
import mongoose from 'mongoose';

const pageNodeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    style: { type: mongoose.Schema.Types.Mixed, default: {} },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
    acceptChildren: { type: Boolean, default: false }
}, { minimize: false });

pageNodeSchema.add({
    children: { type: [ pageNodeSchema ], default: [] }
})

const pageSchema = new mongoose.Schema<PageNode>({
    name: { type: String, required: true },
    lastEdited: { type: Number, required: true },
    rootNode: { type: pageNodeSchema, required: true }
});

const db = mongoose.connection;
const Page = db.models.Page || mongoose.model('Page', pageSchema);

export default Page;