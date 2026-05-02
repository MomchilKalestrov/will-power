import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

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

export const cssFromConfig = (config: config): string =>
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

export class storage {
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
        localStorage.setItem(key, typeof value !== 'object' ? value.toString() : JSON.stringify(value));

    static del = (key: string) =>
        localStorage.removeItem(key);
};

export class cookies {
    static get = (key: string): string | null => {
        const name = key + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        for (const pair of decodedCookie.split(';').map(v => v.trim()))
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

export const awaitable = <T = unknown>(value: unknown): value is Promise<T> => {
  return value !== null &&
    value !== undefined &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function';
};

export const hasAuthority = (current: User[ 'role' ], minimum: User[ 'role' ], roleOffset: number = 1): boolean => {
    const roleArray: User[ 'role' ][] = [ 'editor', 'admin', 'owner' ];
    return roleArray.indexOf(current) >= roleArray.indexOf(minimum) + roleOffset;
};

export const validName = (name: string): boolean =>
    /^[A-Za-z_]+$/.test(name);

export const validPassword = (password: string): boolean => {
    if (password.length < 8) return false;

    const letterMatches = password.match(/[A-Za-z]/g) || [];
    if (letterMatches.length < 2) return false;

    const specialMatches = password.match(/[^A-Za-z0-9]/g) || [];
    if (specialMatches.length < 1) return false;

    return true;
};

export const isPanelPropertyVisible = (
    node: ComponentNode,
    metadata: NodeMetadata,
    condition: editorVisibilityCondition | undefined,
    key: 'props' | 'styles' | 'attributes'
): boolean => {
    type genericMeta = Record<string, prop | style | attribute>;
    if (!condition) return true;
    const nodeAccessor: string = ({ props: 'props', styles: 'style', attributes: 'attributes' })[ key ];

    const value = node[ nodeAccessor ]?.[ condition.key ] ?? (metadata[ key ] as genericMeta)[ condition.key ].default;
    let result = value == condition.value;
    if (condition.comparison === 'different')
        result = !result;

    if ('or' in condition)
        result = result || isPanelPropertyVisible(node, metadata, condition.or, key);
    else if ('and' in condition)
        result = result && isPanelPropertyVisible(node, metadata, condition.and, key);

    return result;
};

export const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> =>
    Object.fromEntries(
        Object.entries(obj).filter(([ k ]) => !keys.includes(k as any))
    ) as Omit<T, K>;

export const resolveToPositionalArgs = <T extends object, K extends keyof T>(obj: T, ...order: K[]): T[ K ][] =>
    order.map(key => obj[ key ]);