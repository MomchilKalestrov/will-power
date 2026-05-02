import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

import { authCodeStore } from '@/lib/oauth/store';

export const GET = async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;

    const response_type         = searchParams.get('response_type');
    const client_id             = searchParams.get('client_id');
    const redirect_uri          = searchParams.get('redirect_uri');
    const state                 = searchParams.get('state');
    const code_challenge        = searchParams.get('code_challenge');
    const code_challenge_method = searchParams.get('code_challenge_method');

    if (response_type !== 'code')
        return NextResponse.json(
            { error: 'unsupported_response_type' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (!client_id)
        return NextResponse.json(
            { error: 'invalid_request', detail: 'client_id is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (!redirect_uri)
        return NextResponse.json(
            { error: 'invalid_request', detail: 'redirect_uri is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (!state)
        return NextResponse.json(
            { error: 'invalid_request', detail: 'state is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (!code_challenge)
        return NextResponse.json(
            { error: 'invalid_request', detail: 'code_challenge is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (code_challenge_method !== 'S256')
        return NextResponse.json(
            { error: 'invalid_request', detail: 'code_challenge_method must be S256' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
        
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET!,
    });

    if (!token) {
        const loginUrl = new URL('/admin/auth/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        redirect(loginUrl.toString());
    };

    const code = randomBytes(32).toString('hex');

    authCodeStore.set(code, {
        clientId:      client_id,
        redirectUri:   redirect_uri,
        codeChallenge: code_challenge,
        
        id:       token.id!,
        username: token.name!,
        role:     token.role!,
        
        expiresAt: Date.now() + 5 * 60 * 1000,
    });

    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set('code', code);
    callbackUrl.searchParams.set('state', state);

    redirect(callbackUrl.toString());
}