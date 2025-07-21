'use server';
import { put, list } from '@vercel/blob';

type configType = {
    theme: string;
};

let _config: configType | null = null;
const getConfig = async (): Promise<configType> => {
    if (!!_config) return _config;
    
    const configUrl =
        (await list())
            .blobs
                .find((b) => b.pathname.includes('config.json'))
                    ?.downloadUrl;
    
    if (!!!configUrl) {
        _config = {
            theme: 'default'
        };
        await setConfig(_config);
        return _config;
    }

    _config = await (await fetch(configUrl)).json() as configType;
    return _config;
};

const setConfig = async (config: configType): Promise<void> => {
    _config = config;
    await put('/config.json', JSON.stringify(_config), {
        addRandomSuffix: false,
        allowOverwrite: true,
        access: 'public'
    });
};

export { getConfig, setConfig };