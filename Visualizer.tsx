import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink, ConceptNode, ConceptLink } from '../types';

interface VisualizerProps {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

const Visualizer: React.FC<VisualizerProps> = ({ nodes, links }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 600;

    // Process data for D3 (clone to avoid mutation issues in React strict mode)
    const d3Nodes: GraphNode[] = nodes.map(n => ({ ...n }));
    const d3Links: GraphLink[] = links.map(l => ({ ...l }));

    // Color scale based on node type
    const colorScale = (type: string) => {
      switch (type) {
        case 'core': return '#3b82f6'; // Blue
        case 'risk': return '#ef4444'; // Red
        case 'opportunity': return '#10b981'; // Green
        case 'action': return '#f59e0b'; // Amber
        default: return '#9ca3af';
      }
    };

    const simulation = d3.forceSimulation(d3Nodes)
      .force("link", d3.forceLink(d3Links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add arrows
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#6b7280")
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg.append("g")
      .attr("stroke", "#4b5563")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(d3Nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node circles
    nodeGroup.append("circle")
      .attr("r", 12)
      .attr("fill", d => colorScale(d.type))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Node labels
    nodeGroup.append("text")
      .text(d => d.label)
      .attr("x", 15)
      .attr("y", 4)
      .attr("fill", "#e5e7eb")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .style("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    // Link labels
    const linkText = svg.append("g")
      .selectAll("text")
      .data(d3Links)
      .join("text")
      .text(d => d.relationship)
      .attr("font-size", "10px")
      .attr("fill", "#9ca3af")
      .attr("text-anchor", "middle");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      nodeGroup
        .attr("transform", d => `translate(${d.x},${d.y})`);

      linkText
        .attr("x", d => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", d => ((d.source as any).y + (d.target as any).y) / 2);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return (
    <div className="w-full h-[600px] bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden relative backdrop-blur-sm">
      <div className="absolute top-4 left-4 flex gap-4 text-xs z-10">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Core</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Risk</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Opportunity</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Action</div>
      </div>
      <svg ref={svgRef} className="w-full h-full cursor-move"></svg>
    </div>
  );
};

export default Visualizer;