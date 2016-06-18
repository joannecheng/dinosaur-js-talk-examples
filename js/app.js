const _ = require('underscore');
const Rx = require('rx-lite');
const OrbitControls = require('three-orbit-controls')(THREE)

const TornadoGroups = require('./tornado_data_handler');

// d3 requirements
const d3Color = require('d3-color');
const d3Scale = require('d3-scale');

function draw(tornadoData) {
  const yAxisCount = tornadoData.length;
  const xAxisCount = tornadoData[0].counts.length;
  const graphWidth = 500;
  const graphHeight = 800;

  // ******** CREATE GRID LINES ******
  const gridMaterial = new THREE.LineBasicMaterial({ color: '#000' });

  // container for grid
  const gridObject = new THREE.Object3D();
  const gridGeometry = new THREE.Geometry();

  for (let i=0; i < graphWidth; i+=10) {
    gridGeometry.vertices.push(new THREE.Vector3(0, i, 0));
  }
  const line = new THREE.Line( gridGeometry, gridGeometry, THREE.LinePieces );


  // ******** CREATE GRAPH GEOMETRY ********
  // define scales
  const graphMaterial = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, vertexColors: THREE.VertexColors });
  const allCounts = _.flatten(_.pluck(tornadoData, 'counts'))
  const maxCount = _.max(allCounts);
  const heightScale = d3Scale.scaleLinear()
    .domain([0, maxCount])
    .range([0, 200])

  const colorScale = d3Scale.scaleLinear()
    .domain([0, maxCount])
    .range(['rgb(198, 219, 239)', 'rgb(49, 130, 189)'])

  // create shape for 3D graph
  const graphGeometry = new THREE.PlaneGeometry(graphWidth, graphHeight, xAxisCount-1, yAxisCount-1);
  const faceColors = [];

  _.each(graphGeometry.vertices, function(vertex, i) {
    faceColors.push(colorScale(allCounts[i]));
    vertex.z = heightScale(allCounts[i]);
  })

  _.each(graphGeometry.faces, function(face) {
    face.vertexColors[0] = new THREE.Color(faceColors[face.a]);
    face.vertexColors[1] = new THREE.Color(faceColors[face.b]);
    face.vertexColors[2] = new THREE.Color(faceColors[face.c]);
  });

  // This is what we pass into the scene
  const graphMesh = new THREE.Mesh(graphGeometry, graphMaterial);

  // ********** THREEJS SETUP/RENDERING **********
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 4000);
  controls = new OrbitControls(camera);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(graphMesh);
  scene.add(line);
  camera.position.z = graphHeight * 2;

  const render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render();
}

function parseData() {
  $.get("tornadoes_minified.csv", function(data) {
    const tornadoArray = data.split("\n").map(function(d) {
      return d.split(",");
    });

    const tgroups = new TornadoGroups(tornadoArray);
    draw(tgroups.groupByHourInState("OK"));
  });
}

parseData();
