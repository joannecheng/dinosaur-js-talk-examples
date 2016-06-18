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
  const maxDepth = 300;

  // ******** CREATE GRID LINES ******
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });

  // container for grid
  const gridObject = new THREE.Object3D();

  // Grid geometry
  const bottomGridGeometry = new THREE.Geometry();
  const heightGridGeometry = new THREE.Geometry();
  const depthGridGeometry = new THREE.Geometry();

  for (let i=-graphHeight/2; i < graphHeight/2; i+=20) {
    bottomGridGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, i, 0));
    bottomGridGeometry.vertices.push(new THREE.Vector3(graphWidth/2, i, 0));

    heightGridGeometry.vertices.push(new THREE.Vector3(0, i, 0));
    heightGridGeometry.vertices.push(new THREE.Vector3(0, i, maxDepth));
  }

  for (let i=-graphWidth/2; i < graphWidth/2; i+=20) {
    bottomGridGeometry.vertices.push(new THREE.Vector3(i, -graphHeight/2, 0));
    bottomGridGeometry.vertices.push(new THREE.Vector3(i, graphHeight/2, 0));

    depthGridGeometry.vertices.push(new THREE.Vector3(i, 0, maxDepth));
    depthGridGeometry.vertices.push(new THREE.Vector3(i, 0, 0));
  }

  for (let i=0;i<maxDepth;i+=20) {
    heightGridGeometry.vertices.push(new THREE.Vector3(0, -graphHeight/2, i));
    heightGridGeometry.vertices.push(new THREE.Vector3(0, graphHeight/2, i));

    depthGridGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, 0, i));
    depthGridGeometry.vertices.push(new THREE.Vector3(graphWidth/2, 0, i));
  }

  const bottomGrid = new THREE.LineSegments(bottomGridGeometry, gridMaterial);
  const heightGrid = new THREE.LineSegments(heightGridGeometry, gridMaterial);
  const depthGrid = new THREE.LineSegments(depthGridGeometry, gridMaterial);
  heightGrid.translateX(-graphWidth/2);
  depthGrid.translateY(graphHeight/2);

  // Add grid lines
  gridObject.add(bottomGrid);
  gridObject.add(heightGrid);
  gridObject.add(depthGrid);

  // ******** CREATE GRAPH GEOMETRY ********
  // define scales
  const graphMaterial = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, vertexColors: THREE.VertexColors });
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
  window.camera = new THREE.PerspectiveCamera(30, window.innerWidth/window.innerHeight, 1, 4000);
  controls = new OrbitControls(camera);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene.add(graphMesh);
  scene.add(gridObject);

  camera.position.z = graphHeight * 3;

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
    draw(tgroups.groupByHourInState("TX"));
  });
}

parseData();
