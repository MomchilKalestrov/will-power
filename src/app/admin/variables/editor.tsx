'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { useConfig } from '@/contexts/config';

import FontEditor from './editors/font';
import ColorEditor from './editors/color';
import FontfaceEditor from './editors/fontface';

import FontPreview from './previews/font';
import ColorPreview from './previews/color';

type Props = {
    initialConfig: config;
};

const Editor: React.FC<Props> = ({ initialConfig }) => {
    const { updateConfig } = useConfig();
    const [ config, setConfig ] = React.useState<config>(initialConfig);
    const [ saveState, setSaveState ] = React.useState<boolean>(true);
    const [ mounted, setMounted ] = React.useState<boolean>(false);

    React.useEffect(() => void setMounted(true), []);

    const editorParams = {
        config,
        setConfig: (e: React.SetStateAction<config>) => {
            setSaveState(false);
            setConfig(e);
        }
    };

    return (
        <>
            {
                mounted &&
                ReactDOM.createPortal(
                    <div className='flex gap-2'>
                        <Button variant='outline' size='icon' onClick={ () => setConfig(initialConfig) }>
                            <RotateCcw />
                        </Button>
                        <Button
                            disabled={ saveState }
                            onClick={ () => {
                                setSaveState(true);
                                const copy: Partial<config> = { ...config };
                                delete copy.plugins;
                                delete copy.themes;
                                updateConfig(copy);
                            } }
                        >Save</Button>
                    </div>,
                    document.getElementById('variables-button-portal')!
                )
            }
            <main className='p-8 overflow-y-scroll bg-background h-[calc(100dvh-var(--spacing)*16)]'>
                <div className='grid grid-cols-[384px_1fr] gap-4'>
                    <ColorEditor { ...editorParams } />
                    <ColorPreview config={ config } />
                    <Separator className='col-span-full' />
                    <div>
                        <FontfaceEditor { ...editorParams } />
                        <Separator className='my-4' />
                        <FontEditor { ...editorParams } />
                    </div>
                    <FontPreview config={ config } />
                </div>
            </main>
        </>
    );
};

export default Editor;