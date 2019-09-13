
//
// SC2_TODO - do we need these?  If not, can ditch google lib.  If so, why did missing ones not cause problems
//
// goog.require('proto.ExplanationPoint');
// goog.require('proto.MultiMessage');
// goog.require('proto.ScaiiPacket');

/**
* Copyright (c) 2017-present, Oregon State University, Inc.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grantx
* of patent rights can be found in the PATENTS file in the same directory.
*/


var main = function () {
    var sl1 = getStoryLineFromIdList(["1","1.1action_max","1.1.1action_min","1.1.1.1","1.1.1.1.1action_max","1.1.1.1.1.1action_min","1.1.1.1.1.1.1"]);
    var sl2 = getStoryLineFromIdList(["2","2.2action_max","2.2.2action_min","2.2.2.2","2.2.2.2.2action_max","2.2.2.2.2.2action_min","2.2.2.2.2.2.2"]);
    var sl3 = getStoryLineFromIdList(["3","3.3action_max","3.3.3action_min","3.3.3.3","3.3.3.3.3action_max","3.3.3.3.3.3action_min","3.3.3.3.3.3.3"]);
    var sl4 = getStoryLineFromIdList(["4","4.4action_max","4.4.4action_min","4.4.4.4","4.4.4.4.4action_max","4.4.4.4.4.4action_min","4.4.4.4.4.4.4"]);
    var storyLineList = [sl1,sl2,sl3,sl4];
    var storyLines = new StoryLines(storyLineList);
    storyLinesForFrame["0"] = storyLines;
    storyLineUI.init(storyLines);
    renderStoryLinesDefaultView(0);
    document.body.style.zoom=0.5;
    //var linearDiv = document.getElementById("linear");
    //linearDiv.setAttribute("width", window.innerWidth);
    //linearDiv.setAttribute("height", window.innerHeight);
}


function getStoryLineFromIdList(idList){
    var nodeList = []
    for (var index in idList){
        var cyNode = getCynodeForEntry(idList[index], index, 1 - index/4)
        var tni = new TreeNodeInfo(cyNode);
        nodeList.push(tni);
    }
    var storyLine = new StoryLine(nodeList);
    return storyLine;
}
function getCynodeForEntry(id, depth,qValue){
    var n = {};
    n["data"] = {};
    n["data"]["id"] = id;
    var nodeType = getTypeForDepth(depth)
    n["data"]["sc2_nodeType"] = nodeType;
    n["data"]["best q_value"] = qValue;
    n["data"]["state"] = getVectorForId(id);
    if (nodeType != "stateNode") {
        n["data"]["action"] = getActionForId(id);
    }
    return n;
}
function getTypeForDepth(d){
    if (d == 0 || d == 3 || d == 6){
        return "stateNode";
    }
    if (d == 1 || d == 4){
        return "friendlyAction";
    }
    if (d == 2 || d == 5){
        return "enemyAction";
    }
    return "unknown";
}

function getActionForId(id){
    var id_cleaned = id.replace("action_max","");
    id_cleaned = id_cleaned.replace("action_min");
    var parts = id_cleaned.split(".")
    while (parts.length < 7){
        parts.push(0);
    }
    var result = "";
    for (var i in parts){
        result = result + parts[i];
    }
    return result;
}
function getVectorForId(id){
    var state = [150,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2000,2000,2000,2000,1];
    var id_cleaned = id.replace("action_max","");
    id_cleaned = id_cleaned.replace("action_min");
    var items = id_cleaned.split(".");
    for (var index in items){
        var num = Number(items[index]);
        state[Number(index) + 1] = num;
        state[Number(index) + 8] = num;
    }
    console.log("vector " + state);
    return state;
}
main();
