import * as d3 from "d3";
import { D3DragEvent } from "d3";
import { sankeyLinkHorizontal, SankeyNode, SankeyLayout, SankeyGraph, SankeyLink } from "d3-sankey";
import { FinkeyLink, FinkeyNode } from "./SankeyParser";

export class SankeyDrag {
    public static setup (
        nodeElements: d3.Selection<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        linkElements: d3.Selection<SVGPathElement, SankeyLink<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        textElements: d3.Selection<SVGTextElement, SankeyNode<FinkeyNode, FinkeyLink>, SVGElement, unknown>,
        sankeyGenerator: SankeyLayout<SankeyGraph<FinkeyNode, FinkeyLink>, FinkeyNode, FinkeyLink>,
        graph: SankeyGraph<FinkeyNode, FinkeyLink>,
        width: number,
        onDragEnd?: (positions: Record<string, { x: number, y: number }>) => Promise<void> | void
    ) {
        type NodeDragEvent = D3DragEvent<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>, SankeyNode<FinkeyNode, FinkeyLink>>;
        
        const dragBehavior = d3.drag<SVGRectElement, SankeyNode<FinkeyNode, FinkeyLink>>()
            .on("start", function (event: NodeDragEvent) {
                d3.select(this).style("cursor", "grabbing");
            })
            .on("drag", function (event: NodeDragEvent, d) {
                // update underlying data
                d.x0! += event.dx;
                d.x1! += event.dx;
                d.y0! += event.dy;
                d.y1! += event.dy;

                // recalculate link paths
                sankeyGenerator.update(graph);

                // move rectangle
                d3.select(this)
                    .attr("x", d.x0!)
                    .attr("y", d.y0!);

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