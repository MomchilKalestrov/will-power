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

const cssFromConfig = (config: config): string =>
    ':root {\n' +
        config.variables.reduce<string>((acc: string, curr: config[ 'variables' ][ number ]) =>
            curr.type === 'font'
            ?   acc + `\t--${ curr.id }: ${ fontToCss(curr) };\n`
            :   acc + `\t--${ curr.id }: ${ curr.color };\n`
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

const hasAuthority = (current: User[ 'role' ], minimum: User[ 'role' ], roleOffset: number = 1): boolean => {
    const roleArray: User[ 'role' ][] = [ 'editor', 'admin', 'owner' ];
    return roleArray.indexOf(current) >= roleArray.indexOf(minimum) + roleOffset;
};

const validName = (name: string): boolean =>
    /^[A-Za-z_]+$/.test(name);

const validPassword = (password: string): boolean => {
    if (password.length < 8) return false;

    const letterMatches = password.match(/[A-Za-z]/g) || [];
    if (letterMatches.length < 2) return false;

    const specialMatches = password.match(/[^A-Za-z0-9]/g) || [];
    if (specialMatches.length < 1) return false;

    return true;
};

export { cssFromConfig, storage, cookies, awaitable, hasAuthority, validPassword, validName };