'use client';
import React from 'react';
import { X } from 'lucide-react';

import {
    Dialog,
    DialogTitle,
    DialogHeader,
    DialogContent,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import AddFileDialog from './addFileDialog';

import { type fileTypes, type fileCount } from './fileFormats';

type Props = {
    visible: boolean;
    onClose: () => void;
    fileType: fileTypes;
    fileCount: fileCount;
    accepts?: string;
    cwd: string[];
    onPathClick: (index: number) => void;
    onFileAdd: (file: File) => void;
};

const FileSelectorDialog: React.FC<React.PropsWithChildren<Props>> = React.memo(({
    children,
    visible,
    onClose,
    fileType,
    fileCount,
    accepts,
    cwd,
    onPathClick,
    onFileAdd
}) => (
    <Dialog open={ visible } onOpenChange={ open => !open && onClose() }>
        <DialogContent
            showCloseButton={ false }
            className='max-w-full! w-[calc(100dvw-var(--spacing)*16)] h-[calc(100dvh-var(--spacing)*16)] grid grid-rows-[auto_auto_1fr_auto_auto] p-4 gap-0'
        >
            <DialogHeader className='flex flex-row justify-between items-center'>
                <div className='flex gap-2 items-center'>
                    <AddFileDialog
                        onSend={ onFileAdd }
                        accepts={
                            fileCount !== 'none' && fileType !== 'all'
                            ?   accepts
                            :   undefined
                        }
                    />
                    <DialogTitle className='text-xl'>
                        <DialogDescription>
                            { fileCount !== 'none' && 'Select file' + (fileCount === 'multiple' ? 's' : '') }
                        </DialogDescription>
                    </DialogTitle>
                </div>
                <Breadcrumb>
                    <BreadcrumbList>
                        { cwd.map((path, index, { length }) => (
                            <React.Fragment key={ 'path-' + index }>
                                <BreadcrumbItem>
                                    <BreadcrumbLink onClick={ () => onPathClick(index) }>
                                        {
                                            length - 1 === index
                                            ?   <BreadcrumbPage>{ path }</BreadcrumbPage>
                                            :   path
                                        }
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                { index < length - 1 && <BreadcrumbSeparator /> }
                            </React.Fragment>
                        )) }
                    </BreadcrumbList>
                </Breadcrumb>
                <Button
                    size='icon'
                    variant='outline'
                    onClick={ onClose }
                ><X /></Button>
            </DialogHeader>
            <Separator className='my-4' />
            { children }
        </DialogContent>
    </Dialog>
));

export default FileSelectorDialog;