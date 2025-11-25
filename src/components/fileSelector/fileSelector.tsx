'use client';
import React from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Card,
    CardTitle,
    CardFooter,
    CardHeader,
    CardContent
} from '@/components/ui/card';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

import * as blobs from '@/lib/actions';

import DirectoryViewer from './directoryViewer';
import SelectedFilePanel from './selectedFilePanel';
import AddFileDialog from './addFileDialog';

type fileTypes = 'image' | 'video' | 'font' | 'all';
type fileCount = 'single' | 'multiple' | 'none';

const formats: Record<string, string[]> = {
    image: [ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', '/' ],
    video: [ 'mp4', 'webm', 'ogg', '/' ],
    font: [ 'ttf', 'otf', 'woff', 'woff2', '/' ]
};

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

const FileSelector: React.FC<{
    onSelected: (blob: BlobInformation[] | null) => void,
    fileType: fileTypes,
    fileCount: fileCount
}> = ({ onSelected, fileType, fileCount }) => {
    const [ selectedFiles, setSelectedFiles ] = React.useState<Set<string>>(new Set<string>());
    const [ files, setFiles ] = React.useState<Record<string, BlobInformation> | undefined>(undefined);
    const tree = React.useMemo(() =>
        files !== undefined
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
        blobs.getBlobList()
            .then((res) =>
                setFiles(
                    filterFiles(res, fileType)
                        .reduce<Record<string, BlobInformation>>((acc, curr) => {
                            acc[ curr.pathname ] = curr;
                            return acc;
                        }, {})
                )
            );
    }, []);

    const onDelete = React.useCallback(() =>
        blobs.deleteBlob(lastSelectedFile!)
            .then(result => {
                if (!result)
                    return toast('Failed to delete the blob.');
                setSelectedFiles(state => {
                    const newSet = new Set(state);
                    newSet.delete(lastSelectedFile!);
                    return newSet;
                });
                setFiles(state => {
                    const newState = { ...state! };
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
        blobs.addBlob(`${ cwd.join('/') }/${ file.name }`, file, {
            access: 'public'
        })
            .then((result) => {
                if (!result)
                    return toast('Failed to upload file.');
                setFiles(state => {
                    let newState = { ...state ?? {} };
                    newState[ (result as BlobInformation).pathname ] = result as BlobInformation;
                    return newState;
                });
            })
            .catch(() => toast('Failed to upload file.')),
        []
    );

    let directoryNode: fileNode | undefined = tree;
    if (directoryNode)
        for (let i = 0; i < cwd.length; i++)
            directoryNode = directoryNode?.children![ cwd[ i ] ];

    return (
        <div className='fixed p-16 inset-0 z-49 w-dvw h-dvh bg-black/30 backdrop-blur-xs'>
            <Card className='w-full h-full min-h-0 flex flex-col gap-0 py-4'>
                <CardHeader className='flex justify-between items-center px-4'>
                    <div className='flex gap-2 items-center'>
                        <AddFileDialog
                            onSend={ onFileAdd }
                            accepts={
                                fileCount !== 'none'
                                ?   formats[ fileType ]
                                        .map(format => '.' + format)
                                        .join(',')
                                :   undefined
                            }
                        />
                        <CardTitle className='text-xl'>
                            { fileCount !== 'none' && 'Select file' + (fileCount === 'multiple' ? 's' : '') }
                        </CardTitle>
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
                </CardHeader>
                <Separator className='my-4' />
                <CardContent className='flex-1 min-h-0 grid grid-cols-[1fr_auto] px-4 overflow-hidden'>
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
                </CardContent>
                {
                    selectedFiles.size !== 0 && fileCount === 'multiple' &&
                    <>
                        <Separator className='my-4' />
                        <CardFooter className='px-4'>
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
                        </CardFooter>
                    </>
                }
            </Card>
        </div>
    );
};

export default FileSelector;