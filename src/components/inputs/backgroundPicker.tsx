'use client';
import React from 'react';
import Image from 'next/image';
import { Image as ImageIcon, CirclePlus } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useFileSelector } from '@/contexts/file';

import CssKeywordInput from './cssKeywordInput';

const attachment = [ 'scroll', 'fixed', 'local' ];
const position = [
    'top left',    'top center',    'top right',
    'center left', 'center center', 'center right',
    'bottom left', 'bottom center', 'bottom right'
];
const size = [ 'contain', 'cover', 'auto' ];
const repeat = [ 'repeat', 'repeat-x', 'repeat-y', 'no repeat' ];

const propertiesValues: { [ key: string ]: string[] } = {
    repeat,
    attachment,
    position,
    size
};

type backgroundType = [
    string | undefined,
    string,
    string,
    string,
    string,
];

type Props = {
    value: string;
    selected?: boolean;
    onChange: (newValue: string) => void;
};

const BackgroundPicker: React.FC<Props> = ({
    value: initialBackground,
    selected = true,
    onChange: onChangeCallback
}) => {
    const { selectFile } = useFileSelector();
    const [ fileSelectorOpen, setFileSelectorOpen ] = React.useState<boolean>(false);
    const [ popoverOpen, setPopoverOpen ] = React.useState<boolean>(false);
    const [ [ url, ...properties ], setBackground ] = React.useState<backgroundType>([
        undefined,
        repeat[ 0 ],
        attachment[ 0 ],
        position[ 0 ],
        size[ 0 ],
    ]);

    React.useEffect(() => {
        if (!initialBackground.includes('url')) return;
        
        const backgroundParts = initialBackground.split(' ').filter(part => part !== '/');
        backgroundParts[ 3 ] = backgroundParts[ 3 ] + ' ' + backgroundParts[ 4 ];
        backgroundParts.splice(4, 1);
        setBackground(backgroundParts as backgroundType);
    }, []);

    const onChange = React.useCallback((newValue: string, index: number) => {
        const newState: backgroundType = [ url, ...properties ];
        newState[ index ] = newValue;
        setBackground(newState);
        onChangeCallback(newState.slice(undefined, -1).join(' ') + ' / ' + newState[ newState.length - 1 ]);
    }, [ properties ]);

    return (
        <Popover open={ popoverOpen || fileSelectorOpen } onOpenChange={ setPopoverOpen }>
            <PopoverTrigger asChild>
                <Button variant={ selected ? 'outline' : 'ghost' } size='icon'>
                    <ImageIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid gap-2 z-48'>
                <button
                    className='rounded-sm overflow-hidden'
                    onClick={ () => {
                        setFileSelectorOpen(true);
                        selectFile('single', 'image')
                            .then(([ value ]) => {
                                onChange(`url("${ value.url }")`, 0);
                                setFileSelectorOpen(false);
                                setPopoverOpen(true);
                            })
                            .catch(() => {
                                setFileSelectorOpen(false);
                                setPopoverOpen(true);
                            });
                    } }
                >
                    {
                        url
                        ?   <Image
                                src={ url.split('"')[ 1 ] }
                                alt='background image'
                                width={ 256 }
                                height={ 128 }
                                className='aspect-2/1 w-full'
                            />
                        :   <div className='aspect-2/1 w-full bg-stone-100 dark:bg-zinc-800 flex justify-center content-center'>
                                <CirclePlus />
                            </div>
                    }
                </button>
                <div className='grid grid-cols-2 gap-2'>
                    { Object.entries(propertiesValues).map(([ key, value ], index) => (
                        <React.Fragment key={ key }>
                            <Label htmlFor={ 'input-bg-' + key } className='capitalize w-32'>{ key }</Label>
                            <div className='grow'>
                                <CssKeywordInput
                                    value={ properties[ index ]! }
                                    options={ value }
                                    id={ 'input-bg-' + key }
                                    onChange={ (newValue: string) => onChange(newValue, index + 1) }
                                />
                            </div>
                        </React.Fragment>
                    )) }
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default BackgroundPicker;