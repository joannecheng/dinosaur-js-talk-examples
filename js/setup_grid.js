// https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function createTextSprite(text) {
}

function setupGrid(tornadoData, graphWidth, graphHeight, maxDepth) {
  const yAxisCount = tornadoData.length;
  const xAxisCount = tornadoData[0].counts.length;

  // ******** CREATE GRID LINES ******
  const gridMaterial = new THREE.LineBasicMaterial({ color: 0xeeeeee });
  const axisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });

  // container for grid - this is what we pass to the scene
  const gridObject = new THREE.Object3D();

  // Grid geometry
  const bottomGridGeometry = new THREE.Geometry();
  const heightGridGeometry = new THREE.Geometry();
  const depthGridGeometry = new THREE.Geometry();

  const xAxisGeometry = new THREE.Geometry();
  const yAxisGeometry = new THREE.Geometry();
  const zAxisGeometry = new THREE.Geometry();

  xAxisGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, graphHeight/2, 0));
  xAxisGeometry.vertices.push(new THREE.Vector3(graphWidth/2, graphHeight/2, 0));

  yAxisGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, -graphHeight/2, 0));
  yAxisGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, graphHeight/2, 0));

  zAxisGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, graphHeight/2, 0));
  zAxisGeometry.vertices.push(new THREE.Vector3(-graphWidth/2, graphHeight/2, maxDepth));

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
  
  const xAxis = new THREE.LineSegments(xAxisGeometry, axisMaterial);
  const yAxis = new THREE.LineSegments(yAxisGeometry, axisMaterial);
  const zAxis = new THREE.LineSegments(zAxisGeometry, axisMaterial);

  heightGrid.translateX(-graphWidth/2);
  depthGrid.translateY(graphHeight/2);

  // Add grid lines
  gridObject.add(xAxis);
  gridObject.add(yAxis);
  gridObject.add(zAxis);

  gridObject.add(bottomGrid);
  gridObject.add(heightGrid);
  gridObject.add(depthGrid);

  return gridObject;
}

module.exports = setupGrid;
