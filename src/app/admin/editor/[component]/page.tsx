import { NextPage } from 'next';
import Editor from './editor';
import { FileSelectorProvider } from '@/components/fileSelector';

type Props = {
    params: Promise<{ component: string }>
};

const Page: NextPage<Props> = async ({ params }) => (
    <FileSelectorProvider>
        <Editor { ...await params } />
    </FileSelectorProvider>
);

export default Page;