'use server';
import z from 'zod';
import connect from '.';
import Component from '@/models/component';

declare global {
    var componentNames: { [ key: string ]: Set<string> | undefined };
};

const componentName = z.string().min(1).refine(name => name === encodeURIComponent(name));

const componentNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    style: z.record(z.string(), z.string()),
    attributes: z.record(z.string(), z.string()),
    props: z.object(),
    acceptsChildren: z.boolean().optional()
});

const componentTypes = z.literal([ 'header', 'page', 'footer', 'component' ]);

const componentSchema = z.union([
    z.object({
        type: z.enum([ 'header', 'footer' ]),
        name: componentName,
        lastEdited: z.number(),
        rootNode: componentNodeSchema,
        displayCondition: z.union([
            z.object({
                show: z.literal('all'),
            }),
            z.object({
                show: z.enum([ 'page', 'exclude' ]),
                name: z.string()
            })
        ])
    }),
    z.object({
        type: z.enum([ 'page', 'component' ]),
        name: componentName,
        lastEdited: z.number(),
        rootNode: componentNodeSchema
    }),
]);

if (!global.componentNames)
    global.componentNames = {};

const getComponentByName = async (name: string): Promise<Component | null> => {
    await connect();

    let component = await Component.findOne({ name }).lean();
    if (!component) return null;
    
    return JSON.parse(JSON.stringify(component));
};

const getAllComponents = async (type: componentType = 'page'): Promise<string[]> => {
    console.log(global.componentNames[ type ]);
    try { componentTypes.parse(type); } catch { return []; };

    if (global.componentNames[ type ])
        return [ ...global.componentNames[ type ] ];

    await connect();
    let components = await Component.find({ type }).distinct('name').lean();
    global.componentNames[ type ] = new Set(components);

    return [ ...global.componentNames[ type ] ];
};

const saveComponent = async (component: Component): Promise<boolean> => {
    try {
        const model = componentSchema.parse(component);
        const { name, ...data } = model;

        await connect();
        await Component.findOneAndUpdate(
            { name },
            { name, ...data },
            {
                upsert: true,
                runValidators: true,
            }
        );

        return true;
    } catch (error) {
        console.error('Error saving page: ' + error);
        return false;
    }
};

const createComponent = async (name: string, type: componentType = 'page'): Promise<boolean> => {
    try {
        componentTypes.parse(type);
        componentName.parse(name);
    } catch { return false; };

    if (!global.componentNames[ type ])
        await getAllComponents(type);

    if (
        (type === 'page' && name === 'admin') ||
        global.componentNames[ type ]!.has(name)
    ) return false;
    
    const exists = await Component.findOne({ name, type }).lean();
    if (exists) return false;

    try {
        await new Component({
            name,
            type,
            displayCondition:
                type === 'header' || type === 'footer'
                ?   []
                :   undefined
        }).save();
        global.componentNames[ type ]!.add(name);
        return true;
    } catch (error) {
        console.error('Error creating page: ' + error);
        return false;
    }
};

const deleteComponent = async (name: string): Promise<boolean> => {
    try {
        const component = await Component.findOneAndDelete({ name });
        if (!component) return false;
        if (global.componentNames[ component.type ])
            return global.componentNames[ component.type ]!.delete(name);
        return true;
    } catch (error) {
        console.error('Error deleting page: ' + error);
        return false;
    }
};

export { getComponentByName, saveComponent, getAllComponents, createComponent, deleteComponent };