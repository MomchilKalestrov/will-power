'use client';
import React from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NextPage } from 'next';
import Markdown from 'react-markdown';
import MonacoEditor from '@monaco-editor/react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';

import { useDialog } from '@/contexts/dialog';
import { usePlugins } from '@/contexts/plugins';

import { getPlugin } from '@/lib/actions';

type plugin = (Awaited<ReturnType<typeof getPlugin>> & { success: true; })[ 'value' ];

const getLanguage = (lang: string): string => ({
    ts: 'typescript',
    js: 'javascript'
})[ lang ] || lang;

const countNewlines = (str: string): number => {
    let counter = 0;

    for (const letter of str) 
        if (letter === '\n') counter++;

    return counter;
};

const Page: NextPage<PageProps<'/admin/plugins/marketplace/plugin/[name]'>> = ({ params }) => {
    const { name } = React.use(params);
    const { showDialog } = useDialog();
    const { addPlugin } = usePlugins();
    const [ plugin, setPlugin ] = React.useState<plugin>();

    React.useEffect(() => {
        getPlugin(decodeURIComponent(name)).then(response =>
            !response.success
            ?   toast('Failed to load the plugin: ' + response.reason)
            :   setPlugin(response.value)
        );
    }, [ name ]);

    const installPlugin = React.useCallback((url: string) => {
        fetch(url)
            .then(async response => {
                const blob = await response.blob();
                const toastText = await addPlugin(blob);
                toast(toastText);
            })
            .catch(() => toast('Failed to install the plugin.'));
    }, []);

    const onInstallRequest = React.useCallback(() => {
        if (!plugin) return;

        showDialog(
            'Confirm',
            `Are you sure you want to install "${ plugin.name }"?`,
            [
                { text: 'No', variant: 'default' },
                { text: 'Yes', variant: 'outline' }
            ]
        )
            .then(value => value === 'Yes' && installPlugin(plugin.downloadUrl))
            .catch(() => null);
    }, [ plugin ]);
        

    if (plugin === undefined)
        return (
            <div className='h-[calc(100dvh-var(--spacing)*16)] p-8 box-border flex justify-center items-center'>
                <Spinner className='size-9 opacity-50' />
            </div>
        );

    return (
        <div className='p-8 box-border'>
            <header className='grid grid-cols-[auto_1fr_auto] gap-2'>
                <img src={ plugin.iconUrl } alt={ `${ plugin.name } icon` } className='size-20 row-span-full' />
                <div className='flex flex-col justify-center'>
                    <h3 className='font-bold text-2xl'>{ plugin.name }</h3>
                    <p className='flex items-center gap-2'>
                        Author: 
                        <Link className='underline' href={ `/admin/plugins/marketplace/author/${ encodeURIComponent(plugin.author) }` }>
                            { plugin.author }
                        </Link>
                    </p>
                    <p className='opacity-50 text-sm'>v{ plugin.version }</p>
                </div>
                <Button size='lg' onClick={ onInstallRequest }>Install</Button>
            </header>
            <Separator className='my-4' />
            <div className='[&_h1,h2,h3,h4,h5,h6]:font-bold [&_h1,h2,h3,h4,h5,h6]:my-2 [&_h1]:text-3xl [&_h1]:mb-2 [&_h1,h2]:pb-2 [&_h1,h2]:border-b [&_h2]:text-2xl [&_h3]:text-xl [&_h4]:text-lg [&_h5]:text-md [&_h6]:text-sm'>
                <Markdown
                    skipHtml={ true }
                    children={ plugin.description }
                    components={ {
                        code: ({ children = '', className }) => {
                            const [ text, match ] = typeof children === 'object'
                            ?   [ JSON.stringify(children, null, '    '), 'json' ]
                            :   [ children.toString(), /language-(\w+)/.exec(className || '') ];

                            const language = match !== null && (match?.length ?? 0) >= 2 ? match[ 1 ] : '';
                            const lines = countNewlines(text);

                            return (
                                <div
                                    style={ { '--lines': Math.min(lines, 10) } as React.CSSProperties }
                                    className='w-full max-w-2xl h-[calc(var(--lines)*19px+2px)] p-2 border box-content'
                                >
                                    <MonacoEditor
                                        options={ {
                                            readOnly: true,
                                            scrollbar: {
                                                vertical: lines > 10 ? 'visible' : 'hidden',
                                                horizontal: 'hidden',
                                                handleMouseWheel: lines > 10
                                            },
                                            minimap: {
                                                enabled: false
                                            },
                                            overviewRulerLanes: 0,
                                            overviewRulerBorder: false,
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'off'
                                        } }
                                        value={ String(children) }
                                        language={ getLanguage(language) }
                                        theme={
                                            document.body.classList.contains('dark')
                                            ?   'vs-dark'
                                            :   'light'
                                        }
                                    />
                                </div>
                            );
                        }
                    } }
                />
            </div>
        </div>
    );
};

export default Page;
