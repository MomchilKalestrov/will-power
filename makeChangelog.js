// @ts-check
const { spawnSync } = require('node:child_process');

const DATE_TAG = process.argv[ process.argv.length -1 ];

/**
 * @param { string } cmd 
 * @param { string[] } params
 * @returns { string }
 */
const run = (cmd, params) =>
    spawnSync(cmd, params).stdout.toString().trim();

const lastTag = run('git', [ 'describe', '--tags', '--abbrev=0' ]);
const commits = run('git', [ 'log', `${ lastTag }..HEAD`, '--oneline' ])
    .split('\n')
    .filter(Boolean)
    .map(line => line.split(' ').slice(1).join(' '))
    .map(commit => {
        const matches = commit.match(/(\w+)(?:(?:\((.+)\))|): (.+)/s);
        if (!matches) return { type: 'Error', message: 'Commit with incorrect syntax: ' + commit };
        const [ _, type, scope, message ] = matches;

        return { type, scope, message };
    })
    .reduce((acc, { type, scope, message }) => {
        if (!acc[ type ]) acc[ type ] = [];
        acc[ type ].push(`${ message } ${ scope ? `(in ${ scope })` : '' }`);
        return acc;
    }, /** @type { Record<string, string[]> } */({}));

const changelog = Object
    .entries(commits)
    .reduce((acc, [ key, value ]) => {
        acc += `**${ key[ 0 ].toUpperCase() + key.substring(1) }:**\n`;
        for (const message of value)
            acc += `- ${ message }\n`;
        acc += '\n';
        return acc;
    }, `This is an automated release for tag ${ DATE_TAG }.\n\nThe changelog is as follows: \n\n`);

process.stdout.write(changelog);