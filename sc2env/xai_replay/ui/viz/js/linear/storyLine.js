
function StoryLine(nodes) {
    this.nodes = nodes;
};
StoryLine.prototype.getPredictedValue = function() {
    // predicted value is the predicted value at the leaf node
    return this.nodes[this.nodes.length - 1].bestQValue;
}

StoryLine.prototype.length = function() {
    return this.nodes.length;
}

StoryLine.prototype.getMaxStateUnitCount = function(){
    var max = 0; 
    var stateNodeIndices = [0,3,6];
    for (var i in stateNodeIndices){
        var index = stateNodeIndices[i];
        var node = this.nodes[index];
        var curMax = node.getMaxUnitCount();
        if (curMax > max){
            max = curMax;
        }
    }
    return max;
}

StoryLine.prototype.getMaxActionUnitCount = function(){
    var max = 0;  
    var actionNodeIndices = [1,2,4,5];

    for (var i in actionNodeIndices){
        var index = actionNodeIndices[i];
        var node = this.nodes[index];
        var curMax = node.getMaxUnitCount();
        if (curMax > max){
            max = curMax;
        }
    }
    return max;
}
function deriveStoryLinesFromLeafNodes(leaves){
    var storyLines = [];
    for (leafIndex in leaves){
        var leaf = leaves[leafIndex];
        var storyLine = getStoryLineFromLeaf(leaf);
        storyLines.push(storyLine);
    }
    console.log("storyLineCount " + storyLines.length)
    return storyLines;
}

function getStoryLineFromLeaf(leaf){
    var nodeList = []
    var leafTNI = new TreeNodeInfo(leaf);
    nodeList.push(leafTNI);
    var node = leaf;
    while (node["data"]["sc2_cyParent"] != undefined){
        var parent = node["data"]["sc2_cyParent"];
        var nodeTNI = new TreeNodeInfo(parent);
        // prepend to story so story starts at root
        nodeList.unshift(nodeTNI);
        node = parent;
    }
    var storyLine = new StoryLine(nodeList);
    return storyLine;
}



function TreeNodeInfo(cyNode) {
    this.id = cyNode["data"]["id"];
    this.type = cyNode["data"]["sc2_nodeType"];
    this.bestQValue= cyNode["data"]["best q_value"];
    if (this.type == "stateNode"){
        this.state = cyNode["data"]["state"];
    }
    else {
        this.action = cyNode["data"]["action"];
    }
    this.data = cyNode["data"];
    
};
TreeNodeInfo.prototype.getId = function() {
    return this.id;
}
TreeNodeInfo.prototype.getType = function() {
    return this.type;
}
TreeNodeInfo.prototype.getMaxUnitCount = function(){
    if (this.type == "stateNode"){
        return this.getMaxStateUnitCount();
    }
    else {
        return this.getMaxActionUnitCount();
    }
}

TreeNodeInfo.prototype.getMaxActionUnitCount = function(){
    var max = 0;
    var action = this.action;
    var indices = [0,1,2,3,4,5,6];
    for (var i in indices){
        var index = indices[i];
        var ch = action.charAt(index);
        var unitCount = Number(ch);
        console.log("unit count: " + unitCount);
        if (unitCount > max){
            max = unitCount;
            console.log("newmax : " + max);
        }
    }
    console.log("ACTION UNIT MAX for node " + this.id + " is " + max);
    return max;
}

TreeNodeInfo.prototype.getMaxStateUnitCount = function(){
    var max = 0;

    var vector = this.state;
    var indices = [1,2,3,4,5,6,8,9,10,11,12,13];
    for (var i in indices){
        var index = indices[i];
        var unitCount = vector[index];
        console.log("unit count: " + unitCount);
        if (unitCount > max){
            max = unitCount;
            console.log("newmax : " + max);
        }
    }
    console.log("STATE UNIT MAX for node " + this.id + " is " + max);
    return max;
}



// stateDict["TOP Marines"] = currState[1];
// stateDict["TOP Banelings"] = currState[2];
// stateDict["TOP Immortals"] = currState[3];
// stateDict["BOT Marines"] = currState[4];
// stateDict["BOT Banelings"] = currState[5];
// stateDict["BOT Immortals"] = currState[6];
// stateDict["Pylons"] = currState[7];

// stateDict["Enemy"] = {};
// var stateDictEnemy = stateDict["Enemy"];
// stateDictEnemy["TOP Marines"] = currState[8];
// stateDictEnemy["TOP Banelings"] = currState[9];
// stateDictEnemy["TOP Immortals"] = currState[10];
// stateDictEnemy["BOT Marines"] = currState[11];
// stateDictEnemy["BOT Banelings"] = currState[12];
// stateDictEnemy["BOT Immortals"] = currState[13];
// stateDictEnemy["Pylons"] = currState[14];