// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 30, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG container for the chart
const svgTemp = d3.select("#lineChart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// 2.a: LOAD DATA
d3.csv("weather.csv").then(data => {
    // 2.b: TRANSFORM DATA
    data.forEach(d => {
        d.date = new Date(d.date);
        d.actual_mean_temp = +d.actual_mean_temp;
    });

    console.log("data:", data);

    const cityData = d3.group(data, d => d.city);
    const cities = Array.from(cityData.keys());

    const colorScale = d3.scaleOrdinal() // colors
        .domain(cities)
        .range(d3.schemeCategory10);

    const citySelect = d3.select("#citySelect"); // dropdown
    citySelect.selectAll("option")
        .data(cities)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d)
        .property("selected", true); // default - select all

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

    svgTemp.selectAll(".city-line")
        .data(cityData)
        .enter()
        .append("path")
        .attr("class", "city-line")
        .attr("d", d => line(d[1]))
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d[0]))
        .attr("stroke-width", 2);

    // 5.a ADD AXES FOR CHART 1
    svgTemp.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d/%y")));

    svgTemp.append("g")
        .call(d3.axisLeft(yScale));

    // 6.a: ADD LABELS FOR CHART 1
    svgTemp.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
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
    function updateLegend(legendData) {
        const legend = svgTemp.selectAll(".legend")
            .data(legendData, d => d[0]);

        legend.exit().remove(); // clear

        const legendEnter = legend.enter() // add new
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width - 120}, ${i * 20 + 165})`);

        legendEnter.append("rect")
            .attr("x", 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => colorScale(d[0]));

        legendEnter.append("text")
            .attr("x", 30)
            .attr("y", 7)
            .attr("text-anchor", "start")
            .style("alignment-baseline", "middle")
            .text(d => d[0]);

        legend.attr("transform", (d, i) => `translate(${width - 120}, ${i * 20 + 165})`); // update positions
    }

    updateLegend(Array.from(cityData)); // initial legend

    // interactivity - event listener
    citySelect.on("change", function() {
        const selectedCities = Array.from(this.selectedOptions, opt => opt.value);
        
        const filteredCityData = Array.from(cityData).filter(([city]) => selectedCities.includes(city)); // filter

        svgTemp.selectAll(".city-line")
            .style("opacity", d => selectedCities.includes(d[0]) ? 1 : 0); // show/hide lines

        updateLegend(filteredCityData); // update legend
    });
});
