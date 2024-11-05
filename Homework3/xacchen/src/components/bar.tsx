import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type NodeData = {
  name: string;
  color: string;
  size?: number;
  children?: NodeData[];
};

type SunburstProps = {
  data: NodeData;
};

const SunburstChart: React.FC<SunburstProps> = ({ data }) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Clear any existing SVG content
      d3.select(chartRef.current).selectAll("*").remove();

      const width = 500;
      const radius = width / 2;

      const partition = d3.partition<NodeData>().size([2 * Math.PI, radius]);

      const root = d3
        .hierarchy(data)
        .sum((d) => d.size || 0)
        .sort((a, b) => b.value! - a.value!);

      partition(root);

      const arc = d3
        .arc<d3.HierarchyRectangularNode<NodeData>>()
        .startAngle((d) => d.x0)
        .endAngle((d) => d.x1)
        .innerRadius((d) => d.y0)
        .outerRadius((d) => d.y1);

      const svg = d3
        .select(chartRef.current)
        .attr("viewBox", `0 0 ${width} ${width}`)
        .style("font", "12px sans-serif");

      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${width / 2})`);

      // Add paths
      const path = g
        .selectAll("path")
        .data(root.descendants().slice(1))
        .enter()
        .append("path")
        .attr("d", arc as any)
        .style("fill", (d) => d.data.color)
        .style("stroke", "#fff")
        .style("stroke-width", "1px")
        .on("click", (event, d) => {
          console.log(`${d.data.name} clicked`);
          d3.select(chartRef.current)
            .transition()
            .duration(750)
            .call(() => {
              g.selectAll("path").transition().attrTween("d", function (d) {
                const interpolate = d3.interpolate(d.y0, d.depth === 0 ? radius : d.y1);
                return function (t) {
                  d.y1 = interpolate(t);
                  return arc(d) as string;
                };
              });
            });
        })
        .append("title")
        .text((d) => `${d.data.name}: ${d.value}`);

      // Add labels
      g.selectAll("text")
        .data(root.descendants().filter(d => d.depth > 0 && (d.x1 - d.x0) > 0.03))
        .enter()
        .append("text")
        .attr("transform", function (d) {
          const angle = ((d.x0 + d.x1) / 2) * (180 / Math.PI) - 90;
          return `rotate(${angle}) translate(${(d.y0 + d.y1) / 2},0)${angle > 90 ? "rotate(180)" : ""}`;
        })
        .attr("dx", "-1.5em")
        .attr("dy", ".5em")
        .text(d => d.data.name)
        .style("font-size", "10px")
        .style("text-anchor", d => ((d.x0 + d.x1) / 2) * (180 / Math.PI) > 180 ? "end" : "start");
    }
  }, [data]);

  return <svg ref={chartRef} width={500} height={500}></svg>;
};

export default SunburstChart;
