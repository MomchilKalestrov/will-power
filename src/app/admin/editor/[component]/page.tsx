import { NextPage } from 'next';
import Editor from './editor';
import { FileSelectorProvider } from '@/components/fileSelector';
import { getComponentByName } from '@/lib/db/actions';
import { notFound } from 'next/navigation';

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