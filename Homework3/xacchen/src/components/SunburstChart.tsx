import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useResizeObserver, useDebounceCallback } from "usehooks-ts";

interface NodeData {
  name: string;
  color?: string;
  size?: number;
  children?: NodeData[];
}

type ChartProps = {
  data: NodeData;
};

export default function SunburstChart({ data }: ChartProps) {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 600, height: 600 });
  const [currentData, setCurrentData] = useState<NodeData>(data);
  const [history, setHistory] = useState<NodeData[]>([]); // Stack to store navigation history
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const onResize = useDebounceCallback((newSize: { width: number; height: number }) => {
    setSize(newSize);
  }, 200);

  useResizeObserver({ ref: chartRef, onResize });

  useEffect(() => {
    if (chartRef.current && size.width > 0 && size.height > 0) {
      d3.select(chartRef.current).selectAll("*").remove(); // Clear previous chart

      const width = size.width;
      const radius = Math.min(width, size.height) / 2;

      const partition = d3.partition<NodeData>().size([2 * Math.PI, radius]);

      const root = d3
        .hierarchy(currentData)
        .sum((d) => d.size || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      partition(root);

      const arc = d3
        .arc<d3.HierarchyRectangularNode<NodeData>>()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => d.y0)
        .outerRadius((d) => d.y1);

      const svg = d3
        .select(chartRef.current)
        .attr("viewBox", `0 0 ${width} ${size.height}`)
        .style("font", "12px sans-serif");

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${size.height / 2})`);

      // Tooltip setup
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "8px")
        .style("background", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

      g.selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
        .attr("d", arc as any)
        .style("fill", (d) => d.data.color || d3.schemeCategory10[d.depth % 10])
        .style("stroke", "#fff")
        .on("mouseover", (event, d) => {
          d3.select(event.currentTarget).style("opacity", 0.7);
          tooltip
            .style("visibility", "visible")
            .html(`<strong>${d.data.name}</strong><br>Value: ${d.value}`)
            .style("top", `${event.pageY}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", (event) => {
          d3.select(event.currentTarget).style("opacity", 1);
          tooltip.style("visibility", "hidden");
        })
        .on("click", (event, d) => {
          tooltip.style("visibility", "hidden"); // Hide tooltip on click
          if (d.children) {
            setHistory((prev) => [...prev, currentData]); // Push currentData to history stack
            setCurrentData(d.data); // Focus on clicked node, removing outer layers
          }
        })
        .append("title")
        .text((d) => `${d.data.name}: ${d.value}`);

      // Add central text to show current category and enable back navigation
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", size.height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "1.5rem")
        .style("font-weight", "bold")
        .style("cursor", "pointer")
        .text(currentData.name || "Root")
        .on("click", () => {
          if (history.length > 0) {
            const newHistory = [...history];
            const previousData = newHistory.pop(); // Remove last element from history
            setHistory(newHistory); // Update history stack
            setCurrentData(previousData!); // Go back to the previous layer
          }
        });
    }
  }, [currentData, size, history]);

  return <svg ref={chartRef} width="100%" height="100%" style={{ maxWidth: '35vw', maxHeight: '35vh' }}></svg>;
}
