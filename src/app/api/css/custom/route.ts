import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/actions/config';
import { cssFromConfig } from '@/lib/utils';

const GET = async () =>
    new NextResponse(cssFromConfig(await getConfig()), {
        headers: {
            'Content-Type': 'text/css'
        }
    });

export { GET };