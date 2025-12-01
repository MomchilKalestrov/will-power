import { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import RenderNode from '@/components/renderNode';
import { getComponentByName, getMatchingComponents } from '@/lib/db/actions';

export const generateMetadata = async ({ params }: PageProps<'/[page]'>): Promise<Metadata> => {
    const { page } = await params;
    const { title, description } = await getComponentByName(page, 'page') as Component & { type: 'page' };
    return { title, description };
};

const Page: NextPage<PageProps<'/[page]'>> = async ({ params }) => {
    const { page: pageName } = await params;
    const page = await getComponentByName(pageName, 'page');
    if (!page) return notFound();
    const headers = await getMatchingComponents(pageName, 'header');
    const footers = await getMatchingComponents(pageName, 'footer');
    
    if (headers === null)
        console.log('Warning: getMatchingComponents(pageName, \'header\') returned an error.');
    if (footers === null)
        console.log('Warning: getMatchingComponents(pageName, \'footer\') returned an error.');

    return (
        <>
            { headers?.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-header' } node={ rootNode } />
            )) }
            <RenderNode node={ page.rootNode } />
            { footers?.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-footer' } node={ rootNode } />
            )) }
        </>
    );
};

export default Page;