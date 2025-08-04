import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const next = (request: NextRequest): NextResponse => {
    const headers = new Headers(request.headers);
    headers.set('x-current-path', request.nextUrl.pathname);
    return NextResponse.next({
        request: { headers },
    });
};

const authenticate = async (request: NextRequest): Promise<NextResponse> => {
    const token = await getToken({ req: request });

    if (!token)
        return NextResponse.redirect(new URL(
            '/admin/auth/login',
            request.url
        ));
    
    return next(request);
};

const middleware = (request: NextRequest): NextResponse | Promise<NextResponse> => {
    const { pathname } = request.nextUrl;
    if (
        pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/auth')
    ) return authenticate(request);

    return next(request);
};

const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};

export { middleware, config };