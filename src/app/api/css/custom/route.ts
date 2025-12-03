import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/actions/config';
import { cssFromConfig } from '@/lib/utils';

const GET = async () => {
    const config = await getConfig();

    if (!config.success)
        return new NextResponse(null, { status: 500 });

    return new NextResponse(cssFromConfig(config.value), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
};

export { GET };