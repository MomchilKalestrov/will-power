import { NextPage } from 'next';
import Editor from './editor';

type Props = {
    params: Promise<{ page: string }>
};

const Page: NextPage<Props> = async ({ params }) => (
    <Editor { ...await params } />
);

export default Page;