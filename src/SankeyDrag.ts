import * as d3 from "d3";
import { D3DragEvent } from "d3";
import { sankeyLinkHorizontal, SankeyNode, SankeyLayout, SankeyGraph, SankeyLink } from "d3-sankey";
import { FinkeyLink, FinkeyNode } from "./SankeyParser";
import { FinkeySettings } from "./FinkeySettings";

export class SankeyDrag {
    public static setup (
        nodeElements: d3.Selection<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        linkElements: d3.Selection<SVGPathElement, SankeyLink<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        textElements: d3.Selection<SVGTextElement, SankeyNode<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        sankeyGenerator: SankeyLayout<SankeyGraph<FinkeyNode, FinkeyLink>, FinkeyNode, FinkeyLink>,
        graph: SankeyGraph<FinkeyNode, FinkeyLink>,
        width: number,
        settings: FinkeySettings,
        nodeWidth : number,
        container: HTMLElement,
        onDragEnd?: (positions: Record<string, { x: number, y: number }>) => Promise<void> | void
    ) {
        // type creates an alias
        type NodeDragEvent = D3DragEvent<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>, SankeyNode<FinkeyNode, FinkeyLink>>;
        
        // track continous mouse position independentl of snapped node to prevent stuttering
        const activeDrags = new Map<string, { rawX: number, rawY: number }>();

        const dragBehavior = d3.drag<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>>()
            .on("start", function (event: NodeDragEvent, d) {
                // "this" works because this is a classic function and not an arrow => function
                d3.select(this).style("cursor", "grabbing");
                
                // store start
                activeDrags.set(d.id, { rawX: d.x0!, rawY: d.y0!})

                d3.select(container)
                    .select(".finkey-grid-bg")
                    .transition()
                    .duration(200)
                    .attr("opacity", 1);

                linkElements.style("pointer-events", "none");
            })
            .on("drag", function (event: NodeDragEvent, d) {
                const state = activeDrags.get(d.id);
                if (!state) return;

                // update continous position
                state.rawX += event.dx;
                state.rawY += event.dy;

                // apply snapping logic
                const targetX = settings.snapToGrid? Math.round(state.rawX / nodeWidth) * nodeWidth : state.rawX;
                const targetY = settings.snapToGrid? Math.round(state.rawY / nodeWidth) * nodeWidth : state.rawY;

                // calculate node width and height to shift x1/y1
                const nodeW = d.x1! - d.x0!;
                const nodeH = d.y1! - d.y0!;

                // update underlying data
                d.x0 = targetX;
                d.x1 = targetX + nodeW;
                d.y0 = targetY;
                d.y1 = targetY + nodeH;

                // recalculate link paths
                sankeyGenerator.update(graph);

                // move rectangle
                d3.select(this)
                    .attr("x", d.x0)
                    .attr("y", d.y0);

                // redraw links
                linkElements
                    .attr("d", sankeyLinkHorizontal());

                // update text positions
                textElements
                    .attr("x", n => n.x0! < width / 2 ? n.x1! + 6 : n.x0! - 6)
                    .attr("y", n => (n.y1! + n.y0!) / 2)
                    .attr("text-anchor", n => n.x0! < width / 2 ? "start" : "end");
                
                textElements.selectAll<SVGTSpanElement, SankeyNode<FinkeyNode, FinkeyLink>>("tspan")
                    .attr("x", n => n.x0! < width / 2 ? n.x1! + 6 : n.x0! - 6);
            })
            .on("end", function (event: NodeDragEvent, d) {
                d3.select(this).style("cursor", "grab");

                // clean up drag state
                activeDrags.delete(d.id);

                d3.select(container)
                    .select(".finkey-grid-bg")
                    .transition()
                    .duration(200)
                    .attr("opacity", 0);
                
                linkElements.style("pointer-events", "stroke");

                if (onDragEnd) {
                    const positions: Record<string, { x: number, y: number }> = {};
                    for (const node of graph.nodes) {
                        positions[node.id] = {
                            x: Math.round(node.x0!),
                            y: Math.round(node.y0!)
                        };
                    }
                    void onDragEnd(positions);
                }
            });
        nodeElements.call(dragBehavior);
    }
}