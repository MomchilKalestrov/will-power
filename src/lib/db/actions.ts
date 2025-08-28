'use server';
import z from 'zod';
import connect from '.';
import Component from '@/models/component';

declare global {
    var componentNames: { [ key: string ]: Set<string> | undefined };
};

const componentName = z.string().min(1).refine(name => name === encodeURIComponent(name));

const componentNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.string(),
        type: z.string(),
        style: z.record(z.string(), z.string()),
        attributes: z.record(z.string(), z.string()),
        props: z.looseObject({}),
        acceptChildren: z.boolean(),
        children: z.array(componentNodeSchema)
    })
);

const componentTypes = z.literal([ 'header', 'page', 'footer', 'component' ]);

const componentSchema = z.union([
    z.object({
        type: z.enum([ 'header', 'footer' ]),
        name: componentName,
        lastEdited: z.number(),
        rootNode: componentNodeSchema,
        displayCondition: z.array(
            z.union([
                z.object({
                    show: z.literal('all'),
                }),
                z.object({
                    show: z.enum([ 'page', 'exclude' ]),
                    name: z.string()
                })
            ])
        )
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

const getComponentByName = async (name: string, type?: componentType): Promise<Component | null> => {
    let params: any = { name };
    try {
        componentTypes.parse(type);
        params.type = type;
    } catch {};

    await connect();
    let component = await Component.findOne(params).lean();
    return component ? JSON.parse(JSON.stringify(component)) : null;
};

const getAllComponents = async (type: componentType = 'page'): Promise<string[]> => {
    try { componentTypes.parse(type); } catch { return []; };

    if (global.componentNames[ type ])
        return [ ...global.componentNames[ type ] ];

    await connect();
    let components = await Component.find({ type }).distinct('name').lean();
    global.componentNames[ type ] = new Set(components);

    return [ ...global.componentNames[ type ] ];
};

const saveComponent = async (component: Partial<Component>): Promise<boolean> => {
    try {
        const model = componentSchema.parse(component);
        const { name, ...data } = model;

        await connect();
        await Component.findOneAndUpdate(
            { name },
            { $set: data },
            {
                upsert: true,
                runValidators: true,
            }
        );

        return true;
    } catch (error) {
        console.error('Error saving component: ' + error);
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

const getMatchingComponents = async (name: string, type: 'header' | 'footer'): Promise<Component[]> => {
    await connect();

    const components = await Component.find({
        type,
        $nor: [ { displayCondition: { $elemMatch: { show: 'exclude', name } } } ],
        $or: [
            { displayCondition: { $exists: false } },
            { displayCondition: { $size: 0 } },
            { displayCondition: { $elemMatch: { show: 'all' } } },
            { displayCondition: { $elemMatch: { show: 'page', name } } }
        ]
    }).lean();
    
    return JSON.parse(JSON.stringify(components));
};

export { getComponentByName, saveComponent, getAllComponents, createComponent, deleteComponent, getMatchingComponents };