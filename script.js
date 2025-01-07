const width = 1000, height = 700;
const map = d3.select('#choroplethMap')

const colors = [
  [3, '#fcfce8'], [12, '#ffff00'], [21, '#ffcc00'], [30, '#ff9933'], [39, '#ff6600'], [48, '#ff5050'], [57, '#cc0066'], [66, '#660033']
]

const fillColor = (d) => {
  let revertedColors = [...colors].sort((a, b) => b[0] - a[0])
  for(var i = 0; i < revertedColors.length; i++) {
    if(d >= revertedColors[i][0]) return revertedColors[i][1]
  }
  return '#FFF'
}

const svg = map.append('svg')
  .attr('width', width)
  .attr('height', height)

const tooltip = map.append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0)

const drawGraph = (err, userEducation, county) => {
 
  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${width - 400}, 10)`)
  
  legend.selectAll('rect')
    .data(colors)
    .enter()
    .append('rect')
    .attr('fill', d => fillColor(d[0]))
    .attr('width', 40)
    .attr('height', 10)
    .attr('x', (d,i) => (41*i) + i)
  
  legend.selectAll('g')
    .data(colors)
    .enter()
    .append('g')
    .attr('transform', (d,i) => `translate(${41*i + i-1})`)
    .append('line')
    .attr('stroke', '#000')
    .attr('y1', 15)
  
  legend.selectAll('g')
    .append('text')
    .attr('x', -10)
    .attr('y', 25)
    .text(d => `${d[0]}%`)
    .style('font-size', 12)
  
  svg.selectAll('path')
  .data(topojson.feature(county, county.objects.counties).features)
  .enter()
  .append('path')
  .attr('fill', d => fillColor(educationPercentage(d)))
  .attr('d', d3.geoPath())
  .classed('county', true)
  .attr('data-fips', d => d.id)
  .attr('data-education', d => educationPercentage(d))
  .on('mouseover', mouseOverHandler)
  .on('mouseout', d => tooltip.style('opacity', 0))
  
  svg.append('path')
    .datum(topojson.mesh(county, county.objects.states, (a,b) => a !== b))
    .attr('class', 'states')
    .attr('d', d3.geoPath())
  
  function educationPercentage(d) {
    let result = userEducation.find(obj => obj.fips == d.id)
    if(result) return result.bachelorsOrHigher
    return 0
  }
  
  function mouseOverHandler(d) {
    tooltip.style('opacity', 0.9)
    tooltip.html(() => {
      let result = userEducation.find(obj => obj.fips == d.id)
      if(result) {
        return `${result['area_name']}, ${result['state']}: ${result.bachelorsOrHigher}%` 
      }
      return 0
    })
      .attr('data-education', () => educationPercentage(d))
      .style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY -28) + 'px')
  }
}

const userEducation = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
const county = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

const queue = d3.queue()
.defer(d3.json, userEducation)
.defer(d3.json, county)
.await(drawGraph)