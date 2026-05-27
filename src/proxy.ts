import { NextResponse, type NextRequest } from 'next/server';

import { auth } from '@/lib/auth';

const authenticate = async (request: NextRequest): Promise<NextResponse> => {
    const token = await auth();
    if (token) return NextResponse.next();

    const params = request.nextUrl.searchParams;
    params.set('callbackUrl', request.url);

    return NextResponse.redirect(new URL(
        '/admin/auth/login?' + params.toString(),
        request.url
    ));
};

export const proxy = (request: NextRequest): NextResponse | Promise<NextResponse> =>
    /^\/admin(?!\/auth)/.test(request.nextUrl.pathname)
    ?   authenticate(request)
    :   NextResponse.next();

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};