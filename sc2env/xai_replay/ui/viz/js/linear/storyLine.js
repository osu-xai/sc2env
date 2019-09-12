
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
};
TreeNodeInfo.prototype.getId = function() {
    return this.id;
}
TreeNodeInfo.prototype.getType = function() {
    return this.type;
}