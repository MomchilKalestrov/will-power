//@ts-check
const fs = require('node:fs');
const path = require('node:path');

const HOOK_REGEX = /(?:use|get)Translations\(['`"](.*?)['`"]\)/;
const T_REGEX = /\bt(?:\.rich)?\(['`"](.*?)['`"]/g;
const verbose = process.argv.includes('--verbose');
const paths = process.argv.find(arg => arg.startsWith('--paths='))?.split('=')[ 1 ].split(',') ?? [ '.' ]

/** @param { string } directoryName */
const getAllFiles = (directoryName) => {
    /** @type { string[] } */
    let files = [];

    /** @param { string } directory */
    (function traverse(directory) {
        fs.readdirSync(directory).forEach(file => {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) return traverse(absolute);
            else return files.push(absolute);
        });
    })(directoryName);

    return files;
};

const allFiles = paths.map(getAllFiles).flat();

/**
 * @param { string } str
 * @returns { string[] } 
 */
const identifyBlocks = (str) => {
    /** @type { string[] } */
    const blocks = [];

    let openedBracketTracker = 0;
    let start = 0;

    for (let i = 0; i < str.length; i++) {
        if (str[ i ] === '{') {
            if (openedBracketTracker === 0)
                start = i;
            openedBracketTracker++;
        } else if (str[ i ] === '}') {
            openedBracketTracker--;
            if (openedBracketTracker === 0)
                blocks.push(str.substring(start + 1, i)); // pad start, because we accidentally catch the bracket
        };
    };

    return blocks;
};

/**
 * @param { any } obj 
 * @returns { string[] }
 */
const toFlatKeys = (obj) => {
    /** @type { string[] } */
    const entries = [];

    Object.entries(obj).forEach(([ key, value ]) => {
        if (typeof value === 'string')
            entries.push(key);
        else
            toFlatKeys(value).forEach(v => entries.push(`${ key }.${ v }`));
    });

    return entries;
}

/** @type { Record<string, Set<string>> } */
const messages = getAllFiles('messages').reduce((acc, p) => ({
    ...acc,
    [ p ]: new Set(toFlatKeys(JSON.parse(fs.readFileSync(p).toString())))
}), /** @type { Record<string, Set<string>> } */({}));

const files = allFiles.reduce((acc, p) => {
    const file = fs.readFileSync(p).toString();
    
    identifyBlocks(file)
        .filter(block => block.includes('Translations('))
        .forEach(block => {
            const hook = HOOK_REGEX.exec(block);
            
            if (!hook) {
                console.warn('Detected use of `next-intl` using `Translations(`, but not `HOOK_REGEX`');
                //console.log('In block:\n', hook, block);
                return;
            };

            const [ , namespace ] = hook;
            acc[ p ] = new Set();
            for (const [ , call ] of block.matchAll(T_REGEX)) {
                if (call.length > 1)
                    acc[ p ].add(`${ namespace }.${ call }`);
            };
        });

    return acc;
}, /** @type { Record<string, Set<string>> } */({}));

/** @type { Record<string, Record<string, string[]>> } */
let errors = {};

Object.entries(messages).forEach(([ locale, value ]) => {
    Object.entries(files).forEach(([ file,  keys ]) => {
        keys.forEach(key => {
            verbose && console.log(`Checking ${ key } in file ${ file } against ${ locale }`);
            if (!value.has(key)) {
                errors[ locale ] ??= {};
                errors[ locale ][ file ] ??= [];
                errors[ locale ][ file ].push(key);
            };
        });
    });   
});

if (Object.entries(errors).length !== 0) {
    console.error('Errors found: ');
    Object.entries(errors).forEach(([ locale, files ]) => {
        console.error('  In ' + locale + ':');
        Object.entries(files).forEach(([ file, keys ]) => {
            console.error('    In ' + file + ':');
            keys.forEach(key => console.error('      Missing ' + key));
        });
    });
    process.exit(-1);
} else {
    console.log('No errors found!');
    process.exit(0);
}