'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

import { useConfig } from '@/contexts/config';

import * as themeActions from '@/lib/actions/theme';

const ThemesCTX = React.createContext<{
    themes: string[],
    theme: string,
    addTheme: ((theme: Blob) => Promise<string>);
    removeTheme: ((name: string) => Promise<string>);
    selectTheme: ((name: string) => Promise<string>);
} | undefined>(undefined);

const useThemes = () => {
    const value = React.useContext(ThemesCTX);
    if (!value) throw new Error('useThemes should be used within a ThemesProvider');
    return value;
};

const ThemesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const t = useTranslations('Contexts');
    const { config, updateConfig } = useConfig();

    const addTheme = React.useCallback(async (theme: Blob): Promise<string> => {
        const data = new FormData();
        data.append('theme', theme, 'theme.zip');

        const response = await themeActions.addTheme(data);
        
        if (!response.success)
            return t('failedAddTheme', { reason: response.reason });

        updateConfig({
            themes: [ ...config.themes, response.value.name ]
        }, false);

        return t('addedTheme');
    }, [ config, updateConfig, t ]);

    const removeTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await themeActions.removeTheme(name);

        if (!response.success)
            return t('failedRemoveTheme', { reason: response.reason });

        updateConfig({
            themes: config.themes.filter(theme => theme !== name)
        }, false);
        
        return t('deletedName', { name });
    }, [ config, updateConfig, t ]);

    const selectTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await themeActions.selectTheme(name);

        if (!response.success)
            return t('failedSelectTheme', { reason: response.reason });

        updateConfig({ theme: name }, false);

        return t('selectedTheme', { name });
    }, [ updateConfig, t ]);

    return (
        <ThemesCTX.Provider value={ { addTheme, removeTheme, selectTheme, themes: config.themes, theme: config.theme } }>
            { children }
        </ThemesCTX.Provider>
    );
};

export { useThemes, ThemesProvider };