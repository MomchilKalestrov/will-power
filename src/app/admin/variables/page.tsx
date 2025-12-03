import { Metadata, NextPage } from 'next';

import { getConfig } from '@/lib/actions/config';

import Editor from './editor';

export const metadata: Metadata = {
    title: 'Variables'
};

const Page: NextPage = async () => {
    const config = await getConfig();
    
    return config.success
    ?   <Editor initialConfig={ config.value } />
    :   <p>Failed to get the config:<br />{ config.reason }</p>;
};

export default Page;