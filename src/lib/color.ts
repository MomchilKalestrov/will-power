const toHex = (c: number) =>
    Math.round(c * 255).toString(16).padStart(2, '0');

export const hexToHsl = (hex: string): [ number, number, number ] => {
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

export const hslToHex = (h: number, s: number, l: number): string => {
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

    return `#${ toHex(r + m) }${ toHex(g + m) }${ toHex(b + m) }`;
};

export const hexToHsv = (hex: string): [ number, number, number ] => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);

    const hh = delta
        ? max === r
            ? (g - b) / delta
            : max === g
                ? 2 + (b - r) / delta
                : 4 + (r - g) / delta
        : 0;

    return [
        Math.round(60 * (hh < 0 ? hh + 6 : hh)),
        Math.round(max ? (delta / max) * 100 : 0),
        Math.round((max / 255) * 100),
    ];
};

export const hsvToHex = (h: number, s: number, v: number): string => {
    const hh = Math.floor(h),
        b = v * (1 - s),
        c = v * (1 - (h - hh) * s),
        d = v * (1 - (1 - h + hh) * s),
        module = hh % 6;

    const 
        red = [ v, c, b, b, d, v ][ module ],
        green = [ d, v, v, c, b, b ][ module ],
        blue = [ b, b, d, v, v, c ][ module ];

    return `#${ toHex(red) }${ toHex(green) }${ toHex(blue) }`;
};