var sc2GameCanvasWidth = 512;
var sc2GameCanvasHeight = 512;


function getSC2QuadrantName(x,y){
    var halfWidth = sc2GameCanvasWidth / 2;
    var halfHeight = sc2GameCanvasHeight / 2;
    if (x < halfWidth) {
        if (y < halfHeight) {
            return "upperLeftQuadrant";
        }
        else {
            return "lowerLeftQuadrant";
        }
    }
    else {
        if (y < halfHeight) {
            return "upperRightQuadrant";
        }
        else {
            return "lowerRightQuadrant";
        }
    }
}
