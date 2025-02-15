// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svgTemp = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2.a: LOAD...
d3.csv("weather.csv").then(data => {
    // 2.b: ... AND TRANSFORM DATA
    data.forEach(d => {
        d.date = new Date(d.date);
        d.actual_mean_temp = +d.actual_mean_temp;
    });

    console.log("data:", data);

    const cityData = d3.group(data, d => d.city);
            
    // 3.a: SET SCALES FOR CHART 1
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.actual_mean_temp) - 5, d3.max(data, d => d.actual_mean_temp) + 5])
        .range([height, 0]);

    // 4.a: PLOT DATA FOR CHART 1
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.actual_mean_temp));

    svgTemp.selectAll("path")
        .data(cityData)
        .enter()
        .append("path")
        .attr("d", d => line(d[1]))
        .attr("fill", "none")
        .attr("stroke", (d, i) => d3.schemeCategory10[i])
        .attr("stroke-width", 2);

    // 5.a: ADD AXES FOR CHART 1
    svgTemp.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d/%y")));

    svgTemp.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    svgTemp.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 20)
        .text("Average Temperature Over Time by City")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold");

    svgTemp.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    svgTemp.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text("Average Temperature (°F)");

    // legend
    const legend = svgTemp.selectAll(".legend")
        .data(cityData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 120}, ${i * 20 + 165})`);

    legend.append("rect")
        .attr("x", 10)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d, i) => d3.schemeCategory10[i]);

    legend.append("text")
        .attr("x", 30)
        .attr("y", 7)
        .attr("text-anchor", "start")
        .style("alignment-baseline", "middle")
        .text(d => d[0]);
});
