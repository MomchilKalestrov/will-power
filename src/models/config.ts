import mongoose from 'mongoose';

const variableSchema = new mongoose.Schema<variable>({
    id: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: [ 'font', 'color' ]
    },
    name: { type: String, required: true },
    
    // Font-specific fields
    family: String,
    style: {
        type: String,
        enum: [ 'normal', 'italic' ]
    },
    size: String,
    weight: {
        type: String,
        enum: [ 'normal', 'bold', 'lighter', 'bolder' ]
    },
    fallback: {
        type: String,
        enum: [ 'serif', 'sans-serif', 'cursive', 'monospace' ]
    },
    
    // Color-specific field
    color: String
}, { _id: false }); 

const fontSchema = new mongoose.Schema<config[ 'fonts' ][ number ]>({
    family: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const pluginSchema = new mongoose.Schema<plugin>({
    name: { type: String, required: true },
    version: { type: String, required: true },
    enabled: { type: Boolean, required: true, default: true }
});

const ConfigSchema = new mongoose.Schema<config>({
    theme: { type: String, required: true, default: 'default' },
    fonts: { type: [ fontSchema ], default: [] },
    variables: { type: [ variableSchema ], default: [] },
    plugins: { type: [ pluginSchema ], default: [] },
    themes: { type: [ String ], default: [] }
});

const Config = mongoose.model<config>('Config', ConfigSchema);

export default Config;