'use server';
import { NextPage } from 'next';
import { redirect } from 'next/navigation';

const Page: NextPage<{
    searchParams: Promise<Record<string, string>>
}> = async ({ searchParams }) =>
    redirect('/admin/auth/login?' + new URLSearchParams(await searchParams).toString());

export default Page;