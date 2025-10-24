'use server';
import connect from '@/lib/db';
import * as actions from '@/lib/db/actions';
import Config from '@/models/config';
import { hasAuthority } from './utils';

declare global {
    var config: config | undefined;
};

export type font = {
    family: string;
    style: 'normal' | 'italic';
    size: string;
    weight: 'normal' | 'bold' | 'lighter' | 'bolder';
    fallback: 'serif' | 'sans-serif' | 'monospace' | 'cursive';
};

export type fontVariable = {
    type: 'font';
    id: string;
    name: string;
} & font;

export type colorVariable = {
    type: 'color';
    id: string;
    name: string;
    color: `#${string}`;
};

export type variable = fontVariable | colorVariable;

export type plugin = {
    name: string;
    version: string;
    enabled: boolean;
};

export type config = {
    theme: string;
    fonts: ({ family: string, url: string })[];
    variables: variable[];
    lastEdited: timestamp;
    plugins: plugin[];
};

const defaultConfig: config = {
    theme: 'default',
    fonts: [],
    variables: [],
    lastEdited: Date.now(),
    plugins: []
}; 

const getConfig = async (): Promise<config> => {
    if (global.config) return JSON.parse(JSON.stringify(global.config));
    await connect();

    global.config = await Config.findOne().lean() as unknown as config;
    
    if (!global.config) {
        global.config = defaultConfig;
        const document = new Config(global.config);
        document.save();
    };

    return JSON.parse(JSON.stringify(global.config));
};

const setConfig = async (config: Partial<config>): Promise<boolean> => {
    try {
        const user = await actions.getCurrentUser();
        if (!user) return false;

        if ('plugins' in config && !hasAuthority(user.role, 'admin'))
            return false;

        const currentConfig: config = global.config || await getConfig();
        const newConfig: config = { ...currentConfig, ...config };
        await Config.updateOne({}, newConfig, { upsert: true });
        global.config = newConfig;
        return true;
    } catch (error) {
        console.error('[sa] setConfig error:', error);
        return false;
    }
};

export { getConfig, setConfig };