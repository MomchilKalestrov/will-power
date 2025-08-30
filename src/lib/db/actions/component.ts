'use server';
import z from 'zod';
import connect from '..';
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
    const params: any = { name };
    try {
        try {
            componentTypes.parse(type);
            params.type = type;
        } catch {}

        await connect();
        const component = await Component.findOne(params).lean();
        return component ? JSON.parse(JSON.stringify(component)) : null;
    } catch (error) {
        console.error('[db] getComponentByName error:', error instanceof Error ? error.stack || error.message : error);
        return null;
    }
};

const getAllComponents = async (type: componentType = 'page'): Promise<string[]> => {
    try {
        componentTypes.parse(type);

        if (global.componentNames[ type ])
            return [ ...global.componentNames[ type ] ];

        await connect();
        const components = await Component.find({ type }).distinct('name').lean();
        global.componentNames[ type ] = new Set(components || []);
        return [ ...global.componentNames[ type ] ];
    } catch (error) {
        console.error('[db] getAllComponents error:', error instanceof Error ? error.stack || error.message : error);
        return [];
    }
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

        // Update cache if present
        if (global.componentNames[ model.type as componentType ])
            global.componentNames[ model.type as componentType ]!.add(name);

        return true;
    } catch (error) {
        console.error('[db] saveComponent error:', error instanceof Error ? error.stack || error.message : error);
        return false;
    }
};

const createComponent = async (name: string, type: componentType = 'page'): Promise<boolean> => {
    try {
        componentTypes.parse(type);
        componentName.parse(name);
    } catch (err) {
        console.error('[db] createComponent validation error:', err instanceof Error ? err.message : err);
        return false;
    }

    try {
        if (!global.componentNames[ type ])
            await getAllComponents(type);

        if (
            (type === 'page' && name === 'admin') ||
            (global.componentNames[ type ] && global.componentNames[ type ]!.has(name))
        ) return false;

        await connect();
        const exists = await Component.findOne({ name, type }).lean();
        if (exists) return false;

        await new Component({
            name,
            type,
            displayCondition:
                type === 'header' || type === 'footer'
                ?   []
                :   undefined
        }).save();

        if (!global.componentNames[ type ]) global.componentNames[ type ] = new Set();
        global.componentNames[ type ]!.add(name);
        return true;
    } catch (error) {
        console.error('[db] createComponent error:', error instanceof Error ? error.stack || error.message : error);
        return false;
    }
};

const deleteComponent = async (name: string): Promise<boolean> => {
    try {
        await connect();
        const component = await Component.findOneAndDelete({ name });
        if (!component) return false;
        if (global.componentNames[ component.type ])
            global.componentNames[ component.type ]!.delete(name);
        return true;
    } catch (error) {
        console.error('[db] deleteComponent error:', error instanceof Error ? error.stack || error.message : error);
        return false;
    }
};

const getMatchingComponents = async (name: string, type: 'header' | 'footer'): Promise<Component[]> => {
    try {
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

        return JSON.parse(JSON.stringify(components || []));
    } catch (error) {
        console.error('[db] getMatchingComponents error:', error instanceof Error ? error.stack || error.message : error);
        return [];
    }
};

export {
    getComponentByName,
    saveComponent,
    getAllComponents,
    createComponent,
    deleteComponent,
    getMatchingComponents
};