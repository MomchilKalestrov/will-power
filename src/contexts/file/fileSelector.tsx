'use client';
import React from 'react';
import { toast } from 'sonner';
import { ServerCrash, X } from 'lucide-react';

import {
    Dialog,
    DialogTitle,
    DialogFooter,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { getBlobList, addBlob, deleteBlob } from '@/lib/actions/blob';

import DirectoryViewer from './directoryViewer';
import SelectedFilePanel from './selectedFilePanel';
import AddFileDialog from './addFileDialog';

import { formats, type fileTypes, type fileCount } from './fileFormats';

const filterFiles = (files: BlobInformation[], fileType: fileTypes): BlobInformation[] =>
    fileType === 'all'
    ?   files
    :   files.filter(({ pathname }) =>
            formats[ fileType ].find((format) =>
                pathname.endsWith(format) &&
                pathname.startsWith('assets/')
            )
        );

type fileNode = {
    isFile: boolean;
    children?: Record<string, fileNode>;
};

const toTree = (paths: string[]): fileNode => {
    const root: Record<string, fileNode> = {};

    for (const rawPath of paths) {
        const path = rawPath.trim().replace(/\/+/g, '/');
        const isExplicitDir = path.endsWith('/');
        const parts = path.split('/').filter(Boolean);

        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[ i ];
            const isLast = i === parts.length - 1;

            if (!current[ part ]) {
                const isFile = isLast && !isExplicitDir;
                current[ part ] = { isFile, children: isFile ? undefined : {} };
            }

            if (!isLast && current[ part ].isFile) {
                current[ part ].isFile = false;
                current[ part ].children = {};
            }

            if (!isLast)
                current = current[ part ].children!;
        }
    }
    return {
        isFile: false,
        children: root
    };
};

type Props = {
    onSelected: (blob: BlobInformation[] | null) => void;
    fileType: fileTypes;
    fileCount: fileCount;
    visible: boolean;
};

const FileSelector: React.FC<Props> = ({
    onSelected,
    fileType,
    fileCount,
    visible
}) => {
    const [ selectedFiles, setSelectedFiles ] = React.useState<Set<string>>(new Set<string>());
    const [ files, setFiles ] = React.useState<Record<string, BlobInformation> | null | undefined>();
    const tree = React.useMemo(() =>
        files !== undefined && files !== null
        ?   toTree(Object.keys(files))
        :   undefined,
        [ files ]
    );
    const lastSelectedFile = React.useMemo(() =>
        selectedFiles.size > 0
        ?   [ ...selectedFiles ].pop()
        :   undefined,
        [ files, selectedFiles ]
    );
    const [ cwd, setCwd ] = React.useState<string[]>([ 'assets' ]);

    React.useEffect(() => {
        getBlobList()
            .then(response => {
                if (!response.success)
                    return setFiles(null);
                setFiles(
                    filterFiles(response.value, fileType)
                    .reduce<Record<string, BlobInformation>>((acc, curr) => {
                        acc[ curr.pathname ] = curr;
                        return acc;
                    }, {})
                );
            })
            .catch(() => setFiles(null));
    }, []);

    const onDelete = React.useCallback(() =>
        deleteBlob(lastSelectedFile!)
            .then(response => {
                if (!response.success)
                    return toast('Failed to delete the blob: ' + response.reason);
                setSelectedFiles(state => {
                    const newSet = new Set(state);
                    newSet.delete(lastSelectedFile!);
                    return newSet;
                });
                setFiles(state => {
                    const newState = { ...state };
                    delete newState[ lastSelectedFile! ];
                    return newState;
                });
            })
            .catch(() => toast('Failed to delete the blob.')),
        [ lastSelectedFile ]
    );

    const onRemoveSelect = React.useCallback((pathname: string) => 
        setSelectedFiles(state => {
            const newSet = new Set(state);
            newSet.delete(pathname);
            return newSet;
        }),
        []
    );

    const onFileAdd = React.useCallback((file: File) => 
        addBlob(`${ cwd.join('/') }/${ file.name }`, file, {
            access: 'public'
        })
            .then(response => {
                if (!response.success)
                    return toast('Failed to upload file: ' + response.reason);
                setFiles(state => {
                    const newState = { ...state };
                    newState[ response.value.pathname ] = response.value;
                    return newState;
                });
            })
            .catch(() => toast('Failed to upload file.')),
        []
    );

    // instead of passing 50 different attributes, just put it in the same context ¯\_(ツ)_/¯
    const FileSelectorDialog: React.FC<React.PropsWithChildren> = ({ children }) => (
        <Dialog open={ visible } onOpenChange={ open => !open && onSelected(null) }>
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
                                ?   formats[ fileType ]
                                        .map(format => '.' + format)
                                        .join(',')
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
                                        <BreadcrumbLink onClick={ () => {
                                            setCwd(state => state.slice(0, index + 1));
                                            if (fileCount === 'none')
                                                setSelectedFiles(new Set());
                                        } }>
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
                        onClick={ () => onSelected(null) }
                    ><X /></Button>
                </DialogHeader>
                <Separator className='my-4' />
                { children }
            </DialogContent>
        </Dialog>
    )
    
    if (files === null)
        return (
            <FileSelectorDialog>
                <div className='min-h-0 grid grid-cols-[1fr_auto] overflow-hidden'>
                    <ServerCrash className='size-27' />
                    <p className='text-xl'>Failed to get files...</p>
                </div>
            </FileSelectorDialog>
        );

    let directoryNode: fileNode | undefined = tree;
    if (directoryNode)
        for (let i = 0; i < cwd.length; i++)
            directoryNode = directoryNode?.children![ cwd[ i ] ];

    return (
        <FileSelectorDialog>
            <div className='min-h-0 grid grid-cols-[1fr_auto] overflow-hidden'>
                {
                    files === undefined
                    ?   <div className='w-full flex items-center justify-center'>Loading...</div>
                    :   <DirectoryViewer
                            files={ files }
                            directoryNode={ directoryNode ?? { isFile: false, children: {} } }
                            path={ cwd.join('/') }
                            selectedFiles={ selectedFiles }
                            onFileSelect={ pathname => {
                                const newSet = new Set<string>(selectedFiles);
                                if (newSet.has(pathname))
                                    newSet.delete(pathname);
                                else {
                                    if (fileCount !== 'multiple')
                                        newSet.clear();
                                    newSet.add(pathname);
                                }
                                setSelectedFiles(newSet);
                            } }
                            onDirectorySelect={ name => {
                                setCwd(state => [ ...state, name ]);
                                if (fileCount === 'none')
                                    setSelectedFiles(new Set());
                            } }
                        />
                }
                {
                    (lastSelectedFile !== undefined && files !== undefined) &&
                    <SelectedFilePanel
                        file={ files[ lastSelectedFile ] }
                        onSelect={ 
                            fileCount !== 'none'
                            ?   () => onSelected(Object.values(files).filter(({ pathname }) =>
                                selectedFiles.has(pathname)
                            ))
                            :   undefined
                        }
                        onDelete={ onDelete }
                    />
                }
            </div>
            {
                selectedFiles.size !== 0 && fileCount === 'multiple' &&
                <>
                    <Separator className='my-4' />
                    <DialogFooter>
                        { [ ...selectedFiles ].map(file => (
                            <Badge
                                key={ files![ file ].pathname }
                                variant='outline'
                                className='flex gap-1'
                                onClick={ () => onRemoveSelect(file) }
                            >
                                <X />
                                { files![ file ].pathname.split('/').pop() }
                            </Badge>
                        )) }
                    </DialogFooter>
                </>
            }
        </FileSelectorDialog>
    );
};

export default FileSelector;