function Cube(rubiksCube, coordinates, color) {
  this.rubiksCube = rubiksCube;
  this.coordinates = coordinates;
  this.color = color;
  this.rotationMatrix;
  this.q = new Quaternion(1, 0, 0);
  this.translationMatrix;
  this.isSelected = false;
  const spacing = 2.1;

  this.COLORS = {
    blue: [0.0, 0.0, 1.0, 1.0],
    green: [0.0, 1.0, 0.0, 1.0],
    orange: [1.0, 0.5, 0.0, 1.0],
    red: [1.0, 0.0, 0.0, 1.0],
    white: [1.0, 1.0, 1.0, 1.0],
    yellow: [1.0, 1.0, 0.0, 1.0],
  };

  this.rotate = function () {
    /*
		  mat4.multiply(viewMatrix, viewMatrix, this.rotationMatrix);
		  mat4.translate(viewMatrix, viewMatrix, this.translationVector);
		  */
  };

  this.init = function () {
    this.rotationMatrix = raycastManager.getQuaternionMatrix(0, 0, 0);
    this.updateTranslationMatrix();
  };

  this.updateTranslationMatrix = function () {
    this.translationMatrix = utils.MakeTranslateMatrix(
      this.coordinates[0] * spacing,
      this.coordinates[1] * spacing,
      this.coordinates[2] * spacing
    );
  };

  this.draw = function () {
    if (this.isSelected) gl.uniform4f(program.matcol, 0, 0, 1, 1);
    else gl.uniform4f(program.matcol, 1, 1, 1, 0);

    let worldMatrix3 = utils.multiplyMatrices(
      this.rotationMatrix,
      this.translationMatrix
    );

    projectionMatrix = utils.multiplyMatrices(
      perspProjectionMatrix,
      viewMatrix
    );

    let projectionMatrix2 = utils.multiplyMatrices(
      projectionMatrix,
      worldMatrix3
    );

    gl.uniformMatrix4fv(
      program.WVPmatrixUniform,
      gl.FALSE,
      utils.transposeMatrix(projectionMatrix2)
    );

    gl.uniformMatrix4fv(
      program.WmatrixUniform,
      gl.FALSE,
      utils.transposeMatrix(worldMatrix3)
    );

    gl.drawElements(
      gl.TRIANGLES,
      modelsManager.cubeEndIndex,
      gl.UNSIGNED_SHORT,
      modelsManager.cubeStartIndex
    );
  };

  this.init();
}