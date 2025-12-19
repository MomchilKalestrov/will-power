'use client';
import React from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import FontInput from '@/components/inputs/fontInput';
import ColorPicker from '@/components/inputs/colorPicker';
import CssUnitInput from '@/components/inputs/cssUnitInput';
import CssKeywordInput from '@/components/inputs/cssKeywordInput';

import { useConfig } from '@/contexts/config';
import { useFileSelector } from '@/contexts/file';

import { hexToHsl, hslToHex } from '@/lib/color';
import { cssToFont, fontToCss } from '@/lib/utils';

type Props = {
    initialConfig: config;
};

type EditorProps = {
    config: config;
    setConfig: React.Dispatch<React.SetStateAction<config>>;
};

const Editor: React.FC<Props> = ({ initialConfig }) => {
    const { updateConfig } = useConfig();
    const [ config, setConfig ] = React.useState<config>(initialConfig);
    const [ saveState, setSaveState ] = React.useState<boolean>(true);

    const editorParams = {
        config,
        setConfig: (e: React.SetStateAction<config>) => {
            setSaveState(false);
            setConfig(e);
        }
    };

    return (
        <>
            <header className='h-16 px-4 border-b bg-background flex justify-end items-center gap-4'>
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
                        updateConfig?.(copy);
                    } }
                >Save</Button>
            </header>
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

const ColorEditor: React.FC<EditorProps> = ({ config, setConfig }) => {
    const [ newColor, setNewColor ] = React.useState({ name: '', color: '#000000' });

    const handleAddColor = () => {
        if (!newColor.name || !newColor.color) return;
        setConfig(prev => ({
            ...prev,
            variables: [
                ...prev.variables,
                {
                    id: crypto.randomUUID(),
                    type: 'color',
                    name: newColor.name,
                    color: newColor.color as `#${ string }`
                }
            ]
        }));
        setNewColor({ name: '', color: '#000000' });
    };

    const handleRemoveColor = (id: string) => {
        setConfig(prev => ({
            ...prev,
            variables: prev.variables.filter(v => v.id !== id)
        }));
    };

    const handleColorChange = (id: string, field: 'name' | 'color', value: string) => {
        setConfig(prev => ({
            ...prev,
            variables: prev.variables.map(v =>
                v.id === id && v.type === 'color' ? { ...v, [ field ]: value } : v
            )
        }));
    };

    const colorVariables = config.variables.filter(v => v.type === 'color');

    return (
        <section className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold h-min'>Colors</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant='outline' size='icon'><Plus /></Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='grid grid-cols-[1fr_auto] items-end gap-2 p-4 border rounded-md border-dashed'>
                        <Input
                            placeholder='e.g., primary'
                            value={ newColor.name }
                            onChange={({ target: { value: name } }) => setNewColor({ ...newColor, name })}
                        />
                        <ColorPicker
                            value={ newColor.color }
                            selected={ true }
                            onChange={ (color) => setNewColor({ ...newColor, color }) }
                        />
                        <Button
                            variant='outline'
                            className='col-span-full'
                            onClick={ handleAddColor }
                        >Add</Button>
                    </PopoverContent>
                </Popover>
            </div>
            { colorVariables.map(({ id, name, color }) => (
                <div key={ id } className='flex items-center gap-2 rounded-md'>
                    <Input
                        className='flex-1'
                        defaultValue={ name }
                        onChange={ ({ target: { value } }) => handleColorChange(id, 'name', value) }
                    />
                    <ColorPicker
                        value={ color }
                        selected={ true }
                        onChange={ (value) => handleColorChange(id, 'color', value) }
                        preview={ true }
                    />
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={ () => handleRemoveColor(id) }
                    >
                        <Trash2 />
                    </Button>
                </div>
            )) }
        </section>
    );
};

const FontfaceEditor: React.FC<EditorProps> = ({ config, setConfig }) => {
    const { selectFile } = useFileSelector();
    const [ newFont, setNewFont ] = React.useState({ family: '', url: '' });
    const [ fileSelectorOpen, setFileSelectorOpen ] = React.useState<boolean>(false);
    const [ popoverOpen, setPopoverOpen ] = React.useState<boolean>(false);

    const handleAddFont = () => {
        if (!newFont.family || !newFont.url) return;
        setConfig(prev => ({ ...prev, fonts: [ ...prev.fonts, newFont ] }));
        setNewFont({ family: '', url: '' });
    };

    const handleRemoveFont = (index: number) =>
        setConfig(prev => ({ ...prev, fonts: prev.fonts.filter((_, i) => i !== index) }));

    const onSelectFile = React.useCallback(() => {
        selectFile('single', 'font')
            .then(([ { pathname } ]) => {
                setNewFont(state => ({ ...state, url: pathname }));
                setFileSelectorOpen(false);
                setPopoverOpen(true);
            })
            .catch(() => {
                setFileSelectorOpen(false);
                setPopoverOpen(true);
            });
    }, []);

    return (
        <section className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold h-min'>Font Families</h2>
                <Popover open={ popoverOpen || fileSelectorOpen } onOpenChange={ setPopoverOpen }>
                    <PopoverTrigger asChild>
                        <Button variant='outline' size='icon'><Plus /></Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='grid grid-cols-[auto_1fr] gap-2 gap-x-4 p-4 z-48'>
                        <Label htmlFor='input-fontface-family'>Family</Label>
                        <Input
                            id='input-fontface-family'
                            placeholder='e.g., Inter'
                            defaultValue={ newFont.family }
                            onChange={ ({ target: { value: family } }) => setNewFont({ ...newFont, family }) }
                        />
                        <Label htmlFor='input-fontface-url'>URL</Label>
                        <div className='flex gap-2'>
                            <Input
                                id='input-fontface-url'
                                placeholder='/fonts/inter.woff2'
                                defaultValue={ newFont.url }
                                onChange={ ({ target: { value: url } }) => setNewFont({ ...newFont, url }) }
                            />
                            <Button
                                variant='outline'
                                size='icon'
                                onClick={ onSelectFile }
                            ><Plus /></Button>
                        </div>
                        <Button
                            variant='outline'
                            className='col-span-full'
                            onClick={ handleAddFont }
                        >Add</Button>
                    </PopoverContent>
                </Popover>
            </div>
            { config.fonts.map((font, index) => (
                <div key={ font.family } className='flex items-center'>
                    <div className='flex-1 space-y-1'>
                        <p className='text-sm font-medium'>{ font.family }</p>
                        <p className='text-xs text-muted-foreground truncate'>{ font.url }</p>
                    </div>
                    <Button variant='outline' size='icon' onClick={() => handleRemoveFont(index)}>
                        <Trash2 />
                    </Button>
                </div>
            )) }
        </section>
    );
};

const FontEditor: React.FC<EditorProps> = ({ config, setConfig }) => {
    const [ name, setName ] = React.useState<string>('');
    const [ newFont, setNewFont ] = React.useState<font>({
        family: 'Times New Roman',
        style: 'normal',
        size: '1rem',
        weight: 'normal',
        fallback: 'sans-serif'
    });
    const typefaces = React.useMemo(() => 
        config
        .fonts
            .map(({ family }) => family)
            .concat([
                'Arial',
                'Verdana',
                'Tahoma',
                'Trebuchet MS',
                'Times New Roman',
                'Georgia',
                'Garamond',
                'Courier New',
                'Brush Script MT'
            ])
    , [ config.fonts ]);
    const fontVariables: fontVariable[] = config.variables.filter(({ type }) => type === 'font') as fontVariable[];

    const handleFontChange = (id: string, changes: Partial<fontVariable>) =>
        setConfig(prev => ({
            ...prev,
            variables: prev.variables.map(v => 
                v.id === id ? { ...v, ...changes as any } : v
            )
        }));

    const handleRemoveFont = (index: number) =>
        setConfig((prev) => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index)
        }));

    const handleAddFont = () =>
        name.length > 3 &&
        setConfig((prev) => ({
            ...prev,
            variables: [
                ...prev.variables,
                {
                    type: 'font',
                    name,
                    id: crypto.randomUUID(),
                    ...newFont
                }
            ]
        }));

    return (
        <section className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h2 className='text-xl font-bold h-min'>Font Styles</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant='outline' size='icon'><Plus /></Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='grid grid-cols-[auto_1fr] gap-2 gap-x-4 p-4'>
                        <Label htmlFor='input-font-name'>Name</Label>
                        <Input
                            defaultValue={ name }
                            onChange={ ({ target: { value } }) => setName(value) }
                        />
                        <Label htmlFor='input-font-family'>Family</Label>
                        <Select onValueChange={ (family) => setNewFont({ ...newFont, family }) }>
                            <SelectTrigger id='input-font-family' className='w-full' value={ newFont.family }>
                                { newFont.family }
                            </SelectTrigger>
                            <SelectContent>
                                { typefaces.map((typeface) => (
                                    <SelectItem style={ { fontFamily: typeface } } key={ typeface } value={ typeface }>
                                        { typeface }
                                    </SelectItem>
                                )) }
                            </SelectContent>
                        </Select>
                        <Label htmlFor='input-font-style'>Style</Label>
                        <CssKeywordInput
                            id='input-font-style'
                            value={ newFont.style }
                            options={ [ 'normal', 'italic' ] }
                            onChange={ (style) => setNewFont({ ...newFont, style: style as 'normal' | 'italic' }) }
                            />
                        <Label>Size</Label>
                        <CssUnitInput
                            value={ newFont.size }
                            units={ [ 'rem', 'em', 'px' ] }
                            onChange={ (size) => setNewFont({ ...newFont, size }) }
                            allowCustom={ false }
                            />
                        <Label htmlFor='input-font-weight'>Weight</Label>
                        <CssKeywordInput
                            id='input-font-weight'
                            value={ newFont.weight }
                            options={ [ 'normal', 'bold', 'lighter', 'bolder' ] }
                            onChange={ (weight) => setNewFont({ ...newFont, weight: weight as 'normal' | 'bold' | 'lighter' | 'bolder' }) }
                            />
                        <Label htmlFor='input-font-fallback'>Fallback</Label>
                        <CssKeywordInput
                            id='input-font-fallback'
                            value={ newFont.fallback }
                            options={ [ 'serif', 'sans-serif', 'monospace', 'cursive' ] }
                            onChange={ (fallback) => setNewFont({ ...newFont, fallback: fallback as 'serif' | 'sans-serif' | 'monospace' | 'cursive' }) }
                            />
                        <Button
                            variant='outline'
                            className='col-span-full'
                            onClick={ handleAddFont }
                            >Add</Button>
                    </PopoverContent>
                </Popover>
            </div>
            { fontVariables.map((font, index) => (
                <div key={ font.id } className='flex items-center gap-2'>
                    <Input
                        defaultValue={ font.name }
                        className='text-sm font-medium grow'
                        onChange={ ({ target: { value: name } }) => handleFontChange(font.id, { name }) }
                        />
                    <FontInput
                        value={ font }
                        noVars={ true }
                        onChange={ (changes) => handleFontChange(font.id, cssToFont(changes)) }
                    />
                    <Button variant='outline' size='icon' onClick={() => handleRemoveFont(index)}>
                        <Trash2 />
                    </Button>
                </div>
            )) }
        </section>
    );
};

const ColorPreview: React.FC<{ config: config }> = ({ config }) => {
    const colorVariables = config.variables.filter(v => v.type === 'color');
    return (
        <div className='flex flex-wrap gap-4'>
            { colorVariables.map(({ id, color, name }) => {
                const [ h, s, l ] = hexToHsl(color);
                const foregroundHex = hslToHex(h, s / 2, l > 50 ? 20 : 80);

                return(
                    <div key={ id } className='basis-32 grow max-w-64 text-center'>
                        <Card
                            className='w-full aspect-video flex justify-end items-start p-4 gap-2'
                            style={ { backgroundColor: color, color: foregroundHex } }
                        >
                            <p className='text-sm font-medium'>{ name }</p>
                            <p className='text-xs opacity-75'>{ color }</p>
                        </Card>
                    </div>
                );
            }) }
        </div>
    );
};

const FontPreview: React.FC<{ config: config }> = ({ config }) => {
    const fonts = React.useMemo(() =>
        config.variables.filter(({ type }) =>
            type === 'font'
        ) as fontVariable[]
    , [ config.variables ]);

    return (
        <div className='space-y-6'>
            { fonts.map((font) => (
                <p
                    key={ font.id }
                    className={ `text-muted-foreground text-sm overflow-scroll text-nowrap max-h-[${ font.size }]` }
                    style={ { font: fontToCss(font) } }
                >{ font.name }</p>
            ))}
        </div>
    );
};

export default Editor;