'use server';
import { NextPage } from 'next';
import { getConfig } from '@/lib/config';
import Editor from './editor';

const Page: NextPage = async () => (
    <Editor initialConfig={ await getConfig() } />
)

export default Page;