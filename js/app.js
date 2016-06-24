// TODO: Labels
// TODO: buttons with specific "views"
// TODO: Lines for each 'row' of data
// TODO: "Average" line

const OrbitControls = require('three-orbit-controls')(THREE)

const TornadoGroups = require('./tornado_data_handler');
const setupGrid = require('./setup_grid');
const setupGraph = require('./setup_graph');
const setupGraphSimple = require('./setup_graph_simple');

function draw(tornadoData) {
  const graphWidth = 500;
  const graphHeight = 800;
  const maxDepth = 300;

  // ********* CREATE GRAPH LINES *********
  // TODO

  // ********** THREEJS SETUP/RENDERING **********
  const scene = new THREE.Scene();
  window.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 4000);

  const gridObject = setupGrid(tornadoData, graphWidth, graphHeight, maxDepth);
  //const graphMesh = setupGraph(tornadoData, graphWidth, graphHeight, maxDepth);
  const graphMesh = setupGraphSimple(tornadoData, graphWidth, graphHeight, maxDepth);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('container') });
  renderer.setClearColor('rgb(31, 36, 41)', 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //document.body.appendChild(renderer.domElement);

  scene.add(graphMesh);
  //scene.add(gridObject);

  camera.position.z = graphHeight*2;

  const render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render();

  controls = new OrbitControls(camera);
}

function parseData() {
  $.get("tornadoes_minified.csv", function(data) {
    const tornadoArray = data.split("\n").map(function(d) {
      return d.split(",");
    });

    const tgroups = new TornadoGroups(tornadoArray);
    draw(tgroups.groupByHourInState("TX"));
  });
}

parseData();
