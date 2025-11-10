import { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';

import { FileSelectorProvider } from '@/components/fileSelector';

import { getComponentByName } from '@/lib/db/actions';

import Editor from './editor';

export const generateMetadata = async ({ params }: PageProps<'/admin/editor/[component]'>): Promise<Metadata> => {
    const { component } = await params;
    return { title: component };
};

const Page: NextPage<PageProps<'/admin/editor/[component]'>> = async ({ params }) => {
    const component = await getComponentByName((await params).component);

    if (!component)
        return notFound();
    
    return (
        <FileSelectorProvider>
            <Editor component={ component } />
        </FileSelectorProvider>
    );
};

export default Page;