import { type NextRequest, NextResponse } from 'next/server';

import { getAdapter, getBlob } from '@/lib/actions/blob/internal';

type RouteProps = {
    params: Promise<{
        path: string[];
    }>;
};

export const GET = async (_: NextRequest, { params }:RouteProps) => {
    const { path } = await params;

    if ((await getAdapter()).type !== 'File system')
        return new NextResponse('Not found.', { status: 404 });
    
    try {
        // we don't have to validate the path, since it
        // will be validated by `getBlob` itself
        const data = await getBlob({
            id: 'NULL',
            username: 'NULL',
            role: 'editor'
        }, path.join('/'));

        if (!data.success) return new NextResponse(data.reason, { status: 400 });

        return new NextResponse(new Blob([ data.value ]), { status: 200 });
    } catch (error) {
        return new NextResponse(
            error instanceof Error
            ?   error.message
            :   'Server error.',
            { status: 500 }
        );
    };
};