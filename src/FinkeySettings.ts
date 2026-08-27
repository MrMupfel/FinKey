export interface FinkeySettings {
    disableRelaxation: boolean;
    snapToGrid: boolean;
    colorTheme: string;
    nodeNameFontSize: number;
    nodeNameColor: string;
    balanceFontSize: number;
    balanceColor: string;
}

export const DEFAULT_SETTINGS: FinkeySettings = {
    disableRelaxation: false,
    snapToGrid: false,
    colorTheme: 'catppuccin',
    nodeNameFontSize: 13,
    nodeNameColor: '#cad3f5',
    balanceFontSize: 10,
    balanceColor: '#a5adcb'
};