const _ = require('underscore');

// d3 requirements
const d3Color = require('d3-color');
const d3Scale = require('d3-scale');

function setupGraphSimple(tornadoData, graphWidth, graphHeight, maxDepth) {
  const yAxisCount = tornadoData.length;
  const xAxisCount = tornadoData[0].counts.length;

  const graphMaterial = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, color: 'rgb(49, 130, 189)', wireframe: true});
  const allCounts = _.flatten(_.pluck(tornadoData, 'counts'))
  const maxCount = _.max(allCounts);
  const heightScale = d3Scale.scaleLinear()
    .domain([0, maxCount])
    .range([0, maxDepth - 10]) // add some padding

  const colorScale = d3Scale.scaleLinear()
    .domain([0, maxCount/2])
    .range(['rgb(198, 219, 239)', 'rgb(49, 130, 189)'])

  // create shape for 3D graph
  const graphGeometry = new THREE.PlaneGeometry(graphWidth, graphHeight, xAxisCount-1, yAxisCount-1);


  _.each(graphGeometry.vertices, function(vertex, i) {
    vertex.z = heightScale(allCounts[i]);
  })

  // This is what we pass into the scene
  return new THREE.Mesh(graphGeometry, graphMaterial);
}

module.exports = setupGraphSimple
