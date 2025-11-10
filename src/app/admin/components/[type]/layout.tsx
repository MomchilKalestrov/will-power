import { Metadata } from 'next';

export const generateMetadata = async ({ params }: PageProps<'/admin/components/[type]'>): Promise<Metadata> => {
    const { type } = await params;
    return { title: type.charAt(0).toUpperCase() + type.substring(1) + 's' };
};

export default ({ children }: { children: React.ReactNode }) => children;