'use client';
import React from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const DATE_TAG_REGEX = /v([2-9][0-9]{3}).((?:0[1-9])|(?:1[0-2])).((?:0[1-9])|(?:[12][0-9])|(?:3[0-1]))-((?:[01][0-9])|(?:2[0-4]))([0-5][0-9])/s;

type NewVersionButtonProps = {
    currentVersion: string;
};

const NewVersionButton: React.FC<NewVersionButtonProps> = ({ currentVersion }) => {
    const t = useTranslations('Admin.Stats');
    const [ isChecking, setIsChecking ] = React.useState<boolean>(false);

    const onClick = React.useCallback(async () => {
        setIsChecking(true);

        try {
            const response = fetch('https://gitlab.com/api/v4/projects/80766300/repository/tags');
            const [ { name: latestTag } ]: ({ name: string })[] = await (await response).json();

            const matches = latestTag.match(DATE_TAG_REGEX);
            if (!matches) return toast(t('malformedDateTag')); 

            const segmentedNewVersion = matches.map(Number).slice(1);
            const segmentedCurrentVersion = currentVersion.match(DATE_TAG_REGEX)!.map(Number).slice(1);
            for (let i = 0; i < segmentedCurrentVersion.length; i++)
                if (segmentedCurrentVersion[ i ] < segmentedNewVersion[ i ])
                    return toast(t('newVersionAvailable'));
            
        } catch (error) {
            toast(t('failedUpdateCheck'));
            console.error(error); // F*** it, we ball.
        } finally {
            setIsChecking(false);
        };

    }, [ currentVersion ]);

    if (!currentVersion.match(DATE_TAG_REGEX))
        return (<></>);

    return (
        <Button
            size='sm'
            variant='outline'
            disabled={ isChecking }
            onClick={ onClick }
        >
            { isChecking && <Spinner /> }
            { t('checkNewVersion') }
        </Button>
    );
};

export default NewVersionButton;