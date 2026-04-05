// @ts-check
const { spawnSync } = require('node:child_process');

/**
 * 
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
        const type = commit.split(': ')[ 0 ].split('(')[ 0 ];
        const message = commit.split(': ').slice(1).join(': ');
        return { type, message };
    })
    .reduce((acc, { type, message }) => {
        if (!acc[ type ]) acc[ type ] = [];
        acc[ type ].push(message);
        return acc;
    }, /** @type { Record<String, string[]> } */({}));

const changelog = Object
    .entries(commits)
    .reduce((acc, [ key, value ]) => {
        acc += `**${ key[ 0 ].toUpperCase() + key.substring(1) }:**\n`;
        for (const message of value)
            acc += `- ${ message }\n`;
        acc += '\n';
        return acc;
    }, 'The changelog is as follows: \n\n');

process.stdout.write(changelog);