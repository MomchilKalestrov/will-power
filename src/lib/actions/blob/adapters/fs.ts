import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

export const type = 'File system';

const resolvePath = (pathname: string): string => {
    pathname = pathname.replaceAll('..', '.').replaceAll('~', '.');
    while (pathname.startsWith('/'))
        pathname = pathname.substring(1);
    return path.resolve('public', pathname);
};

const getAllFiles = (pathname: string) => {
    let files: string[] = [];

    (function traverse(directory: string) {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) return traverse(absolute);
            else return files.push(absolute);
        });
    })(pathname);

    return files;
};

const getBlob = async (pathname: string): Promise<Uint8Array | null> => {
    const resolvedPath = resolvePath(pathname);
    if (!resolvedPath.startsWith(cwd) || resolvedPath.includes('~')) return null;

    try {
        const reader = fs.createReadStream(resolvedPath);
        const buf: Uint8Array = new Uint8Array(fs.statSync(pathname).size);
        let offset = 0;
    
        while (true) {
            const { done, value } = await reader.read();
            if (value) {
                buf.set(value, offset);
                offset += value.byteLength;
            };
    
            if (done) break;
        };
    
        return buf;
    } catch {
        return null;
    };
};

const getBlobList = async (): Promise<BlobInformation[]> =>
    getAllFiles('public')
        .map(pathname => {
            const stats = fs.statSync(pathname);
            return {
                pathname,
                url: `${ process.env.NEXTAUTH_URL }/${ pathname }`,
                size: stats.size,
                uploadedAt: stats.birthtime
            };
        });

const addBlob = async (pathname: string, body: BlobPutBody): Promise<BlobInformation> => {
    let size: number;
    if (typeof body === 'string') size = body.length;
    else if ('byteLength' in body) size = body.byteLength;
    else if ('length' in body) size = Number(body.length) || 0;
    else size = body.toString().length;

    const uploadedAt = new Date();
    
    const resolvedPath = resolvePath(pathname);

    return {
        pathname: resolvedPath.substring(resolvePath('.').length),
        url: `${ process.env.NEXTAUTH_URL }/${ pathname }`,
        size,
        uploadedAt
    };
};

const existsBlob = async (path: string): Promise<boolean> => {
    const blobs = await getBlobList();

    return path.endsWith('/')
    ?   blobs.some(b => b.pathname.startsWith(path)) // if is a directory
    :   blobs.some(b => b.pathname === path || b.pathname.startsWith(path + '/')); // if is a file
};

const deleteBlob = async (path: string): Promise<void> => {
    const blobs = await getBlobList();

    const toDelete = blobs.filter(b => b.pathname === path || b.pathname.startsWith(path));
    if (toDelete.length !== 0)
        toDelete.forEach(({ pathname }) => fs.rmSync(pathname, { recursive: true }));
};

export { getBlob, getBlobList, addBlob, existsBlob, deleteBlob };