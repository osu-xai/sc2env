
function createMultiMessageFromPacket(scPkt){
  var scPkts = [];
  scPkts.push(scPkt);
  return createMultiMessageFromPackets(scPkts);
}

function createMultiMessageFromPackets(scPkts){
  var mm = new proto.MultiMessage;
  if (scPkts.length > 0){
	var nextPkt = scPkts.shift();
    while (nextPkt != undefined){
      mm.addPackets(nextPkt);
	  nextPkt = scPkts.shift();
	}
  }
  return mm;
}

function buildResponseToReplay(scPkts){
  for (var i = 0; i < scPkts.length; i++) {
	var pkt = scPkts[i];
  }
  var mm = createMultiMessageFromPackets(scPkts);
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
