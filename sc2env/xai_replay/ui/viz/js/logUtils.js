
function getPosString(pos){
    var  result = 'position: ';
    if (pos.hasX()){
      result = result + 'x: '+ pos.getX() + ' ; '; 
    }
    else {
      result = result + 'x missing ; ';
    }
    if (pos.hasY()){
      result = result + 'y: ' + pos.getY() + ' ; ';
    }
    else {
      result = result + 'y missing ; ';
    }
    return result;
  }
  
function getEntityPosString(entity){
    var result = '';
    if (entity.hasPos()){
      result = getPosString(entity.getPos());
    }
    else {
      result = 'Pos missing';
    }
    return result;
  }
  function getEntityDeleteString(entity){
    var result = '';
    if (entity.hasDelete()){
      result = 'delete?: ' + entity.getDelete();
    }
    else {
      result = 'delete value missing';
    }
    return result;
  }
  function getShapeIdString(shape){
    var result = '';
    if (shape.hasId()){
      result = '    shape: ' + shape.getId();
    }
    else {
      result = '    shape id missing';
    }
    return result;
  }
  function getShapeRelPosString(shape){
    var result = '';
    if (shape.hasRelativePos()){
      result = 'relative ' + getPosString(shape.getRelativePos());
    }
    else {
      result = 'relativePos missing';
    }
    return result;
  }
  function getShapeColorString(shape){
  
    var result = '';
    if (shape.hasColor()){
      var color = shape.getColor();
      if (color.hasR()){
        result = result + 'R: ' + color.getR()+ '; ';
      }
      else {
        result= result + 'R missing ; ';
      }
      if (color.hasG()){
        result = result + 'G: ' + color.getG()+ '; ';
      }
      else {
        result= result + 'G missing ; ';
      }
      if (color.hasB()){
        result = result + 'B: ' + color.getB()+ '; ';
      }
      else {
        result= result + 'B missing ; ';
      }
      if (color.hasA()){
        result = result + 'A: ' + color.getA()+ '; ';
      }
      else {
        result= result + 'A missing ; ';
      }
    }
    else {
      result = 'Color missing ; ';
    }
    return result;
  }
  function getShapeRectString(shape){
    var result = '';
    if (shape.hasRect()){
      result = 'Rect ';
      var rect= shape.getRect();
      if (rect.hasWidth()){
        result = result + ' width: ' + rect.getWidth();
      }
      else {
        result = result + ' width missing';
      }
      if (rect.hasHeight()){
        result = result + ' height: ' + rect.getHeight();
      }
      else {
        result = result + ' height missing';
      }
    }
    else {
      result = 'Rect missing';
    }
    return result;
  }
  function getShapeTriangleString(shape){
    var result = '';
    if (shape.hasTriangle()){
      result = 'Tri ';
      var tri= shape.getTriangle();
      if (tri.hasBaseLen()){
        result = result + ' baseLen: ' + tri.getBaseLen();
      }
      else {
        result = result + ' baseLen missing';
      }
    }
    else {
      result = 'Tri missing';
    }
    return result;
  }
  
  function getShapeDeleteString(shape){
    var result = '';
    if (shape.hasDelete()){
      result = 'delete: '+ shape.getDelete();
    }
    else {
      result = 'delete missing';
    }
    return result;
  }
  
function logShape(shape){
  var shapeIdString = getShapeIdString(shape);
  var shapeRelPosString = getShapeRelPosString(shape);
  var shapeColorString = getShapeColorString(shape);
  var shapeRectString = getShapeRectString(shape);
  var shapeTriangleString = getShapeTriangleString(shape);
  var shapeDeleteString = getShapeDeleteString(shape);
  console.log('- - - - - - - - - -')
  console.log(shapeIdString);
  console.log(shapeRelPosString);
  console.log(shapeColorString);
  console.log(shapeRectString);
  console.log(shapeTriangleString);
  console.log(shapeDeleteString);
  console.log('- - - - - - - - - -')
}

function logEntity(entity) {
  if (entity == undefined) {
    console.log('ENTITY undefined');
    return;
  }
  console.log('- - - - - - - - - - -');
  console.log('entity ' + entity.getId());
  console.log('- - - - - - - - - - -');
  var posString = getEntityPosString(entity);
  var deleteString = getEntityDeleteString(entity);
  console.log(posString + ' ; ' + deleteString);

  var shapes = entity.getShapesList();
  console.log('shape count ' + shapes.length);
  for (var i in shapes) {
    var shape = shapes[i];
    logShape(shape);
  }
}