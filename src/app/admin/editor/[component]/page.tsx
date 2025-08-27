import { NextPage } from 'next';
import Editor from './editor';
import { FileSelectorProvider } from '@/components/fileSelector';

const Page: NextPage<PageProps<'/admin/editor/[component]'>> = async ({ params }) => (
    <FileSelectorProvider>
        <Editor { ...await params } />
    </FileSelectorProvider>
);

export default Page;