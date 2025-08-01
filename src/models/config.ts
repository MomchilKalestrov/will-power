import mongoose from 'mongoose';

const variableSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, required: true, enum: [ 'font', 'color' ] },
    name: { type: String, required: true },
    
    // Font-specific fields
    family: { type: String },
    style: { type: String, enum: [ 'normal', 'italic' ] },
    size: { type: String },
    weight: { type: String, enum: [ 'normal', 'bold', 'lighter', 'bolder' ] },
    fallback: { type: String, enum: [ 'serif', 'sans-serif', 'cursive', 'monospace' ] },
    
    // Color-specific field
    color: { type: String }
}, { _id: false }); 

const fontSchema = new mongoose.Schema({
    family: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const ConfigSchema = new mongoose.Schema({
    theme: { type: String, required: true, default: 'default' },
    fonts: { type: [ fontSchema ], default: [] },
    variables: { type: [ variableSchema ], default: [] }
});

const db = mongoose.connection;
const Config = db.models.Config || mongoose.model('Config', ConfigSchema);

export default Config;