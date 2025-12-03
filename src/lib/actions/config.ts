'use server';
import connect from '@/lib/db';
import { getCurrentUser } from '@/lib/db/actions';

import { hasAuthority } from '@/lib/utils';
import { updateConfigSchema } from '@/lib/zodSchemas';

import Config from '@/models/config';

declare global {
    var config: config | undefined;
    
    type font = {
        family: string;
        style: 'normal' | 'italic';
        size: string;
        weight: 'normal' | 'bold' | 'lighter' | 'bolder';
        fallback: 'serif' | 'sans-serif' | 'monospace' | 'cursive';
    };

    type fontVariable = {
        type: 'font';
        id: string;
        name: string;
    } & font;

    type colorVariable = {
        type: 'color';
        id: string;
        name: string;
        color: `#${ string }`;
    };
    
    type variable = fontVariable | colorVariable;
    
    type plugin = {
        name: string;
        version: string;
        enabled: boolean;
    };
    
    type config = {
        theme: string;
        fonts: ({ family: string, url: string })[];
        variables: variable[];
        lastEdited: timestamp;
        plugins: plugin[];
        themes: string[];
    };
};

const defaultConfig: config = {
    theme: 'default',
    fonts: [],
    variables: [],
    lastEdited: Date.now(),
    plugins: [],
    themes: []
};

const getConfig = async (): serverActionResponse<config> => {
    if (global.config) return JSON.parse(JSON.stringify(global.config));
    
    try {
        await connect();
    
        global.config = await Config.findOne().lean<config>() ?? undefined;
        
        if (!global.config) {
            global.config = defaultConfig;
            const document = new Config(global.config);
            document.save();
        };
    
        return JSON.parse(JSON.stringify(global.config));
    } catch (error) {
        console.error('[sa] getConfig error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const setConfig = async (config: Partial<config>): serverActionResponse<boolean> => {
    try {
        const data = updateConfigSchema.parse(config) as Partial<config>;
        const user = await getCurrentUser();
        if (!user)
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        if (('plugins' in config || 'themes' in config) && !hasAuthority(user.role, 'admin', 0))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        const currentConfig = await getConfig();

        if (!currentConfig.success)
            return currentConfig;

        const newConfig: config = { ...currentConfig.value, ...data };
        await Config.findOneAndUpdate({}, newConfig, { upsert: true });
        global.config = newConfig;
        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[sa] getConfig error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

export { getConfig, setConfig };