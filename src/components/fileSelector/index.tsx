'use client';
import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { getBlobList } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type fileTypes = 'image' | 'video' | 'font';
type selectFileFunctionType = ((fileCount: 'single' | 'multiple', fileType?: fileTypes) => Promise<BlobInformation[]>);

const fileSelectorCTX = React.createContext<{
    selectFile: selectFileFunctionType
}>({
    selectFile: async () => []
});

const useFileSelector = () => React.useContext(fileSelectorCTX);

const formats: { [ key: string ]: string[] } = {
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

const FileSelector: React.FC<{
    onSelected: (blob: BlobInformation[] | null) => void,
    fileType: fileTypes,
    fileCount: 'single' | 'multiple'
}> = ({ onSelected, fileType, fileCount }) => {
    const [ selectedFiles, setSelectedFiles ] = React.useState<Set<number>>(new Set<number>());
    const [ files, setFiles ] = React.useState<BlobInformation[] | undefined>(undefined);

    React.useEffect(() => {
        getBlobList().then((res) => setFiles(filterFiles(res, fileType)));
    }, []);

    const iterableFiles = [ ...selectedFiles ];
    const lastSelectedIndex: number | undefined = iterableFiles.length > 0 ? iterableFiles[ iterableFiles.length - 1 ] : undefined;

    return (
        <div className='fixed p-16 inset-0 z-100 w-dvw h-dvh bg-black/30 backdrop-blur-xs'>
            <Card className='w-full h-full flex flex-col column gap-0 py-4'>
                <CardHeader className='flex justify-between items-center px-4'>
                    <CardTitle className='text-xl'>Select files</CardTitle>
                    <Button size='icon' variant='outline' onClick={ () => onSelected(null) }>
                        <X />
                    </Button>
                </CardHeader>
                <Separator className='my-4' />
                <CardContent className='flex flex-grow w-full items-stretch px-4'>
                    {
                        !files
                        ?   <div className='w-full flex items-center justify-center'>Loading...</div>
                        :   <div className='w-full flex justify-start items-start gap-2'>
                                { files.map((value, index) => (
                                    <button
                                        className={ 'border-2 rounded-sm ' + (selectedFiles.has(index) ? 'border-stone-300' : 'border-white') }
                                        key={ value.pathname }
                                        onClick={ () => {
                                            const newSet = new Set<number>(selectedFiles);
                                            if (newSet.has(index))
                                                newSet.delete(index);
                                            else {
                                                if (fileCount === 'single')
                                                    newSet.clear();
                                                newSet.add(index);
                                            }
                                            setSelectedFiles(newSet);
                                        } }
                                    >
                                        {
                                            fileType === 'image'
                                            ?   <Image
                                                    src={ value.url }
                                                    width={ 96 }
                                                    height={ 96 }
                                                    alt={ value.pathname }
                                                    key={ value.pathname }
                                                    className='w-[96] h-[96]'
                                                />
                                            :   <p>{ value.pathname }</p>
                                        }
                                    </button>
                                )) }
                            </div>
                    }
                    {
                        (lastSelectedIndex !== undefined && files !== undefined) &&
                        <section className='flex'>
                            <Separator orientation='vertical' className='mx-4' />
                            <div className='w-64 flex-grow flex flex-col justify-between'>
                                <section className='grid gap-2'>
                                    <p>
                                        <strong>Name:</strong><br></br>
                                        { files[ lastSelectedIndex ].pathname }
                                    </p>
                                    <p>
                                        <strong>Size:</strong><br></br>
                                        { toFileSize(files[ lastSelectedIndex ].size) }
                                    </p>
                                    <div>
                                        <p><strong>URL:</strong></p>
                                        <div className='overflow-scroll w-64'>
                                            <code className='text-nowrap'>{ files[ lastSelectedIndex ].url }</code>
                                        </div>
                                    </div>
                                </section>
                                <Button onClick={ () => onSelected(files.filter((_, index) => selectedFiles.has(index))) }>Select</Button>
                            </div>
                        </section>
                    }
                </CardContent>
            </Card>
        </div>
    )
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