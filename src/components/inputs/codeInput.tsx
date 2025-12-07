'use client';
import React from 'react';
import { Maximize, X } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const CodeInput: React.FC<Props> = ({ value, onChange }) => {
    const [ isExpanded, setExpanded ] = React.useState<boolean>(false);

    return (
        <Card className='py-0 overflow-hidden gap-0'>
            <CardHeader className='p-2 flex items-center'>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={ () => setExpanded(true) }
                ><Maximize /></Button>
            </CardHeader>
            <Separator />
            <CardContent className='px-0'>
                {
                    isExpanded
                    ?   <div className='h-64' />
                    :   <MonacoEditor
                            defaultValue={ value }
                            theme={
                                document.body.classList.contains('dark')
                                ?   'vs-dark'
                                :   'light'
                            }
                            onChange={ (text = '') => onChange(text) }
                            className='h-64'
                        />
                }
            </CardContent>
            {
                isExpanded &&
                <div className='fixed p-16 inset-0 z-49 w-dvw h-dvh bg-black/30 backdrop-blur-xs'>
                    <Card className='w-full h-full min-h-0 flex flex-col gap-0 py-0 overflow-hidden'>
                        <CardHeader className='flex justify-end items-center p-4'>
                            <Button
                                size='icon'
                                variant='outline'
                                onClick={ () => setExpanded(false) }
                            ><X /></Button>
                        </CardHeader>
                        <Separator />
                        <CardContent className='h-full px-0'>
                            <MonacoEditor
                                defaultValue={ value }
                                theme={
                                    document.body.classList.contains('dark')
                                    ?   'vs-dark'
                                    :   'light'
                                }
                                onChange={ (text = '') => onChange(text) }
                                className='h-full'
                            />
                        </CardContent>
                    </Card>
                </div>
            }
        </Card>
    );
};

export default CodeInput;