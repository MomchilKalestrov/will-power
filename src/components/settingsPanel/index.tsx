'use client';
import React from 'react';
import { toast } from 'sonner';
import { Loader, Plus, Trash2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectItem, 
    SelectValue,
    SelectContent,
    SelectTrigger 
} from '@/components/ui/select';

import { getAllComponents } from '@/lib/db/actions/component';

type Props = {
    component: Component;
    onChange: (component: Partial<Component>) => void
};

const SettingsEditor: React.FC<Props> = ({ component, onChange }) => {
    const onEntryChanged = React.useCallback((key: string, value: any) =>
        onChange({ [ key ]: value })
    , [ onChange ]);
    const [ pageNames, setPageNames ] = React.useState<string[] | null | undefined>();

    React.useEffect(() => {
        if (component.type !== 'page' && pageNames === undefined)
            getAllComponents('page')
                .then(response => {
                    if (!response.success)
                        return toast('Failed to fetch page names: ' + response.reason);
                    setPageNames(response.value);
                });
    }, [ component ]);

    const onDisplayConditionChange = React.useCallback((condition: displayCondition, index: number) => {
        const newConditions = [ ...(component as Component & { type: 'header' }).displayCondition ];
        newConditions[ index ] = condition;
        onEntryChanged('displayCondition', newConditions);
    }, [ component ]);

    const onDisplayConditionDelete = React.useCallback((index: number) => {
        const newConditions = [ ...(component as Component & { type: 'header' }).displayCondition ];
        if (newConditions.length === 1) return;
        newConditions.splice(index, 1);
        onEntryChanged('displayCondition', newConditions);
    }, [ component ]);
    
    return (
        component.type === 'page'
        ?   <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Label htmlFor='title-input'>Title</Label>
                    <Input
                        name='title-input'
                        id='title-input'
                        placeholder='Title...'
                        value={ component.title }
                        onChange={ ({ currentTarget: { value } }) =>
                            onEntryChanged('title', value) 
                        }
                    />
                </div>
                <div className='grid gap-2'>
                    <Label
                        htmlFor='description-input'
                        className='col-span-full'
                    >Description</Label>
                    <Textarea
                        name='description-input'
                        id='description-input'
                        placeholder='Description...'
                        className='resize-y col-span-full'
                        value={ component.description }
                        onChange={ ({ currentTarget: { value } }) =>
                            onEntryChanged('description', value) 
                        }
                    />
                </div>
            </div>
        :   <div className='space-y-4'>
                <Label>Display Conditions</Label>
                <div>
                    { (component as Component & { type: 'header' }).displayCondition.map(({ show, name }, index) => (
                        <div className='flex gap-2 mb-2' key={ index }>
                            <Select
                                value={ show }
                                onValueChange={ s =>
                                    onDisplayConditionChange({
                                        show: s as typeof show,
                                        name: show !== 'all' ? name : pageNames![ 0 ]
                                    }, index)
                                }
                            >
                                <SelectTrigger className={ show === 'all' ? 'w-full' : 'w-28' }>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All</SelectItem>
                                    <SelectItem disabled={ !pageNames } value='page'>Page</SelectItem>
                                    <SelectItem disabled={ !pageNames } value='Exclude'>Exclude</SelectItem>
                                </SelectContent>
                            </Select>
                            { show !== 'all' && (
                                pageNames !== null
                                ?    <Select
                                        value={ name }
                                        onValueChange={ page =>
                                            onDisplayConditionChange({
                                                show,
                                                name: page
                                            }, index)
                                        }
                                    >
                                        <SelectTrigger className='flex-1'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                        {
                                            pageNames === undefined
                                            ?   <Loader className='size-4 my-4 animate-spin mx-auto' />
                                            :   pageNames.map(name => (
                                                    <SelectItem key={ name } value={ name }>{ name }</SelectItem>
                                                ))
                                        }
                                        </SelectContent>
                                    </Select>
                                :   <Label>ERROR!</Label>
                            ) }
                            <Button
                                variant='destructive'
                                size='icon'
                                onClick={ () => onDisplayConditionDelete(index) }
                            ><Trash2 /></Button>
                        </div>
                    )) }
                    <Button
                        className='w-full'
                        variant='outline'
                        onClick={ () =>
                            onEntryChanged('displayCondition', [
                                ...(component as Component & { type: 'header' }).displayCondition,
                                { show: 'all' }
                            ])
                        }
                    ><Plus /></Button>
                </div>
            </div>
    );
};

export default SettingsEditor;