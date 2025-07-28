'use server';
import connect from './db';
import Config from '@/models/config';

declare global {
    var config: config | undefined;
};

type variable = {
    type: 'font' | 'color';
    id: string;
    name: string;
} & ({
    type: 'font';
    family: string;
    style: 'normal' | 'italic';
    size: string;
    weight: 'normal' | 'bold' | 'lighter' | 'bolder'
} | {
    type: 'color';
    color: `#${string}`
});

type config = {
    theme: string;
    fonts: ({ family: string, url: string })[];
    variables: variable[];
    lastEdited: timestamp;
};

const defaultConfig: config = {
    theme: 'default',
    fonts: [],
    variables: [],
    lastEdited: Date.now()
}; 

const getConfig = async (): Promise<config> => {
    console.log(JSON.stringify(global.config, null, '\t'));
    if (!!global.config) return JSON.parse(JSON.stringify(global.config));
    
    await connect();
    global.config = await Config.findOne().lean() as unknown as config;
    
    if (!global.config) {
        global.config = defaultConfig;
        const document = new Config(global.config);
        document.save();
    };

    return JSON.parse(JSON.stringify(global.config));
};

const setConfig = async (config: Partial<config>): Promise<void> => {
    const currentConfig: config = global.config || await getConfig();
    const newConfig: config = { ...currentConfig, ...config };
    global.config = newConfig;
    console.log(newConfig);
    await Config.findOneAndUpdate({}, newConfig, { upsert: true, new: true });
};

export { getConfig, setConfig };
export type { config };