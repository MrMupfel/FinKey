import { App, PluginSettingTab, Setting } from "obsidian";
import type FinkeyPlugin from "./main";

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