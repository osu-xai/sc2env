
function createMultiMessageFromPacket(scPkt){
  var scPkts = [];
  scPkts.push(scPkt);
  return createMultiMessageFromPackets(scPkts);
}

function createMultiMessageFromPackets(scPkts){
  var mm = new proto.scaii.common.MultiMessage;
  if (scPkts.length > 0){
	var nextPkt = scPkts.shift();
    while (nextPkt != undefined){
      mm.addPackets(nextPkt);
	  nextPkt = scPkts.shift();
	}
  }
  return mm;
}

function setSourceEndpoint(pkt){
  var moduleEndpoint = new proto.scaii.common.ModuleEndpoint;
  moduleEndpoint.setName("viz");
  var srcEndpoint = new proto.scaii.common.Endpoint;
  srcEndpoint.setModule(moduleEndpoint);
  pkt.setSrc(srcEndpoint);
}	

function setDestinationEndpointToReplay(pkt){
  var replayEndpoint = new proto.scaii.common.ReplayEndpoint;
  var destEndpoint = new proto.scaii.common.Endpoint;
  destEndpoint.setReplay(replayEndpoint);
  pkt.setDest(destEndpoint);
}

function setDestinationEndpointToBackend(pkt){
  var backendEndpoint = new proto.scaii.common.BackendEndpoint;
  var destEndpoint = new proto.scaii.common.Endpoint;
  destEndpoint.setBackend(backendEndpoint);
  pkt.setDest(destEndpoint);
}

function buildResponseToReplay(scPkts){
  for (var i = 0; i < scPkts.length; i++) {
	var pkt = scPkts[i];
    setSourceEndpoint(pkt)
    setDestinationEndpointToReplay(pkt);
  }
  var mm = createMultiMessageFromPackets(scPkts);
  return mm;
}

function buildReturnMultiMessageFromState(entities) {
  var entityKeys = Object.keys(entities);
  var returnState = new proto.scaii.common.Viz;
  for (var i in entityKeys) {
    var entityId = entityKeys[i]
    var entity = entities[entityId];
    if (entityId == '8') {
      //console.log('++++++++++++++ENTITY SEND ' + entityId + '++++++++++++++++');
      logEntity(entity);
    }
    returnState.addEntities(entity);
  }
  var pkt = new proto.scaii.common.ScaiiPacket;
  pkt.setViz(returnState);
  // these returned state packets only are sent from a test app that does not
  // use the router, so Endpoints don't really matter, but we'll set them to 
  // make sure the pkt is fully constructed
  setDestinationEndpointToBackend(pkt); 
  setSourceEndpoint(pkt);
  var mm = createMultiMessageFromPacket(pkt);
  return mm;
}


function convertProtobufChartToJSChart(pbch){
    var chart = {};
    chart.title = pbch.getTitle();
    chart.v_title = pbch.getVTitle();
    chart.h_title = pbch.getHTitle();
    var groupsList = pbch.getGroupsList();
    chart.actions = [];
    for (var i in groupsList){
        var groupMessage  = groupsList[i];
        var action = {};
        action.value = groupMessage.getValue();
        action.bars = [];
        action.saliencyId = groupMessage.getSaliencyId();
        action.name = groupMessage.getName();
        chart.actions.push(action);
        var barsList = groupMessage.getBarsList();
        for (var j in barsList){
            var barMessage = barsList[j];
            var bar = {};
            bar.value = barMessage.getValue();
            bar.saliencyId = barMessage.getSaliencyId();
            bar.name = barMessage.getName();
            action.bars.push(bar);
        }
    }
    return chart;
}


function copyPos(thing, thingClone){
    var pos = thing.getPos();
    //message Pos {
    //    optional double x = 1;
    //    optional double y = 2;
    //}
    var posClone = new proto.scaii.common.Pos;
    var x = pos.getX();
    posClone.setX(x);
    var y = pos.getY();
    posClone.setY(y);
    thingClone.setPos(posClone);
}

function copyRelativePos(thing, thingClone){
    var pos = thing.getRelativePos();
    //message Pos {
    //    optional double x = 1;
    //    optional double y = 2;
    //}
    var posClone = new proto.scaii.common.Pos;
    var x = pos.getX();
    posClone.setX(x);
    var y = pos.getY();
    posClone.setY(y);
    thingClone.setRelativePos(posClone);
}
  
  
function copyShapeIntoCloneEntity(shape, entityClone){
    var shapeClone = new proto.scaii.common.Shape;
    //     required uint64 id = 1;
    var id = shape.getId();
    shapeClone.setId(id);

    //     optional Pos relative_pos = 2;
    copyRelativePos(shape, shapeClone);

    //     optional Color color = 3;
    if (shape.hasColor()){
        copyColor(shape, shapeClone);
    }
    //     required double rotation = 4;
    shapeClone.setRotation(shape.getRotation());
    //     optional Rect rect = 20;
    if (shape.hasRect()){
        copyRect(shape, shapeClone);
    }
    //     optional Triangle triangle = 21;
    if (shape.hasTriangle()){
        copyTriangle(shape, shapeClone);
    }
    //     optional string tag = 22;
    shapeClone.setTag(shape.getTag());
    //     optional Color gradient_color = 23;
    if (shape.hasGradientColor()){
        copyGradientColor(shape, shapeClone);
    }
    //     optional Kite kite = 24;
    if (shape.hasKite()){
        copyKite(shape, shapeClone);
    }
    //     optional Octagon octagon = 25;
    if (shape.hasOctagon()){
        copyOctagon(shape, shapeClone);
    }
    //     optional Arrow arrow = 26;
    if (shape.hasArrow()){
        copyArrow(shape, shapeClone);
    }
    //     optional Circle circle = 27;
    if (shape.hasCircle()){
        copyCircle(shape, shapeClone);
    }
    
    //     required bool delete = 40;
    // ignore delete

    var index = entityClone.getShapesList().length;
    entityClone.addShapes(shapeClone, index);
}

function copyColor(thing, thingClone){
    // message Color {
    //     required uint32 r = 1;
    //     required uint32 g = 2;
    //     required uint32 b = 3;
    //     required uint32 a = 4;
    // }
    var colorClone = new proto.scaii.common.Color;
    var color = thing.getColor();
    colorClone.setR(color.getR());
    colorClone.setG(color.getG());
    colorClone.setB(color.getB());
    colorClone.setA(color.getA());
    thingClone.setColor(colorClone);
}

function copyRect(thing, thingClone){
    // message Rect {
    //     optional double width = 1;
    //     optional double height = 2;
    // }
    var rectClone = new proto.scaii.common.Rect;
    var rect = thing.getRect();
    rectClone.setWidth(rect.getWidth());
    rectClone.setHeight(rect.getHeight());
    thingClone.setRect(rectClone);
}

function copyTriangle(thing, thingClone){

    // message Triangle {
    //     optional double base_len = 1;
    // }
    var triangleClone = new proto.scaii.common.Triangle;
    var triangle = thing.getTriangle();
    triangleClone.setBaseLen(triangle.getBaseLen());
    thingClone.setTriangle(triangleClone);
}

function copyGradientColor(thing, thingClone){
// message Color {
    //     required uint32 r = 1;
    //     required uint32 g = 2;
    //     required uint32 b = 3;
    //     required uint32 a = 4;
    // }
    var colorClone = new proto.scaii.common.Color;
    var color = thing.getGradientColor();
    colorClone.setR(color.getR());
    colorClone.setG(color.getG());
    colorClone.setB(color.getB());
    colorClone.setA(color.getA());
    thingClone.setGradientColor(colorClone);
}

function copyKite(thing, thingClone){
    // message Kite {
    //     optional double width = 1;
    //     optional double length = 2;
    // }
    var kiteClone = new proto.scaii.common.Kite;
    var kite = thing.getKite();
    kiteClone.setWidth(kite.getWidth());
    kiteClone.setLength(kite.getLength());
    thingClone.setKite(kiteClone);
}

function copyOctagon(thing, thingClone){
    // message Octagon {
    //     optional double edge_top = 1;
    //     optional double edge_corner = 2;
    //     optional double edge_left = 3;
    // }
    var octagonClone = new proto.scaii.common.Octagon;
    var octagon = thing.getOctagon();
    octagonClone.setEdgeTop(octagon.getEdgeTop());
    octagonClone.setEdgeCorner(octagon.getEdgeCorner());
    octagonClone.setEdgeLeft(octagon.getEdgeLeft());
    thingClone.setOctagon(octagonClone);
}

function copyArrow(thing, thingClone){
    // message Arrow {
    //     optional Pos target_pos = 1;
    //     optional uint32 thickness = 2;
    //     optional uint32 head_length = 3; 
    //     optional uint32 head_width = 4; 
    // }
    var arrowClone = new proto.scaii.common.Arrow;
    var arrow = thing.getArrow();
    copyPos(arrow, arrowClone);
    arrowClone.setThickness(arrow.getThickness());
    arrowClone.setHeadLength(arrow.getHeadLength());
    arrowClone.setHeadWidth(arrow.getHeadWidth());
    thingClone.setArrow(arrowClone);
}

function copyCircle(thing, thingClone){
    // message Circle {
    //     optional double radius = 1;
    // }
    var circleClone = new proto.scaii.common.Circle;
    var circle = thing.getCircle();
    circleClone.setRadius(circle.getRadius());
    thingClone.setCircle(circleClone);
}






