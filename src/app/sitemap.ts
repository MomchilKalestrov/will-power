import type { MetadataRoute } from 'next';

import connect from '@/lib/db';
import Component from '@/models/component';


const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    try {
        await connect();
        
        const pages = await Component.find({ type: 'page' }).select('name lastEdited').lean();
        
        return pages.map(({ name, lastEdited }) => ({
            url: `${ process.env.NEXTAUTH_URL }/${ name }`,
            lastModified: new Date(lastEdited)
        }));
    } catch (error) {
        return [];
    };
};

export default sitemap;