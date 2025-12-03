import { Metadata, NextPage } from 'next';

import { getConfig } from '@/lib/actions/config';

import Editor from './editor';

export const metadata: Metadata = {
    title: 'Variables'
};

const Page: NextPage = async () => (
    <Editor initialConfig={ await getConfig() } />
)

export default Page;