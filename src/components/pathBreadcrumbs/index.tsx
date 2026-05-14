'use client';
import React from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

type Props = {
    paths: string[];
    onClick: (name: string, index: number) => void;
};

const PathBreadcumbs: React.FC<Props> = ({ paths, onClick }) => (
    <Breadcrumb>
        <BreadcrumbList>
            { paths.map((path, index, { length }) => (
                <React.Fragment key={ 'path-' + index }>
                    <BreadcrumbItem>
                        <BreadcrumbLink onClick={ () => onClick(path, index) }>
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
);

export default PathBreadcumbs;