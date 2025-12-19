'use client';
import React from 'react';

import {
    Dialog,
    DialogTitle,
    DialogFooter,
    DialogHeader,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type option = {
    text: string;
    variant: 'default' | 'ghost' | 'outline';
};

const DialogCTX = React.createContext<{
    showDialog: (title: string, description: string, options: option[]) => Promise<string>;
} | undefined>(undefined);

const useDialog = () => {
    const value = React.useContext(DialogCTX);
    if (!value) throw new Error('useDialog must be used within a DialogProvider');
    return value;
};

const DialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ title, setTitle ] = React.useState<string>('Title');
    const [ visible, setVisibility ] = React.useState<boolean>(false);
    const [ description, setDescription ] = React.useState<string>('Description');
    const [ options, setOptions ] = React.useState<option[]>([]);
    const [ promise, setPromise ] = React.useState<{
        resolve: (value: string) => void,
        reject: () => void
    }>({
        resolve: () => null,
        reject: () => null
    });
    

    const showDialog = React.useCallback((title: string, description: string, options: option[]) =>
        new Promise<string>((resolve, reject) => {
            setVisibility(true);
            setTitle(title);
            setDescription(description);
            setOptions(options);
            setPromise({ resolve, reject });
        })
    , []);

    const onSelected = React.useCallback((option: string | null) => {
        setVisibility(false);
        if (option)
            promise.resolve(option);
        else
            promise.reject();
    }, [ promise ]);

    return (
        <DialogCTX.Provider value={ { showDialog } }>
            <Dialog open={ visible } onOpenChange={ (open) => !open && onSelected(null) }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{ title }</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        { description }
                    </DialogDescription>
                    <DialogFooter>
                        { options.map(({ text, variant }) => (
                            <Button
                                key={ text }
                                variant={ variant }
                                onClick={ () => onSelected(text) }
                            >{ text }</Button>
                        )) }
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            { children }
        </DialogCTX.Provider>
    )
};

export { useDialog, DialogProvider };