import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import type { config, font } from './config';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const fontToCss = (font: font): string =>
    `${ font.style } ${ font.weight } ${ font.size } "${ font.family }", ${ font.fallback }`;

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
            ?   acc + `\t--${ curr.id }: ${ fontToCss(curr) };\n`
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

const deepCompare = (obj1: any, obj2: any) => {
    if (typeof obj1 !== 'object') return obj1 === obj2;

    for (const key in obj1)
        if (!deepCompare(obj1[ key ], obj2[ key ]))
            return false;
    
    return true;
};

type parser<T = any> = (value: string) => T;

class storage {
    static has = (key: string): boolean => localStorage.getItem(key) !== null;

    static get = (key: string): string | null => localStorage.getItem(key);
    static tryGet = (key: string, fallback: string): string =>
        this.get(key) || fallback;
    
    static parse = <T = any>(
        key: string,
        parser: parser<T> = (value: string) => JSON.parse(value)
    ): T => {
        const item = this.get(key);
        if (!item) throw new Error('Cannot parse null values');
        return parser(item);
    };
    
    static tryParse = <T = any>(
        key: string,
        fallback: T,
        parser?: parser<T>
    ): T => {
        try   { return this.parse<T>(key, parser); }
        catch { return fallback; };
    };

    static set = (key: string, value: any) =>
        localStorage.setItem(key, typeof value !== 'object' ? value.toString() : JSON.stringify(value))
};

class cookies {
    static get = (key: string): string | null => {
        let name = key + '=';
        let decodedCookie = decodeURIComponent(document.cookie);
        for (let pair of decodedCookie.split(';').map(v => v.trim()))
            if (pair.startsWith(name))
                return pair.substring(name.length);
        return null;
    }; 
    
    static set = (key: string, value: string, days?: number): void => {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        };
        document.cookie = key + '=' + encodeURIComponent(value) + expires + '; path=/';
    };

    static delete = (key: string): void => {
        document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    };
};

const awaitable = <T = unknown>(value: unknown): value is Promise<T> => {
  return value !== null &&
    value !== undefined &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function';
};

export { cssFromConfig, deepCompare, storage, cookies, awaitable };