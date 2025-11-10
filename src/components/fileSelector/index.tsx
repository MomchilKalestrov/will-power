'use client';
import React from 'react';
import Image from 'next/image';
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
import { toast } from 'sonner';

type fileTypes = 'image' | 'video' | 'font';
type selectFileFunctionType = (fileCount: 'single' | 'multiple', fileType?: fileTypes) => Promise<BlobInformation[]>;

const fileSelectorCTX = React.createContext<{
    selectFile: selectFileFunctionType
}>({
    selectFile: async () => []
});

const useFileSelector = () => React.useContext(fileSelectorCTX);

const formats: Record<string, string[]> = {
    image: [ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp' ],
    video: [ 'mp4', 'webm', 'ogg' ],
    font: [ 'ttf', 'otf', 'woff', 'woff2' ]
};

const filterFiles = (files: BlobInformation[], fileType: fileTypes): BlobInformation[] =>
    files.filter(({ pathname }) =>
        formats[ fileType ].find((format) =>
            pathname.endsWith(format)));

const toFileSize = (value: number): string => {
    const units = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ];
    let unitIndex = 0;
    while (value > 1000) {
        value = Math.round(value / 100) / 10;
        if (++unitIndex >= units.length - 1) break;
    };
    return value + ' ' + units[ unitIndex ];
};

type fileNode = {
    isFile: boolean;
    children?: Record<string, fileNode>;
};

const toTree = (paths: string[]): fileNode => {
    const root: Record<string, fileNode> = {};

    for (const path of paths) {
        const parts = path.split("/").filter(Boolean);
        let current = root;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[ i ];
            const isLast = i === parts.length - 1;

            if (!current[ part ])
                current[ part ] = {
                    isFile: isLast,
                    children: isLast ? undefined : {},
                };

            if (!isLast && current[ part ].children) {
                current = current[ part ].children!;
            }
        }
    }

    return {
        isFile: false,
        children: root
    };
};

const FileSidePanel: React.FC<{
    onSelect: () => void;
    onDelete: () => void;
    file: BlobInformation;
}> = ({
    onSelect,
    onDelete,
    file
}) => (
    <section className='flex'>
        <Separator orientation='vertical' className='mx-4' />
        <div className='w-64 grow flex flex-col justify-between'>
            <section className='grid gap-2'>
                <p>
                    <strong>Name:</strong><br></br>
                    { file.pathname.split('/').pop() }
                </p>
                <p>
                    <strong>Size:</strong><br></br>
                    { toFileSize(file.size) }
                </p>
                <div>
                    <p><strong>URL:</strong></p>
                    <div className='overflow-scroll w-64'>
                        <code className='text-nowrap'>{ file.url }</code>
                    </div>
                </div>
            </section>
            <div className='grid gap-2'>
                <Button
                    variant='destructive'
                    onClick={ onDelete }
                >Delete</Button>
                <Button onClick={ onSelect }>Select</Button>
            </div>
        </div>
    </section>
);

const DirectoryViewer: React.FC<{
    directoryNode: fileNode;
    files: Record<string, BlobInformation>;
    selectedFiles: Set<string>;
    onFileSelect: (path: string) => void;
    onDirectorySelect: (name: string) => void;
    path: string;
}> = ({
    directoryNode,
    files,
    selectedFiles,
    onFileSelect,
    onDirectorySelect,
    path
}) => (
    Object.keys(directoryNode.children || {}).length === 0
    ?   <>Path is empty</>
    :   <div className='w-full flex flex-wrap content-start justify-start items-start gap-2'>
            { Object.entries(directoryNode.children!).map(([ name, { isFile } ]) => {
                if (!isFile)
                    return (
                        <Button
                            key={ name }
                            variant='ghost'
                            className='w-full text-left justify-start'
                            onClick={ () => onDirectorySelect(name) }
                        >/{ name }</Button>
                    );
                
                const { pathname, url } = files[ path + '/' + name ];

                return (
                    <button
                        className={ 'border-2 rounded-sm ' + (selectedFiles.has(pathname) ? 'border-stone-300' : 'border-white') }
                        key={ pathname }
                        onClick={ () => onFileSelect(pathname) }
                    >
                        {
                            formats.image.includes(pathname.split('.').pop()!)
                            ?   <Image
                                    src={ url }
                                    width={ 96 }
                                    height={ 96 }
                                    alt={ pathname }
                                    key={ pathname }
                                    className='w-[96] h-[96]'
                                />
                            :   <p>{ pathname }</p>
                        }
                    </button>
                );
            }) }
        </div>
);

const FileSelector: React.FC<{
    onSelected: (blob: BlobInformation[] | null) => void,
    fileType: fileTypes,
    fileCount: 'single' | 'multiple'
}> = ({ onSelected, fileType, fileCount }) => {
    const [ selectedFiles, setSelectedFiles ] = React.useState<Set<string>>(new Set<string>());
    const [ files, setFiles ] = React.useState<Record<string, BlobInformation> | undefined>(undefined);
    const tree = React.useMemo(() =>
        files !== undefined
        ?   toTree(Object.keys(files))
        :   undefined,
        [ files ]
    );

    console.log(files, tree)

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

    const iterableFiles = [ ...selectedFiles ];
    const lastSelectedFile: string | undefined = iterableFiles.length > 0 ? iterableFiles[ iterableFiles.length - 1 ] : undefined;

    let directoryNode: fileNode | undefined = tree;
    if (directoryNode)
        for (let i = 0; i < cwd.length; i++)
            directoryNode = directoryNode?.children![ cwd[ i ] ];

    return (
        <div className='fixed p-16 inset-0 z-100 w-dvw h-dvh bg-black/30 backdrop-blur-xs'>
            <Card className='w-full h-full flex flex-col column gap-0 py-4'>
                <CardHeader className='flex justify-between items-center px-4'>
                    <CardTitle className='text-xl'>Select file{ fileCount === 'multiple' ? 's' : '' }</CardTitle>
                    <Breadcrumb>
                        <BreadcrumbList>
                            { cwd.map((path, index, { length }) => (
                                <React.Fragment key={ 'path-' + index }>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink onClick={ () => {
                                            setCwd(state => state.slice(0, index + 1))
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
                    <Button size='icon' variant='outline' onClick={ () => onSelected(null) }>
                        <X />
                    </Button>
                </CardHeader>
                <Separator className='my-4' />
                <CardContent className='flex grow w-full items-stretch px-4'>
                    {
                        !files || !directoryNode
                        ?   <div className='w-full flex items-center justify-center'>Loading...</div>
                        :   <DirectoryViewer
                                files={ files }
                                directoryNode={ directoryNode }
                                path={ cwd.join('/') }
                                selectedFiles={ selectedFiles }
                                onFileSelect={ pathname => {
                                    const newSet = new Set<string>(selectedFiles);
                                    if (newSet.has(pathname))
                                        newSet.delete(pathname);
                                    else {
                                        if (fileCount === 'single')
                                            newSet.clear();
                                        newSet.add(pathname);
                                    }
                                    setSelectedFiles(newSet);
                                } }
                                onDirectorySelect={ name =>
                                    setCwd(state => [ ...state, name ])
                                }
                            />
                    }
                    {
                        (lastSelectedFile !== undefined && files !== undefined) &&
                        <FileSidePanel
                            file={ files[ lastSelectedFile ] }
                            onSelect={ () => onSelected(Object.values(files).filter(({ pathname }) =>
                                selectedFiles.has(pathname)
                            )) }
                            onDelete={ () =>
                                blobs.deleteBlob(lastSelectedFile)
                                    .then(result => {
                                        if (!result)
                                            return toast('Failed to delete the blob.');
                                        setSelectedFiles(state => {
                                            const newSet = new Set(state);
                                            newSet.delete(lastSelectedFile);
                                            return newSet;
                                        });
                                        setFiles(state => {
                                            const newState = { ...state! };
                                            delete newState[ lastSelectedFile ];
                                            return newState;
                                        });
                                    })
                                    .catch(() => toast('Failed to delete the blob.'))
                            }
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
                                    onClick={ () => {
                                        const newSet = new Set<string>(selectedFiles);
                                        newSet.delete(file);
                                        setSelectedFiles(newSet);
                                    } }
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

const FileSelectorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ visible, setVisibility ] = React.useState<boolean>(false);
    const [ fileCount, setFileCount ] = React.useState<'single' | 'multiple'>('single');
    const [ fileType, setFileType ] = React.useState<fileTypes>('image');
    const [ promise, setPromise ] = React.useState<{
        resolve: (value: BlobInformation[]) => void,
        reject: () => void
    }>({
        resolve: () => null,
        reject: () => null
    });
    

    const selectFile = React.useCallback((fileCount: 'single' | 'multiple', fileType: fileTypes = 'image') =>
        new Promise<BlobInformation[]>((resolve, reject) => {
            setVisibility(true);
            setFileCount(fileCount);
            setFileType(fileType);
            setPromise({ resolve, reject });
        })
    , []);

    const onSelected = React.useCallback((blobInformation: BlobInformation[] | null) => {
        setVisibility(false);
        if (blobInformation)
            promise.resolve(blobInformation);
        else
            promise.reject();
    }, [ promise ]);

    return (
        <fileSelectorCTX.Provider value={ { selectFile } }>
            { visible && <FileSelector fileCount={ fileCount } onSelected={ onSelected } fileType={ fileType } /> }
            { children }
        </fileSelectorCTX.Provider>
    )
};

export { useFileSelector, FileSelectorProvider };