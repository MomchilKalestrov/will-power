'use client';
import React from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { ServerCrash, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DialogFooter } from '@/components/ui/dialog';

import { getBlobList, addBlob, deleteBlob } from '@/lib/actions/blob';

import { pathListToTree, type fileNode } from '@/lib/utils';

import DirectoryViewer from './directoryViewer';
import SelectedFilePanel from './selectedFilePanel';
import FileSelectorDialog from './fileSelectorDialog';
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
    const t = useTranslations('Contexts');
    const [ selectedFiles, setSelectedFiles ] = React.useState<Set<string>>(new Set<string>());
    const [ files, setFiles ] = React.useState<Record<string, BlobInformation> | null | undefined>();
    const tree = React.useMemo(() =>
        files !== undefined && files !== null
        ?   pathListToTree(Object.keys(files))
        :   undefined,
        [ files ]
    );
    const lastSelectedFile = React.useMemo(() =>
        selectedFiles.size > 0
        ?   [ ...selectedFiles ].pop()
        :   undefined,
        [ selectedFiles ]
    );
    const [ cwd, setCwd ] = React.useState<string[]>([ 'assets' ]);

    const accepts = React.useMemo(() =>
        fileCount !== 'none' && fileType !== 'all'
        ?   formats[ fileType ]
                .map(format => '.' + format)
                .join(',')
        :   undefined,
        [ fileCount, fileType ]
    );

    const onPathClick = React.useCallback((index: number) => {
        setCwd(state => state.slice(0, index + 1));
        if (fileCount === 'none')
            setSelectedFiles(new Set());
    }, [ fileCount ]);

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
    }, [ fileType ]);

    const onDelete = React.useCallback(() =>
        deleteBlob(lastSelectedFile!)
            .then(response => {
                if (!response.success)
                    return toast(t('failedDelete', { reason: response.reason }));
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
            .catch(() => toast(t('failedDeleteDefault'))),
        [ lastSelectedFile, t ]
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
                    return toast(t('failedUpload', { reason: response.reason }));
                setFiles(state => {
                    const newState = { ...state };
                    newState[ response.value.pathname ] = response.value;
                    return newState;
                });
            })
            .catch(() => toast(t('failedUploadDefault'))),
        [ cwd, t ]
    );
    
    if (files === null)
        return (
            <FileSelectorDialog
                visible={ visible }
                onClose={ () => onSelected(null) }
                fileType={ fileType }
                fileCount={ fileCount }
                accepts={ accepts }
                cwd={ cwd }
                onPathClick={ onPathClick }
                onFileAdd={ onFileAdd }
            >
                <div className='min-h-0 grid grid-cols-[1fr_auto] overflow-hidden'>
                    <ServerCrash className='size-27' />
                    <p className='text-xl'>{ t('failedGet') }</p>
                </div>
            </FileSelectorDialog>
        );

    let directoryNode: fileNode | undefined = tree;
    if (directoryNode)
        for (let i = 0; i < cwd.length; i++)
            directoryNode = directoryNode?.children![ cwd[ i ] ];

    return (
        <FileSelectorDialog
            visible={ visible }
            onClose={ () => onSelected(null) }
            fileType={ fileType }
            fileCount={ fileCount }
            accepts={ accepts }
            cwd={ cwd }
            onPathClick={ onPathClick }
            onFileAdd={ onFileAdd }
        >
            <div className='min-h-0 grid grid-cols-[1fr_auto] overflow-hidden'>
                {
                    files === undefined
                    ?   <div className='w-full flex items-center justify-center'>{ t('loading') }</div>
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