function RubiksCube() {
  /* wrapper class for all sub-cubes that make up rubiks cube */
  this.cubes = new Array(3);
  this.chunkToRotate = null;
  this.rotationAxis = null;
  this.rotationAngle = 0;
  this.cycles = 0;
  const EPSILON = 0.001;

  this.init = function () {
    for (x = 0; x < 3; x++) {
      this.cubes[x] = new Array(3);
      for (y = 0; y < 3; y++) {
        this.cubes[x][y] = new Array(3);
        for (z = 0; z < 3; z++) {
          var coordinates = [x - 1, y - 1, z - 1];
          var color = [x / 3, y / 3, z / 3, 1.0];
          this.cubes[x][y][z] = new Cube(this, coordinates, color);
        }
      }
    }
  };

  this.draw = function () {
    gl.uniform4f(
      program.shown,
      shownUnifVals[0],
      shownUnifVals[1],
      shownUnifVals[2],
      shownUnifVals[3]
    );
    gl.uniform4f(
      program.repMetRough,
      repMetRough[0],
      repMetRough[1],
      repMetRough[2],
      repMetRough[3]
    );

    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var cube = this.cubes[x][y][z];
          cube.draw();
        }
      }
    }
  };

  this.setRotation = function (
    cubeToRotateCoordinates,
    rotationAxis,
    isClockwise
  ) {
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var cube = this.cubes[x][y][z];
          /* dont want to compare floats for equality */
          if (
            Math.abs(cube.coordinates[0] - (cubeToRotateCoordinates[0] - 1)) <
              EPSILON &&
            Math.abs(cube.coordinates[1] - (cubeToRotateCoordinates[1] - 1)) <
              EPSILON &&
            Math.abs(cube.coordinates[2] - (cubeToRotateCoordinates[2] - 1)) <
              EPSILON
          ) {
            /* find cube that matches coordinates and add to chunk */
            this.cubeToRotate = this.cubes[x][y][z];
          }
        }
      }
    }

    this.rotationAxis = rotationAxis;
    this.isClockwise = isClockwise;

    this.setChunk();
    isRotating = true;
    //this.cycles -= 1;
  };
  /*this.scramble = function () {
    if (this.cycles == 0) {
      state.isRotating = false;
      return;
    }

    x = Math.floor(Math.random() * 3);
    y = Math.floor(Math.random() * 3);
    z = Math.floor(Math.random() * 3);
    this.axisToRotate = Math.floor(Math.random() * 3);
    this.cubeToRotate = state.rubiksCube.cubes[x][y][z];

    switch (this.axisToRotate) {
      case 0:
        this.rotationAxis = [1, 0, 0];
        break;
      case 1:
        this.rotationAxis = [0, 1, 0];
        break;
      case 2:
        this.rotationAxis = [0, 0, 1];
        break;
      default:
        break;
    }

    if (Math.random() < 0.5) {
      // 50% chance you rotate opposite way 
      vec3.scale(this.rotationAxis, this.rotationAxis, -1);
    }

    this.setChunk();
    state.isRotating = true;
    this.cycles -= 1;
  };*/

  this.setChunk = function () {
    /* iterate through cubes matrix to find matches */

    if (this.rotationAxis[0] == 1) this.axisIndex = 0;
    else if (this.rotationAxis[1] == 1) this.axisIndex = 1;
    else if (this.rotationAxis[2] == 1) this.axisIndex = 2;
    var selectedChunk = this.cubeToRotate.coordinates[this.axisIndex];
    var chunk = [];
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var cube = this.cubes[x][y][z];
          /* dont want to compare floats for equality */
          if (
            Math.abs(cube.coordinates[this.axisIndex] - selectedChunk) < EPSILON
          ) {
            /* find cube that matches coordinates and add to chunk */
            chunk.push(cube);
          }
        }
      }
    }
    this.chunkToRotate = chunk;
  };

  this.rotateChunk = function () {
    const rotationSpeed = 1;
    if (Math.abs(this.rotationAngle) == 90) {
      /* chunk has finished rotating */
      this.rotationAngle = 0;
      isRotating = false;
      //this.scramble();
      for (i = 0; i < this.chunkToRotate.length; i++) {
        var cube = this.chunkToRotate[i];
        transformMat4(
          cube.coordinates,
          cube.coordinates,
          utils.invertMatrix(cube.rotationMatrix)
        );
        cube.updateTranslationMatrix();
        cube.rotationMatrix = raycastManager.getQuaternionMatrix(0, 0, 0);
      }

      return;
    }

    this.rotationAngle += this.isClockwise ? -rotationSpeed : rotationSpeed;
    for (i = 0; i < this.chunkToRotate.length; i++) {
      /* rotate each cube */
      var cube = this.chunkToRotate[i];
      switch (this.axisIndex) {
        case 0:
          cube.rotationMatrix = raycastManager.getQuaternionMatrix(
            this.rotationAngle,
            0,
            0,
            cube.q
          );
          break;
        case 1:
          cube.rotationMatrix = raycastManager.getQuaternionMatrix(
            0,
            this.rotationAngle,
            0,
            cube.q
          );
          break;
        case 2:
          cube.rotationMatrix = raycastManager.getQuaternionMatrix(
            0,
            0,
            this.rotationAngle,
            cube.q
          );
          break;
      }
    }
  };

  this.hasWon = function () {
    const offset = 1;
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var cube = this.cubes[x][y][z];
          var originalPosition = [x, y, z];
          /* dont want to compare floats for equality */
          if (
            Math.abs(cube.coordinates[0] - originalPosition[0]) >
              state.EPSILON + offset ||
            Math.abs(cube.coordinates[1] - originalPosition[1]) >
              state.EPSILON + offset ||
            Math.abs(cube.coordinates[2] - originalPosition[2]) >
              state.EPSILON + offset
          ) {
            console.log("original: " + originalPosition);
            console.log("cube's: " + cube.coordinates);
            return false;
          }
        }
      }
    }
    return true;
  };

  this.getCubeFromCoordinates = function (coordinates) {
    for (x = 0; x < 3; x++) {
      for (y = 0; y < 3; y++) {
        for (z = 0; z < 3; z++) {
          var cube = this.cubes[x][y][z];
          /* dont want to compare floats for equality */
          if (
            Math.abs(cube.coordinates[0] - (coordinates[0] - 1)) < EPSILON &&
            Math.abs(cube.coordinates[1] - (coordinates[1] - 1)) < EPSILON &&
            Math.abs(cube.coordinates[2] - (coordinates[2] - 1)) < EPSILON
          ) {
            /* find cube that matches coordinates and add to chunk */
            return this.cubes[x][y][z];
          }
        }
      }
    }
  };

  this.init();
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
  var x = a[0],
    y = a[1],
    z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1.0;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}