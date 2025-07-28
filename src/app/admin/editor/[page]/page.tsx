import { NextPage } from 'next';
import Editor from './editor';
import { FileSelectorProvider } from '@/components/fileSelector';
import { ConfigProvider } from '@/components/configProvider';

type Props = {
    params: Promise<{ page: string }>
};

const Page: NextPage<Props> = async ({ params }) => (
    <ConfigProvider>
        <FileSelectorProvider>
            <Editor { ...await params } />
        </FileSelectorProvider>
    </ConfigProvider>
);

export default Page;