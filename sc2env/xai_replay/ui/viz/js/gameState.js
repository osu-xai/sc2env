
function deleteShape(shapeList, shape) {
  var index = shapeList.indexOf(shape);
  if (index != -1) {
    shapeList.splice(index, 1);
  }
  else {
    console.log('ERROR - asked to delete shape that is not in master list!');
  }
}

function updateMasterPosition(masterPos, updatePos) {
  if (updatePos != undefined) {
    if (updatePos.hasX()) {
      masterPos.setX(updatePos.getX());
    }
    if (updatePos.hasY()) {
      masterPos.setY(updatePos.getY());
    }
  }
}

function updateMasterRotation(masterShape, masterRotation, updateRotation) {
  if (updateRotation == undefined) {
    return;
  }
  masterShape.setRotation(updateRotation);
}

function updateMasterColor(masterShape, masterColor, updateColor) {
  if (updateColor == undefined) {
    return;
  }
  if (masterColor == undefined) {
    masterShape.setColor(updateColor);
    return;
  }
  if (updateColor.hasR()) {
    masterColor.setR(limitFilterColorValue(updateColor.getR()));
  }
  if (updateColor.hasG()) {
    masterColor.setG(limitFilterColorValue(updateColor.getG()));
  }
  if (updateColor.hasB()) {
    masterColor.setB(limitFilterColorValue(updateColor.getB()));
  }
  if (updateColor.hasA()) {
    masterColor.setA(limitFilterColorValue(updateColor.getA()));
  }
}

function transferSpecificShape(masterShape, updateShape){
    var masterShapeType = getShapeType(masterShape);
    var updateShapeType = getShapeType(updateShape);
    clearShape(masterShape, masterShapeType);
    var specificShape = getShapeOfType(updateShape,updateShapeType);
    setShape(masterShape, specificShape, updateShapeType);
}

function getShapeType(shape){
    if (shape.hasCircle()) {
        return "circle";
    }
    else if (shape.hasRect()) {
        return "rect";
    }
    else if (shape.hasKite()) {
        return "kite";
    }
    else if (shape.hasOctagon()) {
        return "octagon";
    }
    else if (shape.hasArrow()) {
        return "arrow";
    }
    else if (shape.hasTriangle()) {
        return "triangle";
    }
}

function setShape(shape, specificShape, type) {
    if (type == "circle") {
        shape.setCircle(specificShape);
    }
    else if (type =="rect") {
        shape.setRect(specificShape);
    }
    else if (type =="kite") {
        shape.setKite(specificShape);
    }
    else if (type =="octagon") {
        shape.setOctagon(specificShape);
    }
    else if (type =="arrow") {
        shape.setArrow(specificShape);
    }
    else if (type =="triangle") {
        shape.setTriangle(specificShape);
    }
}

function clearShape(shape, type) {
    if (type == "circle") {
        shape.clearCircle();
    }
    else if (type =="rect") {
        shape.clearRect();
    }
    else if (type =="kite") {
        shape.clearKite();
    }
    else if (type =="octagon") {
        shape.clearOctagon();
    }
    else if (type =="arrow") {
        shape.clearArrow();
    }
    else if (type =="triangle") {
        shape.clearTriangle();
    }
}

function getShapeOfType(shape, type) {
    if (type == "circle") {
        return shape.getCircle();
    }
    else if (type =="rect") {
        return shape.getRect();
    }
    else if (type =="kite") {
        return shape.getKite();
    }
    else if (type =="octagon") {
        return shape.getOctagon();
    }
    else if (type =="arrow") {
        return shape.getArrow();
    }
    else if (type =="triangle") {
        return shape.getTriangle();
    }
}
function updateMasterShape(master, update) {
  var updatePos = update.getRelativePos();
  var masterPos = master.getRelativePos();
  updateMasterPosition(masterPos, updatePos);
  var updateColor = update.getColor();
  var masterColor = master.getColor();
  updateMasterColor(master, masterColor, updateColor);
  var updateRotation = update.getRotation();
  var masterRotation = master.getRotation();
  updateMasterRotation(master, masterRotation, updateRotation);
  
  transferSpecificShape(master, update);
}

function updateMasterEntity(master, update) {
  if (update.hasPos()) {
    var updatePos = update.getPos();
    if (master.hasPos()) {
      var masterPos = master.getPos();
      updateMasterPosition(masterPos, updatePos);
    }
    else {
      master.setPos(update.getPos());
    }
  }
  var masterShapes = master.getShapesList();
  var updateShapes = update.getShapesList();
  for (var i in updateShapes) {
    var updateShape = updateShapes[i];
    if (!updateShape.hasId()) {
      console.log('-------ERROR------ updateShape has no id');
      continue;
    }
    var updateShapeId = updateShape.getId();
    var masterShape = getShapeWithMatchingId(masterShapes, updateShapeId);
    if (masterShape == undefined) {
        masterShapes.push(updateShape);
    }
    else {
        updateMasterShape(masterShape, updateShape);
    }
  }
  updateMetadata(master, update);
}

function copyMapsIntoUpdateablePosition(entity) {
  entity.stringmetadataMap = entity.getStringmetadataMap();
  entity.boolstringmetadataMap = entity.getBoolstringmetadataMap();
  entity.floatstringmetadataMap = entity.getFloatstringmetadataMap();
  entity.intmetadataMap = entity.getIntmetadataMap();
  entity.boolmetadataMap = entity.getBoolmetadataMap();
  entity.floatmetadataMap = entity.getFloatmetadataMap();
}

function updateMetadata(master, update){
  transferMap(update.getStringmetadataMap(),      master.stringmetadataMap);
  transferMap(update.getBoolstringmetadataMap(),  master.boolstringmetadataMap);
  transferMap(update.getFloatstringmetadataMap(), master.floatstringmetadataMap);
  transferMap(update.getIntmetadataMap(),         master.intmetadataMap);
  transferMap(update.getBoolmetadataMap(),        master.boolmetadataMap);
  transferMap(update.getFloatmetadataMap(),       master.floatmetadataMap);
}

function transferMap(sourceMap, targetMap){
  // if there is data in the new map, copy it into the old map
  var entryList = sourceMap.getEntryList();
  for (var i in entryList ){
    var entry = entryList[i];
    var key = entry[0];
    var val = entry[1];
    targetMap.set(key, val);
  }
}

function getShapeWithMatchingId(shapesList, shapeId) {
  for (var i in shapesList) {
    var shape = shapesList[i];
    if (!shape.hasId()) {
      console.log('-----ERROR----- shape in master shapes list has no id');
    }
    else if (shape.getId() == shapeId) {
      return shape;
    }
  }
  return undefined;
}
