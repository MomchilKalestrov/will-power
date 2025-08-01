import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { config, font } from './config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fontToCss = (font: font): string =>
    `${ font.style } ${ font.weight } ${ font.size } "${ font.family }", ${ font.fallback }`

export const cssToFont = (css: string): font => {
    const regex = /^(normal|italic)\s+(normal|bold|lighter|bolder)\s+([\d.]+[a-z]+(?:\/[^"]+)?)\s+"([^"]+)",\s+(.*)$/;
    const match = css.match(regex);

    if (!match)
        throw new Error('Invalid CSS font string format');

    const [ , style, weight, size, family, fallback ] = match;

    return { style, weight, size, family, fallback } as font;
};

export const hexToHsl = (hex: `#${string}`): [ number, number, number ] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [ h * 360, s * 100, l * 100 ];
};

export const hslToHex = (h: number, s: number, l: number): `#${string}` => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    const toHex = (c: number) => {
        const hex = Math.round((c + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${ toHex(r) }${ toHex(g) }${ toHex(b) }`;
};

const cssFromConfig = (config: config): string =>
    ':root {\n' +
        config.variables.reduce<string>((acc: string, curr: config[ 'variables' ][ number ]) =>
            curr.type === 'font'
            ?   acc + `\t--${ curr.name }: ${ fontToCss(curr) };\n`
            :   acc + `\t--${ curr.name }: ${ curr.color };\n`
        , '') +
    '}\n' +
    '\n' +
    '\n' +
    config.fonts.reduce<string>((acc: string, { family, url }: config[ 'fonts' ][ number ]) =>
        acc +
        '@font-face {\n' +
            `\tfont-family: ${ family }` +
            `\tsrc: url('${ url }')` +
        '}\n'
    , '');

export { cssFromConfig };