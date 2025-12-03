'use client';
import React from 'react';
import { useConfig } from '@/components/configProvider';
import * as actions from '@/lib/actions/theme';


const ThemesCTX = React.createContext<{
    themes: string[],
    theme: string,
    addTheme: ((theme: Blob) => Promise<string>);
    removeTheme: ((name: string) => Promise<string>);
    selectTheme: ((name: string) => Promise<string>);
}>({
    themes: [],
    theme: 'There is no theme Provider!',
    addTheme: () => {
        throw new Error('There is no theme Provider!');
    },
    removeTheme: () => {
        throw new Error('There is no theme Provider!');
    },
    selectTheme: () => {
        throw new Error('There is no theme Provider!');
    }
});

const useThemes = () => React.useContext(ThemesCTX);

const ThemesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { config, updateConfig } = useConfig();

    const addTheme = React.useCallback(async (theme: Blob): Promise<string> => {
        const data = new FormData();
        data.append('theme', theme, 'theme.zip');

        const response = await actions.addTheme(data);
        
        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            themes: [ ...config.themes, response.name ]
        }, false);

        return 'Successfully added the theme.';
    }, [ config, updateConfig ]);

    const removeTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await actions.removeTheme(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

        updateConfig({
            themes: config.themes.filter(theme => theme !== name)
        }, false);
        
        return `${ name } has been deleted.`;
    }, [ config, updateConfig ]);

    const selectTheme = React.useCallback(async (name: string): Promise<string> => {
        const response = await actions.selectTheme(name);

        if (typeof response === 'string')
            return `Error: ${ response }.`;

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