import { Isolate, Module, Reference, ExternalCopy } from 'isolated-vm';

import * as blobs from '@/lib/actions/blob/internal';
import * as config from '@/lib/actions/config.internal';
import * as collections from '@/lib/actions/collections.internal';

import * as users from '@/lib/db/actions/user.internal';
import * as components from '@/lib/db/actions/component.internal';

const namespaces: Record<string, Record<string, {
    (...params: any[]): any;
    auth?: 'weak' | 'strong';
}>> = {
    users,
    components,
    config,
    collections,
    blobs
};

export const runInSandbox = async (user: User | undefined, script: string, func: string, args: any) => {
    console.log('Instantiating new isolate.');
    const isolate = new Isolate();
    const context = await isolate.createContext();
    
    const jail = context.global;
    jail.setSync('global', jail.derefInto());
    jail.setSync('log', (...data: any[]) => console.log(`[${ func }]:`, ...data));

    console.log('Injecting API into isolate.')
    const apiRef = await context.eval('({})', { reference: true });

    for (const [ namespace, functions ] of Object.entries(namespaces)) {
        const namespaceRef = await context.eval('({})', { reference: true });
        for (const [ n, f ] of Object.entries(functions))
            namespaceRef.setSync(n, new Reference(async (...args: any[]) => {
                const authType = 'auth' in f ? f.auth : 'none';
                let response: any;
                switch (authType) {
                    case 'none':
                        response = await f(...args);
                        break;
                    case 'weak':
                        response = await f(user, ...args);
                        break;
                    case 'strong':
                        response = !user
                        ? {
                            success: false,
                            reason: 'Unauthorized action.'
                        }
                        : await f(user, ...args);
                        break;
                };
                return new ExternalCopy(response).copyInto();
            }));
        apiRef.setSync(namespace, namespaceRef.derefInto());
    };

    jail.setSync('WP', apiRef.derefInto());

    await context.eval(
        'for (const ns of Object.keys(WP)) {\n' +
        '    for (const fn of Object.keys(WP[ns])) {\n' +
        '        const ref = WP[ns][fn];\n' +
        '        WP[ns][fn] = (...args) => ref.applySyncPromise(undefined, args);\n' +
        '    }\n' +
        '}'
    );
     
    let module: Module | undefined;
    let exports: Reference<any> | undefined;
    let functionInstance: Reference<any> | undefined;

    const free = () => {
        console.log('Freeing isolate\'s references.');
        isolate.dispose();
        jail.release();
        apiRef.release();
        module?.release();
        exports?.release();
        functionInstance?.release();
    };

    try {
        console.log('Parsing function arguments.')
        const parsedArgs = (Array.isArray(args) ? args : [ args ]).map(arg => new ExternalCopy(arg).copyInto());

        console.log('Compiling module.')
        module = await isolate.compileModule(script);

        console.log('Instantiating module.')
        module.instantiate(context, () => {
            throw new Error('Using imports is not allowed. If you require an external file - bundle it into the script.');
        });

        await module.evaluate();

        exports = module.namespace;
        console.log('Getting target function instance.');
        functionInstance = await exports.get(func, { reference: true });
        const result = await functionInstance.apply(undefined, parsedArgs, {
            result: { promise: true, copy: true }
        });

        free();

        return result;
    } catch (error) {
        free();
        // we're only clearing everything up here
        // let someone else handle it
        throw error; 
    };
};