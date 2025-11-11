import React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Rat } from 'lucide-react';

type Props = {
    directoryNode: fileNode;
    files: Record<string, BlobInformation>;
    selectedFiles: Set<string>;
    onFileSelect: (path: string) => void;
    onDirectorySelect: (name: string) => void;
    path: string;
};

type fileNode = {
    isFile: boolean;
    children?: Record<string, fileNode>;
};

const formats: Record<string, string[]> = {
    image: [ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp' ],
    video: [ 'mp4', 'webm', 'ogg' ],
    font: [ 'ttf', 'otf', 'woff', 'woff2' ]
};

const DirectoryViewer: React.FC<Props> = ({
    directoryNode,
    files,
    selectedFiles,
    onFileSelect,
    onDirectorySelect,
    path
}) => (
    Object.keys(directoryNode.children || {}).length === 0
    ?   <div className='w-full h-full flex justify-center items-center flex-col opacity-30'>
            <Rat className='size-27' />
            <p className='text-xl'>No files here...</p>
        </div>
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

export default DirectoryViewer;