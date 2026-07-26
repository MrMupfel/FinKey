export interface FinkeySettings {
    disableRelaxation: boolean;
    snapToGrid: boolean;
    colorTheme: string;
}

export const DEFAULT_SETTINGS: FinkeySettings = {
    disableRelaxation: false,
    snapToGrid: false,
    colorTheme: 'catppuccin'
};