'use server';
import connect from '@/lib/db';
import Component from '@/models/component';
import { componentNameSchema, componentSchema, componentTypesSchema } from '@/lib/zodSchemas';

declare global {
    var componentNames: { [ key: string ]: Set<string> | undefined };
};

if (!globalThis.componentNames)
    globalThis.componentNames = {};

const getComponentByName = async (name: string, type?: componentType): Promise<Component | null> => {
    const params: any = { name };
    try {
        try {
            componentTypesSchema.parse(type);
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
        componentTypesSchema.parse(type);

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
        await Component.updateOne(
            { name },
            { $set: data },
            {
                upsert: true,
                runValidators: true,
            }
        );

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
        componentTypesSchema.parse(type);
        componentNameSchema.parse(name);
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