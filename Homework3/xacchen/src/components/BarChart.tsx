import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DepressionBarChart = ({ data, selectedMetric }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Dimensions and margins
    const margin = { top: 60, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // SVG container
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Extract data for selected metric
    const metricYesKey = `${selectedMetric}_yes`;
    const metricNoKey = `${selectedMetric}_no`;
    const chartData = data.map(d => ({
      cgpa: d.cgpa,
      yes: d[metricYesKey] || 0,
      no: d[metricNoKey] || 0,
    }));

    // Stack layout
    const keys = ['yes', 'no'];
    const stackedData = d3.stack().keys(keys)(chartData);

    // X and Y scales
    const x = d3
      .scaleBand()
      .domain(chartData.map(d => d.cgpa))
      .range([0, width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, d => d.yes + d.no)])
      .nice()
      .range([height, 0]);

    // Colors for bars
    const color = d3.scaleOrdinal().domain(keys).range(['#ff7f7f', '#7fbf7f']); 

    // Draw X-axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Draw Y-axis
    svg.append('g').call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("padding", "8px")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

    // Draw bars
    svg
      .selectAll('g.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.cgpa))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on("mouseover", (event, d) => {
        const key = d3.select(event.currentTarget.parentNode).datum().key;
        const label = key === 'yes' ? `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: Yes` : `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: No`;
        tooltip
          .html(`<strong>${label}</strong><br>Count: ${d[1] - d[0]}`)
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Draw legend
    const legend = svg.append('g').attr('transform', `translate(0, -40)`);
    const legendData = [
      { color: color('yes'), label: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: Yes` },
      { color: color('no'), label: `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: No` },
    ];
    
    legendData.forEach((item, i) => {
      const legendGroup = legend
        .append('g')
        .attr('transform', `translate(${i * 200 + 20}, 0)`);

      legendGroup
        .append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', item.color);

      legendGroup
        .append('text')
        .attr('x', 24)
        .attr('y', 9)
        .attr('dy', '0.35em')
        .style('text-anchor', 'start')
        .style('fill', '#333')
        .text(item.label);
    });

  }, [data, selectedMetric]);

  return <div ref={chartRef}></div>;
};

export default DepressionBarChart;
