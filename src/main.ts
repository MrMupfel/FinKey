import { Plugin } from 'obsidian';
import { SankeyProcessor } from './SankeyProcessor';
import { DEFAULT_SETTINGS, FinkeySettings } from './FinkeySettings';
import { FinkeySettingTab } from './FinkeySettingsTab';

export default class FinkeyPlugin extends Plugin {
    public settings!: FinkeySettings;

    async onload() {
        await this.loadSettings();

        const processor = new SankeyProcessor(this.app, this.settings);

        this.registerMarkdownCodeBlockProcessor(
            "finkey", 
            (source, el, ctx) => processor.process(source, el, ctx)
        );

        this.addSettingTab(new FinkeySettingTab(this.app, this))
    }

    onunload() {
    }

    async loadSettings() {
        // merges saved over defaults
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as FinkeySettings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}