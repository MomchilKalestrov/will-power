'use client';
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import ColorPicker from '@/components/inputs/colorPicker';

type Props = {
    config: config;
    setConfig: React.Dispatch<React.SetStateAction<config>>;
};

const ColorEditor: React.FC<Props> = ({ config, setConfig }) => {
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

export default ColorEditor;