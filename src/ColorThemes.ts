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
            "#ee99a0",
            "#f5a97f",
            "#eed49f",
            "#a6da95",
            "#8bd5ca",
            "#91d7e3",
            "#7dc4e4",
            "#b7bdf8",
            "#f4dbd6",
            "#f0c6c6",
            "#f5bde6",
            "#c6a0f6"
        ]
    }
};

export function getThemeColors(themeId: string): string[] {
    return THEMES[themeId]?.colors || THEMES['catppuccin']!.colors;
}