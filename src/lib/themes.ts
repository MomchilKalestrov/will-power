'use server';
import z from 'zod';
import AdmZip from 'adm-zip';

import * as actions from '@/lib/actions';
import { hasAuthority } from '@/lib/utils';
import { setConfig, getConfig } from '@/lib/config';
import { themeMetadataSchema } from '@/lib/zodSchemas';

import { getCurrentUser } from '@/lib/db/actions';

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

const addTheme = async (data: FormData): Promise<string | z.infer<typeof themeMetadataSchema>> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    const theme = data.get('theme') as File;
    if (!theme) return 'Could not get plugin blob from form data';
    
    const archive = new AdmZip(Buffer.from(await theme.arrayBuffer()));
    const indexText = archive.readAsText('index.css');
    if (!indexText) return 'Could not find `index.css`';

    const metaText = archive.readAsText('metadata.json');
    const parseResult = themeMetadataSchema.safeParse(JSON.parse(metaText));
    if (!parseResult.success) return 'Could not parse theme metadata';
    const metadata = parseResult.data;

    for (const file of archive.getEntries())
        if (!file.entryName.endsWith('/')) {
            const data = archive.readAsText(file);
            await actions.addBlob(`/themes/${ metadata.name }/${ file.entryName }`, data, {
                access: 'public'
            });
        };
        
    const { themes } = await getConfig();
    setConfig({ themes: [ ...themes, metadata.name ] });

    return metadata;
};

const removeTheme = async (name: string): Promise<string | boolean> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    if (!await actions.deleteBlob(`/theme/${ name }/*`))
        return 'Failed to delete the themes\'s directory';

    const { themes } = await getConfig();

    setConfig({ themes: themes.filter(theme => theme !== name) });

    return true;
};

const selectTheme = async (name: string): Promise<string | boolean> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    let { themes } = await getConfig();
    if (!themes.includes(name))
        return 'There is no theme with the given name';

    setConfig({ theme: name });

    return true;
};

export {
    addTheme,
    removeTheme,
    selectTheme
};