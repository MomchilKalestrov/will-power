import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';
import type { config } from '@/lib/config';

const cssFromConfig = (config: config): string =>
    ':root {\n' +
        config.variables.reduce<string>((acc: string, curr: config[ 'variables' ][ number ]) =>
            curr.type === 'font'
            ?   acc + `\t--${ curr.id }: ${ curr.size } ${ curr.style } ${ curr.weight } "${ curr.family }";\n`
            :   acc + `\t--${ curr.id }: ${ curr.color }\n`
        , '') +
    '}\n' +
    '\n' +
    '\n' +
    config.fonts.reduce<string>((acc: string, { family, url }: config[ 'fonts' ][ number ]) =>
        acc +
        '@font-face {\n' +
            `\tfont-family: ${ family }` +
            `\tsrc: url("${ url }")` +
        '}\n'
    , '');

const GET = async () =>
    new NextResponse(cssFromConfig(await getConfig()), {
        headers: {
            'Content-Type': 'text/css',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
    });

export { GET };