const _ = require('underscore');
const Rx = require('rx-lite');
const TornadoGroups = require('./tornado_data_handler');

// d3 requirements
const d3Color = require('d3-color');
const d3Scale = require('d3-scale');

function draw(tornadoData) {
  const yAxisCount = tornadoData.length;
  const xAxisCount = tornadoData[0].countByDays.length;
  const material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, vertexColors: THREE.VertexColors });


  // ******** MAIN GRAPH CODE ********
  // define scales
  const allCounts = _.flatten(_.pluck(tornadoData, 'countByDays'))
  const maxCount = _.max(allCounts);
  const heightScale = d3Scale.scaleLinear()
    .domain([0, maxCount]) // TODO: this calculation should be part of TornadoDataHandler
    .range([0.5, 8])

  const colorScale = d3Scale.scaleLinear()
    .domain([0, maxCount]) // TODO: this calculation should be part of TornadoDataHandler
    .range(['#eef4f8', '#243d52'])

  // create shape for 3D graph
  const graphGeometry = new THREE.PlaneGeometry(50, 20, xAxisCount-1, yAxisCount-1);
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

  // ********** THREEJS SETUP/RENDERING **********
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 50);

  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0xffffff, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const pointLight = new THREE.PointLight(0xFFFFFF, 1, 100);
  pointLight.position.set(-15, 20, 20);
  const mesh = new THREE.Mesh(graphGeometry, material);

  scene.add(mesh);
  scene.add(pointLight);
  camera.position.z = 30;

  const render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render();
  mouseHandlerForMesh(mesh);
}

function parseData() {
  $.get("tornadoes_minified.csv", function(data) {
    const tornadoArray = data.split("\n").map(function(d) {
      return d.split(",");
    });

    const tgroups = new TornadoGroups(tornadoArray);
    console.log(tgroups.groupByMonthSummed(5));
    draw(tgroups.groupByMonthSummed(5));
  });
}

parseData();

// ************ Mouse handling ***************

function mouseHandlerForMesh(mesh) {
  const mousedown = Rx.Observable.fromEvent(document, "mousedown");
  const mouseup = Rx.Observable.fromEvent(document, "mouseup");
  const mousemove = Rx.Observable.fromEvent(document, "mousemove");

  const mousedrag = mousedown.flatMap(function(md) {
    let prevX = md.clientX;
    let prevY = md.clientY;

    // Returning all events from mousemove
    return mousemove.map(function(mm) {
      mm.preventDefault();

      const returnData = { x: mm.clientX - prevX, y: mm.clientY - prevY }
      prevX = mm.clientX
        prevY = mm.clientY

        return returnData
    }).takeUntil(mouseup);
  });
  // mousedrag is now an Rx.Observable

  mousedrag.subscribe(function(deltaMouseMove) {
    // Euler angles:
    var rotation = new THREE.Quaternion()
      .setFromEuler(new THREE.Euler(toRadians(deltaMouseMove.y), toRadians(deltaMouseMove.x), 0, 'XYZ'))
      mesh.quaternion.multiplyQuaternions(rotation, mesh.quaternion);
  });

  function toRadians(angle) {
    return angle * (Math.PI/180);
  }
}
