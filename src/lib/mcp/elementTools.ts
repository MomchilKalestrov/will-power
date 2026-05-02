import z from 'zod';
import { Isolate, Module, Reference } from 'isolated-vm';

import { getBlob } from '@/lib/actions/blob/internal';
import { getConfig } from '@/lib/actions/config.internal';

import respond, { UNAUTHORIZED_ACTION } from './respond';

export const getComponentNames = async (script: string) => {
    console.log('Instantiating new isolate.');
    const isolate = new Isolate();
    const context = await isolate.createContext();
    
    const jail = context.global;
    jail.setSync('global', jail.derefInto());
 
    let module: Module | undefined;
    let exports: Reference<any> | undefined;
    let functionInstance: Reference<any> | undefined;

    const free = () => {
        console.log('Freeing isolate\'s references.');
        isolate.dispose();
        jail.release();
        module?.release();
        exports?.release();
        functionInstance?.release();
    };

    try {
        module = await isolate.compileModule(script);

        module.instantiate(context, () => {
            throw new Error('Using imports is not allowed. If you require an external file - bundle it into the script.');
        });

        await module.evaluate();

        exports = module.namespace;
        
        const components = await exports.get('components', { reference: true });
        jail.setSync('__components', components.derefInto({ release: true }));
        const names = await context.eval('__components.map(c => c.metadata.name)', { copy: true });

        free();
        return names;
    } catch(error) {
        free();
        console.error(error);
        return [];
    };
};

const mcpElementTools: mcpToolTuple[] = [
    [
        'getAvailableElements',
        {
            title: 'Get Available Elements',
            description: 'Returns an array with the names of all available Elements.',
            inputSchema: z.object({})
        },
        async (_, extra) => {
            if (!extra.authInfo?.extra)
                return UNAUTHORIZED_ACTION;

            for (const key of [ 'name', 'id', 'role' ])
                if (!(key in extra.authInfo.extra))
                    return UNAUTHORIZED_ACTION;
            
            const elements = [
                'Container',
                'Header',
                'Paragraph',
                'Component',
                'CustomHTML',
                'Button',
                'Accordion',
                'Link',
                'Image'
            ];

            const configResponse = await getConfig();
            if (!configResponse.success) return respond(configResponse);
            const plugins = configResponse.value.plugins.filter(plugin => plugin.enabled);

            await Promise.all(plugins.map(async ({ name }) => {
                const blobResponse = await getBlob(extra.authInfo.extra, `plugins/${ name }/browser.js`);
                if (!blobResponse.success)
                    return console.error('Failed to fetch:', `plugins/${ name }/browser.js`, blobResponse);
                elements.push(...await getComponentNames(new TextDecoder().decode(blobResponse.value)));
            }))

            return respond({ success: true, value: elements });
        }
    ]
]

export default mcpElementTools;