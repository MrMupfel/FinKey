// Blueprints
export interface FinkeyNode {
    id: string;
    x?: number;
    y?: number;
}

export interface FinkeyLink {
    source: string;
    target: string;
    value: number;
}

export interface FinkeyData {
    nodes: FinkeyNode[];
    links: FinkeyLink[];
}

export class SankeyParser {
    public static parse(input: string): FinkeyData {
        const uniqueNodes = new Set<string>();
        const links: FinkeyLink[] = [];

        let savedPositions: Record<string, { x: number, y: number }> = {};

        const lines = input.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]?.trim();

            if (line?.startsWith('// @positions:')){
                const jsonString = line.replace('// @positions:', '').trim();
                try {
                    savedPositions = JSON.parse(jsonString) as Record<string,{ x: number, y: number }> ;
                } catch (e) {
                    console.warn("Finkey: Failed to parse saved positions", e)
                }
                continue;
            }

            if (!line || line.startsWith('//')) {
                continue;
            }

            const match = line.match(/(.+?)\s*->\s*(.+?)\s*:\s*(\d+(\.\d+)?)/);

            if (match && match[1] && match[2] && match[3]) {
                const source = match[1]?.trim();
                const target = match[2]?.trim();
                const value = parseFloat(match[3]);

                uniqueNodes.add(source);
                uniqueNodes.add(target);
                links.push({ source, target, value })
            } else {
                throw new Error(`Syntax error on line ${i + 1}: "${line}". Expected Format: Source -> Target : Value`);
            }
        }

        // convert Set of unique strings into array of SankeyNode Objects
        const nodes: FinkeyNode[] = Array.from(uniqueNodes).map(id => {
            const pos = savedPositions[id];
            return { 
                id : id,
                x: pos?.x,
                y: pos?.y
            };
        });

        return { nodes, links };
    }
}


