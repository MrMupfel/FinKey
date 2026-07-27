import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode } from "d3-sankey";
import { FinkeyData, FinkeyNode, FinkeyLink } from "./SankeyParser";
import { SankeyToolTip } from "./SankeyTooltip";
import { SankeyDrag } from "./SankeyDrag";
import { FinkeySettings } from "./FinkeySettings";
import { getThemeColors } from "./ColorThemes";

export class SankeyRenderer {
    public static render(
        data: FinkeyData,
        container: HTMLElement,
        settings: FinkeySettings,
        onDragEnd?: (positions: Record<string, { x: number, y: number }>) => Promise<void> | void
    ): () => void {
        const width = 600;
        const height = 400;
        const nodeWidth = 10;

        const margin = { top: 20, bottom: 20, left: 0, right: 0 };

        container.classList.add("finkey-container");

        const svg = d3.select(container)
            .append("svg")
            .attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("max-width", "100%")
            .style("height", "auto");

        const defs = svg.append("defs");

        // Background grid
        if (settings.snapToGrid) {
            const defs = svg.append("defs");

            const pattern = defs.append("pattern")
                .attr("id", "finkey-grid")
                .attr("width", nodeWidth)
                .attr("height", nodeWidth)
                .attr("patternUnits", "userSpaceOnUse");

            pattern.append("path")
                .attr("d", `M ${nodeWidth} 0 L 0 0 0 ${nodeWidth}`)
                .attr("fill", "none")
                .attr("stroke", "var(--background-modifier-border)") // Obsidian native subtle border color
                .attr("stroke-width", "1")
                .attr("opacity", 0.5);

            svg.append("rect")
                .attr("class", "finkey-grid-bg")
                .attr("width", "100%")
                .attr("height", height)
                .attr("fill", "url(#finkey-grid)")
                .attr("opacity", 0)
                .style("pointer-events", "none");
        }

        const toolTip = new SankeyToolTip(container);

        const sankeyGenerator = sankey<FinkeyNode, FinkeyLink>()
            .nodeId(d => d.id)
            .nodeWidth(nodeWidth)
            .nodePadding(20)
            .extent([
                [margin.left, margin.top],
                [width - margin.right, height - margin.bottom]]
            )
            .nodeSort(settings.disableRelaxation ? null : undefined);

        // could also add linkSort(null) and iterations(0)

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

        // color theme setup
        const themeColors = getThemeColors(settings.colorTheme);
        const colorScale = d3.scaleOrdinal<string, string>().range(themeColors);

        type LayoutNode = SankeyNode<FinkeyNode, FinkeyLink>;

        const linkGradients = defs.selectAll("linearGradient.link-gradient")
            .data(graph.links)
            .enter()
            .append("linearGradient")
            .attr("class", "link-gradient")
            // unique and sanitized ids
            .attr("id", d => {
                const source = d.source as LayoutNode;
                const target = d.target as LayoutNode;
                return `gradient-${source.id.replace(/\s+/g, '-')}-${target.id.replace(/\s+/g, '-')}`;
            })
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => (d.source as LayoutNode).x1!)
            .attr("x2", d => (d.target as LayoutNode).x0!);
        
        // gradient start
        linkGradients.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => colorScale((d.source as LayoutNode).id));

        linkGradients.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => colorScale((d.target as LayoutNode).id));

        // links
        const linkElements = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .selectAll("path")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("stroke", d => {
                const source = d.source as LayoutNode;
                const target = d.target as LayoutNode;
                const gradientId = `gradient-${source.id.replace(/\s+/g, '-')}-${target.id.replace(/\s+/g, '-')}`;
                return `url(#${gradientId})`;
            })
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
            .attr("fill", d => colorScale(d.id))
            .attr("opacity", 0.9)
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

        SankeyDrag.setup(
            nodeElements,
            linkElements,
            textElements, 
            sankeyGenerator, 
            graph, 
            width,
            settings,
            nodeWidth,
            container, 
            onDragEnd
        );

        return () => {
            // this will eventually hold the .disconnect for a resize observer
        };
    }
}