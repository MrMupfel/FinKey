export interface FinkeyTheme {
    id: string;
    name: string;
    colors: string[];
}

export const THEMES: Record<string, FinkeyTheme> = {
    'catppuccin': {
        id: 'catppuccin',
        name: 'catppuccin',
        colors: [
            "#ed8796",
            "#8aadf4",
            "#a6da95",
            "#ee99a0",
            "#7dc4e4",
            "#f4dbd6",
            "#8bd5ca",
            "#b7bdf8",
            "#f5a97f",
            "#f0c6c6",
            "#c6a0f6",
            "#eed49f",
            "#91d7e3",
            "#f5bde6",
        ]
    }
};

export function getThemeColors(themeId: string): string[] {
    return THEMES[themeId]?.colors || THEMES['catppuccin']!.colors;
}