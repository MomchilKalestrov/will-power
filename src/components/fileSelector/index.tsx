'use client';
import React from 'react';

import FileSelector from './fileSelector';

type fileTypes = 'image' | 'video' | 'font';
type fileCount = 'single' | 'multiple' | 'none';
type selectFileFunctionType = (fileCount: fileCount, fileType?: fileTypes) => Promise<BlobInformation[]>;

const fileSelectorCTX = React.createContext<{
    selectFile: selectFileFunctionType
}>({
    selectFile: async () => []
});

const useFileSelector = () => React.useContext(fileSelectorCTX);

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
    

    const selectFile = React.useCallback((fileCount: fileCount, fileType: fileTypes = 'image') =>
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

export { useFileSelector, FileSelectorProvider, FileSelector };