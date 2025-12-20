'use client';
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

import FontInput from '@/components/inputs/fontInput';
import CssUnitInput from '@/components/inputs/cssUnitInput';
import CssKeywordInput from '@/components/inputs/cssKeywordInput';

import { cssToFont } from '@/lib/utils';

type Props = {
    config: config;
    setConfig: React.Dispatch<React.SetStateAction<config>>;
};

const FontEditor: React.FC<Props> = ({ config, setConfig }) => {
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

export default FontEditor;