import { type NextPage } from 'next';
import { getTranslations } from 'next-intl/server';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

import { getAdapter } from '@/lib/actions/blob/internal';
import { getBlobList } from '@/lib/actions/blob';

import NewVersionButton from './newVersionCheck';

const toShorten = (value: number) => {
    const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];
    for (var i = 0; value > 1024 && i < units.length; i++)
        value /= 1024;
    return value.toFixed(2) + ' ' + units[ i ];
};

const Page: NextPage = async () => {
    const t = await getTranslations('Admin.Stats');
    const blobAdapter = await getAdapter();
    const blobListResponse = await getBlobList();

    return (
        <>
            <header className='h-16 px-4 border-b bg-background flex justify-between items-center gap-4'>
                <h2 className='font-bold text-xl capitalize'>{ t('headerTitle') }</h2>
                <div id='components-portal' />
            </header>
            <main className='flex gap-2 flex-col overflow-y-scroll p-8 h-[calc(100dvh-var(--spacing)*16)]'>
                <Table>
                    <colgroup>
                        <col span={ 1 } className='w-auto' />
                        <col span={ 1 } className='w-full' />
                    </colgroup>
                    <TableBody className='grid-cols-[auto_1fr]'>
                        <TableRow>
                            <TableCell>
                                <strong>{ t('version') }: </strong>
                            </TableCell>
                            <TableCell className='flex items-center gap-4'>
                                <p>{ process.env.VERSION ?? 'Unknown' }</p>
                                <NewVersionButton currentVersion={ process.env.VERSION ?? t('unknown') } />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>{ t('marketplace') }: </strong>
                            </TableCell>
                            <TableCell className='flex items-center'>
                                { process.env.NEXT_PUBLIC_MARKETPLACE_URL ?? t('defaultMarketplace') }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>{ t('adapterType') }: </strong>
                            </TableCell>
                            <TableCell className='flex items-center'>
                                { blobAdapter.type }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>{ t('blobSize') }: </strong>
                            </TableCell>
                            <TableCell className='flex items-center'>
                                {
                                    blobListResponse.success
                                    ?   toShorten(blobListResponse.value.reduce((acc, { size }) => acc + size, 0))
                                    :   t('unknown')
                                }
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>{ t('environment') }: </strong>
                            </TableCell>
                            <TableCell className='flex items-center'>
                                {
                                    process.env.IN_DOCKER
                                    ?   'Docker'
                                    :   process.env.VERCEL
                                        ?   'Vercel'
                                        :   t('unknown')
                                }
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </main>
        </>
    )
};

export default Page;