import { NextResponse } from 'next/server';

import info from '../oauthInfo';

export const GET = () =>
    NextResponse.json({
        ...info,

        subject_types_supported:               [ 'public' ],
        id_token_signing_alg_values_supported: [ 'HS256' ],
    }, {
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    });