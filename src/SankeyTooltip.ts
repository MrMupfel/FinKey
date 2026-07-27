import * as d3 from "d3";
import { FinkeyNode } from "./SankeyParser";

export class SankeyToolTip {
    private tooltipEl : HTMLDivElement;
    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.tooltipEl = container.createDiv({ cls: "finkey-tooltip "});
    }

    public show = (event: MouseEvent, d: unknown) => {
        this.tooltipEl.classList.add("is-visible");
        d3.select(event.currentTarget as SVGElement).attr("stroke-opacity", 0.6);
    };

    public hide = (event: MouseEvent) => {
        this.tooltipEl.classList.remove("is-visible");
        d3.select(event.currentTarget as SVGElement).attr("stroke-opacity", 0.5);
    };

    public move = (event: MouseEvent, d: unknown) => {
        const link = d as { source: FinkeyNode; target: FinkeyNode, value: number};

        const sourceNode = link.source;
        const targetNode = link.target;

        this.tooltipEl.empty();
        this.tooltipEl.createEl("strong", {
            text: `${sourceNode.id} → ${targetNode.id}`
        });
        this.tooltipEl.createEl("br");
        this.tooltipEl.appendText(`Flow: ${link.value}`)

        const [x, y] = d3.pointer(event, this.container);

        this.tooltipEl.setCssProps({
            "--tooltip-x": `${x + 15}px`,
            "--tooltip-y": `${y + 15}px`
        });
    };
}