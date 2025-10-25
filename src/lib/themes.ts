'use server';
import AdmZip from 'adm-zip';
import z from 'zod';
import { setConfig, getConfig } from '@/lib/config';
import { hasAuthority, validName } from '@/lib/utils';
import * as actions from '@/lib/actions';
import { getCurrentUser } from '@/lib/db/actions';

const metadataSchema = z.object({
    name: z.string().refine(validName, { error: 'The theme has an invalid filename.' })
});

const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return !!user && hasAuthority(user.role, 'admin', 0);
};

const addTheme = async (data: FormData): Promise<string | z.infer<typeof metadataSchema>> => {
    if (!await isAuthenticated())
        return 'This user does not have the required priviliges';

    const theme = data.get('theme') as File;
    if (!theme) return 'Could not get plugin blob from form data';
    
    const archive = new AdmZip(Buffer.from(await theme.arrayBuffer()));
    const indexText = archive.readAsText('index.css');
    if (!indexText) return 'Could not find `index.css`';

    const metaText = archive.readAsText('metadata.json');
    const parseResult = metadataSchema.safeParse(JSON.parse(metaText));
    if (!parseResult.success) return 'Could not parse theme metadata';
    const metadata = parseResult.data;

    await actions.addBlob(`/themes/${ metadata.name }/index.css`, indexText, {
        access: 'public'
    });
    await actions.addBlob(`/themes/${ metadata.name }/metadata.json`, metaText, {
        access: 'public'
    });
    
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