'use server';
import {
    componentNameSchema,
    componentSchema,
    componentTypesSchema
} from '@/lib/zodSchemas';

import connect from '@/lib/db';
import { getCurrentUser } from '@/lib/db/actions';

import Component from '@/models/component';

declare global {
    var componentNames: { [ key: string ]: Set<string> | undefined };
};

const newComponentPresets = (name: string, type: componentType) => ({
    page: {
        name, type,
        title: name,
        description: `${ name } page.`
    },
    component: {
        name, type,
    },
    header: {
        name, type,
        displayCondition: [ { type: 'all' } ]
    },
    footer: {
        name, type,
        displayCondition: [ { type: 'all' } ]
    }
})[ type ];

if (!globalThis.componentNames)
    globalThis.componentNames = {};

const getComponentByName = async (name: string, type?: componentType): serverActionResponse<Component> => {
    const params: any = { name };
    
    try {
        if (componentTypesSchema.safeParse(type).success)
            params.type = type;

        await connect();
        const component = await Component.findOne(params).lean();
        if (!component)
            return {
                success: false,
                reason: 'Not found.'
            };
        return {
            success: true,
            value: JSON.parse(JSON.stringify(component))
        };
    } catch (error) {
        console.error('[db] getComponentByName error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const getAllComponents = async (type: componentType = 'page'): serverActionResponse<string[]> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    try {
        componentTypesSchema.parse(type);

        if (global.componentNames[ type ])
            return {
                success: true,
                value: [ ...global.componentNames[ type ] ]
            };

        await connect();
        const components = await Component.find({ type }).distinct('name').lean();
        global.componentNames[ type ] = new Set(components);
       
        return {
            success: true,
            value: [ ...global.componentNames[ type ] ]
        };
    } catch (error) {
        console.error('[db] getAllComponents error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const saveComponent = async (component: Partial<Component>): serverActionResponse<boolean> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
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

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[db] saveComponent error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const createComponent = async (name: string, type: componentType = 'page'): serverActionResponse<boolean> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    if (
        !componentTypesSchema.safeParse(type) ||
        !componentNameSchema.safeParse(name)
    )
        return {
            success: false,
            reason: 'Malformed data.'
        };

    try {
        if (!global.componentNames[ type ])
            await getAllComponents(type);

        if (
            (type === 'page' && name === 'admin') ||
            (global.componentNames[ type ] && global.componentNames[ type ]!.has(name))
        )
            return {
                success: false,
                reason: 'Invalid name.'
            };

        await connect();
        const exists = await Component.findOne({ name, type }).lean();
        if (exists)
            return {
                success: false,
                reason: 'Invalid name.'
            };

        await new Component(newComponentPresets(name, type)).save();

        if (!global.componentNames[ type ])
            global.componentNames[ type ] = new Set();
        global.componentNames[ type ]!.add(name);
        
        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[db] createComponent error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const deleteComponent = async (name: string): serverActionResponse<boolean> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    try {
        await connect();
        const component = await Component.findOneAndDelete({ name });
        if (!component)
            return {
                success: false,
                reason: 'Not found.'
            };

        if (global.componentNames[ component.type ])
            global.componentNames[ component.type ]!.delete(name);
        
        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[db] deleteComponent error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const getMatchingComponents = async (name: string, type: 'header' | 'footer'): serverActionResponse<Component[]> => {
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

        return {
            success: true,
            value: JSON.parse(JSON.stringify(components))
        };
    } catch (error) {
        console.error('[db] getMatchingComponents error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export {
    getComponentByName,
    saveComponent,
    getAllComponents,
    createComponent,
    deleteComponent,
    getMatchingComponents
};