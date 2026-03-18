import { NextPage } from 'next';
import { getTranslations } from 'next-intl/server';

import { getConfig } from '@/lib/actions/config';

import Editor from './editor';

const Page: NextPage = async () => {
    const config = await getConfig();
    const t = await getTranslations('Admin.Variables');
    
    return config.success
    ?   <Editor initialConfig={ config.value } />
    :   <p>{ t('failedConfig') }<br />{ config.reason }</p>;
};

export default Page;