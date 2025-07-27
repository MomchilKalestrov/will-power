'use server';
import connect from '.';
import Page from '@/models/page';

const getPageByName = async (name: string): Promise<Page | null> => {
    await connect();
    let page = await Page.findOne({ name }).lean();
    if (!page) return null;
    return JSON.parse(JSON.stringify(page)); // hackey solution
};

const savePage = async (pageData: Page): Promise<boolean> => {
    await connect();
    const { name, ...data } = pageData;

    try {
        await Page.findOneAndUpdate(
            { name },
            { name, ...data },
            {
                upsert: true,
                runValidators: true,
            }
        );
        return true;
    } catch {
        return false;
    }
};

export { getPageByName, savePage };