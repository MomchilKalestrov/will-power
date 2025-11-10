import { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import RenderNode from '@/components/renderNode';
import { getComponentByName, getMatchingComponents } from '@/lib/db/actions/';

export const generateMetadata = async ({ params }: PageProps<'/[page]'>): Promise<Metadata> => {
    const { page } = await params;
    return { title: page };
};

const Page: NextPage<PageProps<'/[page]'>> = async ({ params }) => {
    const { page: pageName } = await params;
    const page = await getComponentByName(pageName, 'page');
    if (!page) return notFound();
    const headers = await getMatchingComponents(pageName, 'header');
    const footer = await getMatchingComponents(pageName, 'footer');
    
    return (
        <>
            { headers.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-header' } node={ rootNode } />
            )) }
            <RenderNode node={ page.rootNode } />
            { footer.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-footer' } node={ rootNode } />
            )) }
        </>
    );
};

export default Page;