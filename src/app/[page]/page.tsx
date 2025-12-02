import { Metadata, NextPage } from 'next';
import { notFound } from 'next/navigation';
import RenderNode from '@/components/renderNode';
import { getComponentByName, getMatchingComponents } from '@/lib/db/actions';

export const generateMetadata = async ({ params }: PageProps<'/[page]'>): Promise<Metadata> => {
    const { page } = await params;
    
    const component = await getComponentByName(page, 'page');
    if (!component.success)
        return {};

    const { title, description } = component.value as Component & { type: 'page' };
    return { title, description };
};

const Page: NextPage<PageProps<'/[page]'>> = async ({ params }) => {
    const { page: pageName } = await params;
    const page = await getComponentByName(pageName, 'page');
    if (!page.success) return notFound();

    const headers = await getMatchingComponents(pageName, 'header');
    const footers = await getMatchingComponents(pageName, 'footer');
    
    if (!headers.success)
        console.log('Warning: getMatchingComponents(pageName, \'header\') failed: ' + headers.reason);
    if (!footers.success)
        console.log('Warning: getMatchingComponents(pageName, \'footer\') failed: ' + footers.reason);

    return (
        <>
            { headers.success && headers.value.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-header' } node={ rootNode } />
            )) }
            <RenderNode node={ page.value.rootNode } />
            { footers.success && footers.value.map(({ name, rootNode }) => (
                <RenderNode key={ name + '-footer' } node={ rootNode } />
            )) }
        </>
    );
};

export default Page;