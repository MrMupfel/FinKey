import { App, PluginSettingTab, Setting } from "obsidian";
import type FinkeyPlugin from "./main";
import { DEFAULT_SETTINGS } from "./FinkeySettings";

export class FinkeySettingTab extends PluginSettingTab {
    plugin: FinkeyPlugin;

    constructor(app: App, plugin: FinkeyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Color themes')
            .setHeading();

        new Setting(containerEl)
            .setName('Themes')
            .setDesc('Choose color palette for nodes and flows.')
            .addDropdown(dropdown => dropdown
                .addOption('catppuccin', 'Catppuccin')
                .setValue(this.plugin.settings.colorTheme)
                .onChange(async (value) => {
                    this.plugin.settings.colorTheme = value;
                    await this.plugin.saveSettings();
                })
            );
        
        new Setting(containerEl)
            .setName('Font color and size')
            .setHeading();
        
        new Setting(containerEl)
            .setName('Node names')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.nodeNameColor)
                .onChange(async (value) => {
                    this.plugin.settings.nodeNameColor = value;
                    await this.plugin.saveSettings();
                })
            )
            .addText(text => text 
                .setPlaceholder('Font size (px)')
                .setValue(String(this.plugin.settings.nodeNameFontSize))
                .onChange(async (value) => {
                    const parsedValue = Number(value);
                    if (!isNaN(parsedValue) && value.trim() !== '') {
                        this.plugin.settings.nodeNameFontSize = parsedValue;
                        await this.plugin.saveSettings();
                    }
                })
            )
            .addExtraButton(btn => btn
                .setIcon('reset')
                .setTooltip('Reset to default')
                .onClick(async () => {
                    this.plugin.settings.nodeNameColor = DEFAULT_SETTINGS.nodeNameColor;
                    this.plugin.settings.nodeNameFontSize = DEFAULT_SETTINGS.nodeNameFontSize;
                    await this.plugin.saveSettings();

                    this.display();
                })
            );
        
        new Setting(containerEl)
            .setName('Balance')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.balanceColor)
                .onChange(async (value) => {
                    this.plugin.settings.balanceColor = value;
                    await this.plugin.saveSettings();
                })
            )
            .addText(text => text
                .setPlaceholder('Font size (px)')
                .setValue(String(this.plugin.settings.balanceFontSize))
                .onChange(async (value) => {
                    const parsedValue = Number(value);
                    if (!isNaN(parsedValue) && value.trim() !== '') {
                        this.plugin.settings.balanceFontSize = parsedValue;
                        await this.plugin.saveSettings();
                    }
                })
            )
            .addExtraButton(btn => btn
                .setIcon('reset')
                .setTooltip('Reset to default')
                .onClick(async () => {
                    this.plugin.settings.balanceColor = DEFAULT_SETTINGS.balanceColor;
                    this.plugin.settings.balanceFontSize = DEFAULT_SETTINGS.balanceFontSize;
                    await this.plugin.saveSettings();

                    this.display();
                })
            );

        new Setting(containerEl)
            .setName('Flow design')
            .setHeading();
        
        new Setting(containerEl)
            .setName('Disable auto relaxation')
            .setDesc('Nodes will appear in the vertical order they are written. Can help with initial alignment if flows are tangled.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.disableRelaxation)
                .onChange(async (value) => {
                    this.plugin.settings.disableRelaxation = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('Snap to grid')
            .setDesc('Enable accurate positioning via grid')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.snapToGrid)
                .onChange(async (value) => {
                    this.plugin.settings.snapToGrid = value;
                    await this.plugin.saveSettings();
                })
            );
    }
}