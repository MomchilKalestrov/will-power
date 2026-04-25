declare global {
    var config: config | undefined;
    
    type font = {
        family: string;
        style: 'normal' | 'italic';
        size: string;
        weight: 'normal' | 'bold' | 'lighter' | 'bolder';
        fallback: 'serif' | 'sans-serif' | 'monospace' | 'cursive';
    };

    type fontVariable = {
        type: 'font';
        id: string;
        name: string;
    } & font;

    type colorVariable = {
        type: 'color';
        id: string;
        name: string;
        color: `#${ string }`;
    };
    
    type variable = fontVariable | colorVariable;
    
    type plugin = {
        name: string;
        version: string;
        enabled: boolean;
    };
    
    type config = {
        theme: string;
        fonts: ({ family: string, url: string })[];
        variables: variable[];
        lastEdited: timestamp;
        plugins: plugin[];
        themes: string[];
    };
};

export {};