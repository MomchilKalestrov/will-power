
'use client';
import React from 'react';
import { Bold, Italic, Redo, Strikethrough, Undo } from 'lucide-react';
import {
    EditorState,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    TextFormatType,
    LexicalEditor,
    $getRoot
} from 'lexical';

import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { type InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const formatting: ({
    type: TextFormatType,
    icon: React.JSX.Element
})[] = [
    { type: 'bold', icon: <Bold /> },
    { type: 'italic', icon: <Italic /> },
    //{ type: 'underline', icon: <Underline /> },
    { type: 'strikethrough', icon: <Strikethrough /> }
];

type Props = {
    id?: string | undefined;
    value?: string | undefined;
    onChange?: (value: string) => void;
};

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
            )
    };
    
    const handleChange = React.useCallback((state: EditorState, editor: LexicalEditor) => {
        editor.update(() => {
            onChange?.(
                $generateHtmlFromNodes(editor, null)
                    .replace(/<\s*\/?\s*(?:p|span|b|i|u)\b[^>]*>/gi, '')
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
                    <OnChangePlugin onChange={ handleChange } />
                </div>
            </div>
        </LexicalComposer>
    );
};

export default AdvancedTextarea;