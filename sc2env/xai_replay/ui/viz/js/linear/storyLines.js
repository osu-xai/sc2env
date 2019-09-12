var storyLinesForFrame = {};

function generateStoryLines(backingTreeRoot, frameNumber){
    if (storyLinesForFrame[frameNumber.toString()] == undefined){
        var leafStateNodes = getLeafStateNodes(backingTreeRoot);
        console.log("leafStateNode count " + leafStateNodes.length);
        storyLinesForFrame[frameNumber.toString()] = new StoryLines(leafStateNodes);
    }
}

function StoryLines(leafStateNodes){
    this.storyLines = deriveStoryLinesFromLeafNodes(leafStateNodes);
    this.storyLines.sort(function(a,b){
        return b.getPredictedValue() - a.getPredictedValue();
    });
    this.principalVariationStoryLine = this.storyLines.shift();
    console.log("PV : " + this.principalVariationStoryLine.getPredictedValue());
    for (var index in this.storyLines){
        var sl = this.storyLines[index];
        console.log("... " + sl.getPredictedValue());
    }
}

StoryLines.prototype.getWidth = function(){
    return this.storyLines.length;
}
StoryLines.prototype.getDepth = function(){
    return this.storyLines[0].length;
}
StoryLines.prototype.applyCommandSequence = function(commands){

}

StoryLines.prototype.clearViewData = function(){

}

function getLeafStateNodes(root){
    var leafNodes = [];
    var children = root["data"]["sc2_cyChildren"];
    for (var childIndex in children){
        var child = children[childIndex];
        addLeafChildToList(child, leafNodes);
    }
    return leafNodes;
}
function addLeafChildToList(node, leafNodes){
    var children = node["data"]["sc2_cyChildren"]
    if (children.length == 0){
        leafNodes.push(node);
    }
    else {
        for (var childIndex in children){
            var child = children[childIndex];
            addLeafChildToList(child, leafNodes);
        }
    }
}