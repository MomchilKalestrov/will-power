import { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';

import { getComponentByName } from '@/lib/db/actions/component';

import Editor from './editor';

export const generateMetadata = async ({ params }: PageProps<'/admin/editor/[component]'>): Promise<Metadata> => {
    const { component } = await params;
    return { title: component };
};

const Page: NextPage<PageProps<'/admin/editor/[component]'>> = async ({ params }) => {
    const component = await getComponentByName((await params).component);

    if (!component.success)
        return notFound();
    
    return (<Editor component={ component.value } />);
};

export default Page;