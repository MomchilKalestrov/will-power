import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    const defaultLocale = 'en';
    const localeCookie = (await cookies()).get('locale')?.value;
    const locale = localeCookie || defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
