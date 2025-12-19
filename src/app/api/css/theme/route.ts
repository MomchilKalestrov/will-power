import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/actions/config';

const handler = async () => {
    const config = await getConfig();

    if (!config.success)
        return new NextResponse(null, { status: 500 });
    
    return NextResponse.redirect(
        process.env.NEXT_PUBLIC_BLOB_URL +
        '/themes/' +
        config.value.theme +
        '/index.css'
    );
};

export {
    handler as GET,
    handler as POST,
    handler as HEAD
};