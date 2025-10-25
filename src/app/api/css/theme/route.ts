import { getConfig } from '@/lib/config';
import { NextResponse } from 'next/server';

const handler = async () =>
    NextResponse.redirect(
        process.env.NEXT_PUBLIC_BLOB_URL +
        '/themes/' +
        (await getConfig()).theme +
        '/index.css'
    );

export {
    handler as GET,
    handler as POST,
    handler as HEAD
};