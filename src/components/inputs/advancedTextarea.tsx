
'use client';
import {
    $getRoot,
    EditorState,
    UNDO_COMMAND,
    REDO_COMMAND,
    LexicalEditor,
    $getSelection,
    TextFormatType,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND
} from 'lexical';
import {
    List,
    Plus,
    Undo,
    Redo,
    Bold,
    Italic,
    LinkIcon,
    Underline,
    Strikethrough
} from 'lucide-react';
import React from 'react';

import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { getAllComponents } from '@/lib/db/actions';

const formatting: ({
    type: TextFormatType,
    icon: React.JSX.Element
})[] = [
    { type: 'bold', icon: <Bold /> },
    { type: 'italic', icon: <Italic /> },
    { type: 'underline', icon: <Underline /> },
    { type: 'strikethrough', icon: <Strikethrough /> }
];

type Props = {
    id?: string | undefined;
    value?: string | undefined;
    onChange?: (value: string) => void;
};

const PageList: React.FC<{
    onChoosePage: (page: string) => void;
}> = ({ onChoosePage }) => {
    const [ pages, setPages ] = React.useState<string[] | null>(null);
    const [ popoverOpen, setPopoverOpen ] = React.useState<boolean>(false);

    React.useEffect(() => {
        getAllComponents('page').then(response =>
            response.success && setPages(response.value)
        );
    }, []);

    if (!pages) return;

    return (
        <Popover open={ popoverOpen } onOpenChange={ setPopoverOpen }>
            <PopoverTrigger asChild>
                <Button variant='outline' size='icon'>
                    <List />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid gap-2 max-w-48 p-2'>
                { pages.map(page =>
                    <Button
                        key={ page }
                        value={ page }
                        variant='ghost'
                        onClick={ () => {
                            onChoosePage(page);
                            setPopoverOpen(false);
                        } }
                    >{ page }</Button>
                ) }
            </PopoverContent>
        </Popover>
    );  
};

const Link: React.FC = () => {
    const [ editor ] = useLexicalComposerContext();
    const [ popoverOpen, setPopoverOpen ] = React.useState<boolean>(false);
    const [ link, setLink ] = React.useState<string>('');

    const onAddLink = React.useCallback(() => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
        setPopoverOpen(false);
    }, [ link, editor ]);

    const onPopoverOpenChange = React.useCallback((state: boolean) => {
        if (!state) return setPopoverOpen(state);

        editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return setPopoverOpen(state);

            const anchorNode = selection.anchor.getNode();
            const linkNode =
                $isLinkNode(anchorNode)
                ? anchorNode
                : anchorNode.getParents().find($isLinkNode);

            if (linkNode) {
                linkNode.select();
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
            } else
                setPopoverOpen(state);
        });
    }, [ editor ]);

    return (
        <Popover open={ popoverOpen } onOpenChange={ onPopoverOpenChange }>
            <PopoverTrigger asChild>
                <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-none'
                ><LinkIcon /></Button>
            </PopoverTrigger>
            <PopoverContent className='grid grid-cols-[auto_1fr_auto] gap-2'>
                <PageList onChoosePage={ page => setLink('/' + page) } />
                <Input
                    value={ link }
                    onChange={ ({ currentTarget: { value } }) => setLink(value) }
                />
                <Button
                    variant='outline'
                    size='icon'
                    onClick={ onAddLink }
                ><Plus /></Button>
            </PopoverContent>
        </Popover>
    );
}

const Toolbar: React.FC = () => {
    const [ editor ] = useLexicalComposerContext();

    const handleChange = React.useCallback((formatting: TextFormatType) =>
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatting)
    , [ editor ]);

    return (
        <div className='flex justify-between'>
            <div className='flex'>
                { formatting.map(({ type, icon }) => (
                    <Button
                        key={ type }
                        variant='ghost'
                        size='icon'
                        className='rounded-none'
                        onClick={ () => handleChange(type) }
                    >{ icon }</Button>
                )) }
                <Link />
            </div>
            <div className='flex'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-none'
                    onClick={ () => editor.dispatchCommand(UNDO_COMMAND, undefined)
                    }
                ><Undo /></Button>
                <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-none'
                    onClick={ () => editor.dispatchCommand(REDO_COMMAND, undefined)
                    }
                ><Redo /></Button>
            </div>
        </div>
    );
}

const AdvancedTextarea: React.FC<Props> = ({ id, value, onChange }) => {
    const namespace = React.useMemo(() => id || ('area-' + crypto.randomUUID()), [ id ]);

    const initialConfig: InitialConfigType = {
        namespace,
        onError: (error: Error) => {
            throw error;
        },
        editorState: (editor: LexicalEditor) =>
            editor.update(() =>
                $getRoot()
                    .clear()
                    .append(
                        ...$generateNodesFromDOM(
                            editor,
                            new DOMParser()
                                .parseFromString(
                                    `<p>${ value }</p>`,
                                    'text/html'
                                )
                        )
                    )
            ),
        nodes: [
            LinkNode
        ],
        theme: {
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through'
            },
            link: 'text-[rgb(0,0,238)] underline'
        }
    };
    
    const handleChange = React.useCallback((_: EditorState, editor: LexicalEditor) => {
        editor.update(() => {
            onChange?.(
                $generateHtmlFromNodes(editor, null)
                    .replace(/<\s*\/?\s*(?:p|span|b|i)\b[^>]*>/gi, '')
            )
        });
    }, [ onChange ]);

    return (
        <LexicalComposer initialConfig={ initialConfig }>
            <div className='border-input dark:bg-input/30 grid field-sizing-content min-h-16 w-full rounded-md border bg-transparent text-base shadow-xs outline-none md:text-sm'>
                <Toolbar />
                <Separator />
                <div className='p-2 min-h-24 cursor-text'>
                    <RichTextPlugin
                        ErrorBoundary={ () => <p>Unable to load the editor</p> }
                        contentEditable={ <ContentEditable className='outline-none' /> }
                    />
                    <HistoryPlugin />
                    <LinkPlugin validateUrl={ (url) => url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://') } />
                    <OnChangePlugin onChange={ handleChange } />
                </div>
            </div>
        </LexicalComposer>
    );
};

export default AdvancedTextarea;