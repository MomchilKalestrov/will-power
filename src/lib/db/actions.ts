'use server';
import connect from '.';
import Page from '@/models/page';

declare global {
    var pageNames: Set<string> | undefined;
};

const getPageByName = async (name: string): Promise<Page | null> => {
    await connect();
    let page = await Page.findOne({ name }).lean();
    if (!page) return null;
    return JSON.parse(JSON.stringify(page)); // hackey solution
};

const getAllPages = async (): Promise<string[]> => {
    if (global.pageNames) return [ ...global.pageNames ];
    await connect();
    let pages = await Page.distinct('name').lean();
    global.pageNames = new Set(pages);
    return [ ...global.pageNames ];
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
    } catch (error) {
        console.error('Error saving page: ' + error);
        return false;
    }
};

const createPage = async (name: string): Promise<boolean> => {
    if (!global.pageNames) await getAllPages();

    if (
        name === 'admin' ||
        name !== encodeURIComponent(name) ||
        name.length === 0 ||
        global.pageNames?.has(name)
    ) return false;
    
    const exists = await Page.findOne({ name }).lean();

    if (exists) return false;

    try {
        await new Page({ name }).save();
        global.pageNames!.add(name);
        return true;
    } catch (error) {
        console.error('Error creating page: ' + error);
        return false;
    }
};

const deletePage = async (name: string): Promise<boolean> => {
    try {
        await Page.findOneAndDelete({ name });
        if (global.pageNames)
            return global.pageNames.delete(name);
        return true;
    } catch (error) {
        console.error('Error deleting page: ' + error);
        return false;
    }
};

export { getPageByName, savePage, getAllPages, createPage, deletePage };