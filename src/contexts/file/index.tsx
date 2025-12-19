'use client';
import React from 'react';

import FileSelector from './fileSelector';

type fileTypes = 'image' | 'video' | 'font' | 'all';
type fileCount = 'single' | 'multiple' | 'none';
type selectFileFunctionType = (fileCount: fileCount, fileType?: fileTypes) => Promise<BlobInformation[]>;

const FileSelectorCTX = React.createContext<{
    selectFile: selectFileFunctionType
} | undefined>(undefined);

const useFileSelector = () => {
    const value = React.useContext(FileSelectorCTX);
    if (!value) throw new Error('useFileSelector must be used within a FileSelectorProvider');
    return value;
};

const FileSelectorProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [ visible, setVisibility ] = React.useState<boolean>(false);
    const [ fileCount, setFileCount ] = React.useState<fileCount>('single');
    const [ fileType, setFileType ] = React.useState<fileTypes>('image');
    const [ promise, setPromise ] = React.useState<{
        resolve: (value: BlobInformation[]) => void,
        reject: () => void
    }>({
        resolve: () => null,
        reject: () => null
    });
    

    const selectFile = React.useCallback((fileCount: fileCount, fileType: fileTypes = 'all') =>
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
        <FileSelectorCTX.Provider value={ { selectFile } }>
            <FileSelector fileCount={ fileCount } onSelected={ onSelected } fileType={ fileType } visible={ visible } />
            { children }
        </FileSelectorCTX.Provider>
    )
};

export { useFileSelector, FileSelectorProvider };