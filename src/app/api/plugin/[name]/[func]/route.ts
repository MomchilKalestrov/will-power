'use server';
import { type NextRequest, NextResponse } from 'next/server';

import { getBlob } from '@/lib/actions/blob';
import { runInSandbox } from '@/lib/sandbox';
import { pluginAPIResponseSchema } from '@/lib/zod/pluginSchemas';
import { auth } from '@/lib/auth';

type RouteProps = {
    params: Promise<{
        name: string;
        func: string;
    }>;
};

const permissiveHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Content-Security-Policy': "default-src *; connect-src *; img-src * data: blob:; media-src * data: blob:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval';"
};

export const OPTIONS = async () =>
    new NextResponse(null, {
        status: 204,
        headers: permissiveHeaders
    });

const handler = async (request: NextRequest, { params }: RouteProps) => {
    const { name, func } = await params;
    const session = await auth();
    const user = session
    ?   { ...session.user, username: session.user.name }
    :   undefined;

    const fileResponse = await getBlob(`plugins/${ name }/api.js`);
    if (!fileResponse.success) {
        const status = fileResponse.reason.includes('Server error') ? 500 : 400;
        return new NextResponse(fileResponse.reason, { status });
    };
    const file = fileResponse.value;

    try {
        const result = await runInSandbox(user, new TextDecoder().decode(file), func, {
            body: await request.text(),
            headers: request.headers
        });
        const { body, status, headers } = pluginAPIResponseSchema.parse(result);
        
        return new NextResponse(
            typeof body === 'object' ? JSON.stringify(body) : body,
            {
                status,
                headers: {
                    ...permissiveHeaders,
                    ...headers
                }
            }
        );
    } catch (error) {
        console.error('[api] /plugin/[name]/[func]/route.ts error: ', error);
        return new NextResponse(null, { status: 500 });
    };
};

export { handler as GET, handler as POST };