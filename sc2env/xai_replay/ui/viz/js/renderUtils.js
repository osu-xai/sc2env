function getClosestInRangeShapeId(ctx, x, y){
	var closestId = undefined;
	var closestDistance = undefined;
	for (key in shapePositionMap) {
		var shapePoints = shapePositionMap[key];
		if (closestId == undefined){
			var d = getDistance(x,y,shapePoints.x, shapePoints.y);
			if (d <= shapePoints.radius){
				closestId = shapePoints.id;
				closestDistance = d;
			}
		}
		else {
			var d = getDistance(x,y,shapePoints.x, shapePoints.y);
			if (d <= shapePoints.radius){
				if(d < closestDistance) {
					closestId = shapePoints.id;
					closestDistance = d;
				}
			}
		}
	}
	return closestId;
}

function getDistance(x1,y1,x2,y2){
    var a = x2 - x1;
    var b = y2 - y1;
    var d = Math.sqrt( a*a + b*b );
    return d;
}

function getShapePoints(x,y,radiusBasis, id){
	shape = {};
	shape.x = x;
	shape.y = y;
	shape.radius = radiusBasis / 2.0;
	shape.id = id;
	return shape;
}

function getAbsoluteOrigin(zoomedX, zoomedY, relPos, zoom_factor) {
    var xDelta = 0;
    var yDelta = 0;
    if (relPos.hasX()) {
      xDelta = relPos.getX();
    }
    if (relPos.hasY()) {
      yDelta = relPos.getY();
    }
    var absX = zoomedX + xDelta * zoom_factor;
    var absY = zoomedY + yDelta * zoom_factor;
    return [absX, absY];
  }
  
function getShapeId(entity, shape) {
    return entity.getId() + "_" + shape.getId();
}
  
function zoom(value) {
    return value * gameScaleFactor;
}

function setRelativePosition(shapeInfo, shape) {
    if (shape.hasRelativePos()) {
        shapeInfo.relPos = shape.getRelativePos();
    }
    else {
        var relPos = new proto.scaii.common.Pos;
        relPos.setX(0.0);
        relPos.setY(0.0);
        shapeInfo.relPos = relPos;
    }
}

function setAbsolutePosition(si) {
    var absPos = getAbsoluteOrigin(si.entityX, si.entityY, si.relPos, si.zoom_factor);
    si.x = absPos[0];
    si.y = absPos[1];
}

function setHitPointsInfo(si, entity) {
    if (entity.hasHp() && entity.hasMaxHp()) {
        si.hitPoints = entity.getHp();
        si.maxHitPoints = entity.getMaxHp();
    }
    else {
        si.hitPoints =getNumericValueFromFloatStringMap(entity, "Hitpoints");
        si.maxHitPoints = getNumericValueFromFloatStringMap(entity, "Max Hp");
    }
    if (si.hitPoints != undefined) {
        si.percentHPRemaining = si.hitPoints / si.maxHitPoints;
    }
}


function getNumericValueFromFloatStringMap(entity, key){
    var map = entity.floatstringmetadataMap;
    var value = undefined;
    if (undefined != map) {
        valueString = map.get(key);
        value = (Number(valueString)).toFixed(2);
    }
    return value;
}
  
function getIsEnemy(entity){
    var map = entity.boolstringmetadataMap;
    if (undefined != map) {
        var isEnemy = map.get("Enemy?");
        if (isEnemy == "true") {
            return true;
        }
    }
    return false;
}
  
function getIsFriend(entity){
    var map = entity.boolstringmetadataMap;
    if (undefined != map) {
        var isFriend = map.get("Friend?");
        if (isFriend == "true") {
            return true;
        }
    }
    return false;
}
  
function getUnitType(entity){
    var map = entity.stringmetadataMap;
    var type = undefined;
    if (undefined != map) {
        type = map.get("Unit Type");
    }
    return type;
}
  
function getColorRGBA(r,g,b,a) {
    color = {};
    color['R'] = r;
    color['G'] = g;
    color['B'] = b;
    color['A'] = a;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
  }
  
  function getBasicColorRGBA() {
    color = {};
    color['R'] = 200;
    color['G'] = 200;
    color['B'] = 200;
    color['A'] = 0.5;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
  }
  
  function isBlueColor(color){
    var r = Number(color.getR());
    var g = Number(color.getG());
    var b = Number(color.getB());
  
     if (r == 0 && g == 0 && b == 255) {
       return true;
     }
     return false;
  }
  
  function loadShapeColorAsRGBAString(shape) {
    color = {};
    color['R'] = 200;
    color['G'] = 200;
    color['B'] = 200;
    color['A'] = 0.5;
    if (shape.hasColor()) {
      var color = shape.getColor();
      if (isBlueColor(color)){
        var betterColorThanBlue = 'rgba(255,181,0,1.0)';
        return betterColorThanBlue;
      }
      if (color.hasR()) {
        color['R'] = color.getR();
      }
      if (color.hasG()) {
        color['G'] = color.getG();
      }
      if (color.hasB()) {
        color['B'] = color.getB();
      }
      if (color.hasA()) {
        color['A'] = color.getA() / 255;
      }
    }
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
  }
  
  function limitFilterColorValue(value) {
    if (value < 0) {
      return 0;
    }
    else if (value > 255) {
      return 255;
    }
    else return value;
  }
  
function getOctagonHeight(si) {
    var h = Math.sqrt((si.edgeCorner * si.edgeCorner) / 2.0 );
    var result  = si.edgeLeft + 2 * h;
    return result;
}

function getOctagonWidth(si) {
    var h = Math.sqrt((si.edgeCorner * si.edgeCorner) / 2.0 );
    var result  = si.edgeTop + 2 * h;
    return result;
}