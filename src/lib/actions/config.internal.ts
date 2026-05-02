import 'server-only';
import { hasAuthority } from '@/lib/utils';
import { addAuthInfo } from '@/lib/authenticateSSA';
import { updateConfigSchema } from '@/lib/zodSchemas';

import connect from '@/lib/db';

import Config from '@/models/config';

const defaultConfig: config = {
    theme: 'default',
    fonts: [],
    variables: [],
    lastEdited: Date.now(),
    plugins: [],
    themes: []
};

const isAuthorized = (config: Partial<config>, user: User): boolean =>
    !('plugins' in config || 'themes' in config) || hasAuthority(user.role, 'admin', 0);

const getConfig = async (): serverActionResponse<config> => {
    if (global.config)
        return {
            success: true,
            value: JSON.parse(JSON.stringify(global.config))
        };
    
    try {
        await connect();
    
        global.config = await Config.findOne().lean<config>() ?? undefined;
        
        if (!global.config) {
            global.config = defaultConfig;
            const document = new Config(global.config);
            document.save();
        };
    
        return {
            success: true,
            value: JSON.parse(JSON.stringify(global.config))
        };
    } catch (error) {
        console.error('[sa] getConfig error: ', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const setConfig = addAuthInfo(async (user: User, config: Partial<config>): serverActionResponse<boolean> => {
    try {
        const data = updateConfigSchema.parse(config) as Partial<config>;
        
        if (!isAuthorized(config, user))
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
}, 'strong');

export { getConfig, setConfig };