import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { FinkeyData, FinkeyNode, FinkeyLink } from "./SankeyParser";
import { SankeyToolTip } from "./SankeyTooltip";
import { SankeyDrag } from "./SankeyDrag";

export class SankeyRenderer {
    public static render(
        data: FinkeyData, 
        container: HTMLElement,
        onDragEnd?: (positions: Record<string, { x: number, y: number }>) => Promise<void> | void
    ): () => void {
        const width = 600;
        const height = 400;

        const margin = { top: 20, bottom: 20, left: 0, right: 0 };

        container.classList.add("finkey-container");

        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("max-width", "100%")
            .style("height", "auto");

        const toolTip = new SankeyToolTip(container);

        const sankeyGenerator = sankey<FinkeyNode, FinkeyLink>()
            .nodeId(d => d.id)
            .nodeWidth(10)
            .nodePadding(20)
            .extent([
                [margin.left, margin.top], 
                [width - margin.right, height - margin.bottom]]
            );

        const graph = sankeyGenerator({
            nodes: data.nodes.map(d => ({ ...d })),
            links: data.links.map(d => ({ ...d }))
        });

        let hasSavedPositions = false;
        for (const node of graph.nodes) {
            if (node.x !== undefined && node.y !== undefined) {
                const currentWidth = node.x1! - node.x0!;
                const currentHeight = node.y1! - node.y0!;

                node.x0 = node.x;
                node.x1 = node.x + currentWidth;
                node.y0 = node.y;
                node.y1 = node.y + currentHeight;

                hasSavedPositions = true;
            }
        }

        if (hasSavedPositions) {
            sankeyGenerator.update(graph);
        }

        const balanceFormatter = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            signDisplay: "exceptZero"
        });

        // links
        const linkElements = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "var(--text-muted)")
            .attr("stroke-opacity", 0.3)
            .selectAll("path")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width!))
            .on("mouseover", toolTip.show)
            .on("mousemove", toolTip.move)
            .on("mouseout", toolTip.hide);

        // nodes
        const nodeElements = svg.append("g")
            .selectAll("rect")
            .data(graph.nodes)
            .enter()
            .append("rect")
            .attr("x", d => d.x0!)
            .attr("y", d => d.y0!)
            .attr("height", d => Math.max(1, d.y1! - d.y0!))
            .attr("width", d => d.x1! - d.x0!)
            .attr("fill", "var(--interactive-accent)")
            .attr("opacity", 0.8)
            .style("cursor", "grab");
        // .attr("rx", 2);

        // node labels
        const textElements = svg.append("g")
            .style("font-family", "var(--font-interface)")
            .style("font-size", "10px")
            .style("fill", "var(--text-normal)")
            .selectAll("text")
            .data(graph.nodes)
            .enter()
            .append("text")
            .attr("x", d => d.x0! < width / 2 ? d.x1! + 6 : d.x0! - 6)
            .attr("y", d => (d.y1! + d.y0!) / 2)
            .attr("dy", "0.35em") // centers the text
            .attr("text-anchor", d => d.x0! < width / 2 ? "start" : "end")
            .attr("dy", "-0.1em");

        // node label
        textElements.append("tspan")
            .text(d => d.id);

        // balance
        textElements.append("tspan")
            .attr("x", d => d.x0! < width / 2 ? d.x1! + 6 : d.x0! - 6)
            .attr("dy", "1.2em")
            .style("fill", "var(--text-muted)")
            .text(d => {
                const flowIn = d.targetLinks?.reduce((sum, link) => sum + link.value, 0) || 0;
                const flowOut = d.sourceLinks?.reduce((sum, link) => sum + link.value, 0) || 0;
                const rawBalance = flowIn - flowOut;
                return balanceFormatter.format(rawBalance);
            });
        
        SankeyDrag.setup(nodeElements, linkElements, textElements, sankeyGenerator, graph, width, onDragEnd);

        return () => {
            // this will eventually hold the .disconnect for a resize observer
        };
    }
}