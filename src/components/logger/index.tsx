'use client';
import React from 'react';
import { TerminalSquare } from 'lucide-react';

import {
    Dialog,
    DialogTitle,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

type message = {
    type: 'warn' | 'error';
    message: unknown[];
    time: Date;
    callStack: string[];
};

const colors: Record<message[ 'type' ], string> = {
    'warn': 'bg-amber-100 text-amber-950 dark:bg-yellow-900 dark:text-amber-50',
    'error': 'bg-red-200 text-red-950 dark:bg-red-950 dark:text-red-100'
};

const formatParameter = (param: unknown) => {
    if (param instanceof Error)
        return `${ param.name }: ${ param.message }`;

    switch (typeof param) {
        case 'undefined':
            return 'undefined';
        case 'boolean':
        case 'string':
        case 'number':
        case 'function':
            return param.toString();
        default:
            return JSON.stringify(param, null, '    ');
    };
};

const Logger: React.FC = () => {
    const [ messages, setMessages ] = React.useState<message[]>([]);
    const hasErrors = React.useMemo(() => messages.some(m => m.type === 'error'), [ messages.length ]);

    React.useEffect(() => {
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => {
            const callStack = (new Error().stack ?? '').split('\n');
            setMessages(state => [ ...state, {
                type: 'warn',
                message: args,
                time: new Date(),
                callStack
            } ]);
            originalWarn(...args);
        };

        const originalError = console.error;
        console.error = (...args: unknown[]) => {
            const callStack = (new Error().stack ?? '').split('\n');
            setMessages(state => [ ...state, {
                type: 'error',
                message: args,
                time: new Date(),
                callStack
            } ]);
            originalError(...args);
        };

        const onError = (event: ErrorEvent) => {
            const callStack = (new Error().stack ?? '').split('\n');
            setMessages(state => [ ...state, {
                type: 'error',
                message: [ `Uncaught ${ event.error.name ?? 'Error' }: ${ event.message }` ],
                time: new Date(),
                callStack
            } ]);
        };
        window.addEventListener('error', onError);
        
        const onReject = (event: PromiseRejectionEvent) => {
            console.log(event)
            const callStack = (new Error().stack ?? '').split('\n');
            setMessages(state => [ ...state, {
                type: 'error',
                message: [ `Uncaught ${ formatParameter(event.reason) }` ],
                time: new Date(),
                callStack
            } ]);
        };
        window.addEventListener('unhandledrejection', onReject);

        return () => {
            window.removeEventListener('error', onError);
            window.removeEventListener('unhandledrejection', onReject);

            console.warn = originalWarn;
            console.error = originalError;
        };
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={ hasErrors ? 'destructive' : 'outline' }
                    size='icon'
                    className='fixed bottom-4 right-4'
                ><TerminalSquare /></Button>
            </DialogTrigger>
            <DialogContent className='grid-rows-[auto_1fr] max-w-[calc(100dvw-var(--spacing)*32)]! h-full max-h-[calc(100dvh-var(--spacing)*32)]! p-0 gap-0'>
                <DialogDescription asChild>
                    <DialogTitle className='hidden'>
                        Console
                    </DialogTitle>
                </DialogDescription>
                <DialogHeader className='p-6 border-b'>
                    <DialogTitle className='text-foreground'>
                        Console
                    </DialogTitle>
                </DialogHeader>
                <main className='h-full overflow-y-scroll'>
                    { messages.map(({ type, message, time }, i) => (
                        <div key={ i } className={ cn('px-6 py-2 font-mono border-b', colors[ type ]) }>
                            { message.map((v, i) => (
                                <pre key={ i }>{ formatParameter(v) }</pre>
                            )) }
                            <pre className='text-right'>{ time.toTimeString().split(' ')[ 0 ] }</pre>
                        </div>
                    )) }
                </main>
            </DialogContent>
        </Dialog>
    );
};

export default Logger;