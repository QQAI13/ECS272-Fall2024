import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DepressionBarChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Set up dimensions and margins
    const margin = { top: 60, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear any previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare the data for stacked bars
    const keys = ['depression_count', 'no_depression_count'];
    const stackedData = d3.stack().keys(keys)(data);

    // Set up x scale for CGPA categories
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.cgpa))
      .range([0, width])
      .padding(0.2);

    // Set up y scale for number of students
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.depression_count + d.no_depression_count)])
      .nice()
      .range([height, 0]);

    // Set up color scale
    const color = d3
      .scaleOrdinal()
      .domain(keys)
      .range(['#ff7f7f', '#7fbf7f']); // Red for depression, green for no depression

    // Add x-axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Add y-axis
    svg.append('g').call(d3.axisLeft(y));

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

    // Draw the bars with tooltip functionality
    svg
      .selectAll('g.layer')
      .data(stackedData)
      .join('g')
      .attr('class', 'layer')
      .attr('fill', d => color(d.key))
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => x(d.data.cgpa))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on("mouseover", (event, d) => {
        const key = d3.select(event.currentTarget.parentNode).datum().key;
        const label = key === 'depression_count' ? 'With Depression' : 'No Depression';
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

    // Add legend above the chart
    const legend = svg
      .append('g')
      .attr('transform', `translate(0, -40)`); // Position above the chart

    const legendData = [
      { color: color('depression_count'), label: 'With Depression' },
      { color: color('no_depression_count'), label: 'No Depression' },
    ];

    legendData.forEach((item, i) => {
      const legendGroup = legend
        .append('g')
        .attr('transform', `translate(${i * 180 + 20}, 0)`); // Space out the legend items

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

  }, [data]);

  return <div ref={chartRef}></div>;
};

export default DepressionBarChart;
