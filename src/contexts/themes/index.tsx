'use client';
import React from 'react';
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
    const { config, updateConfig } = useConfig();

    const addTheme = React.useCallback(async (theme: Blob): Promise<string> => {
        const data = new FormData();
        data.append('theme', theme, 'theme.zip');

        const response = await themeActions.addTheme(data);
        
        if (!response.success)
            return 'Failed to add the theme: ' + response.reason;

        updateConfig({
            themes: [ ...config.themes, response.value.name ]
        }, false);

        return 'Successfully added the theme.';
    }, [ config, updateConfig ]);

    const removeTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await themeActions.removeTheme(name);

        if (!response.success)
            return 'Failed to remove the theme: ' + response.reason;

        updateConfig({
            themes: config.themes.filter(theme => theme !== name)
        }, false);
        
        return `${ name } has been deleted.`;
    }, [ config, updateConfig ]);

    const selectTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await themeActions.selectTheme(name);

        if (!response.success)
            return 'Failed to select the theme: ' + response.reason;

        updateConfig({ theme: name }, false);

        return `${ name } has been selected as the theme.`;
    }, [ updateConfig ]);

    return (
        <ThemesCTX.Provider value={ { addTheme, removeTheme, selectTheme, themes: config.themes, theme: config.theme } }>
            { children }
        </ThemesCTX.Provider>
    );
};

export { useThemes, ThemesProvider };