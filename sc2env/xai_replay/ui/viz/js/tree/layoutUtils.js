
// search at each depth level for siblings and then if finds, check whether it's principle variation is higher (action_max), and x coordinate
// higher (farther to the right), then switch places with sibling.
function sortNodes(cy){
    //sortedPositionRegister = {};
    cy.nodes().forEach(function( ele ){
        var currParent = ele.incomers().sources();
        var currSiblings = currParent.outgoers().targets();
        currSiblings.forEach(function( sib ){
            if (ele.data("id").indexOf("_action_max") != -1){
                if (ele.data("best q_value") > sib.data("best q_value") && ele.position('x') > sib.position('x')){
                    var newSibPosition = ele.position('x');
                    var newElePosition = sib.position('x');
                    ele.position('x', newElePosition); 
                    sib.position('x', newSibPosition);
                    switchChildrenPositions(cy, ele, sib)

                }
            }
            else if (ele.data("id").indexOf("_action_min") != -1){
                if (ele.data("best q_value") < sib.data("best q_value") && ele.position('x') > sib.position('x')){
                    var newSibPosition = ele.position('x');
                    var newElePosition = sib.position('x');
                    ele.position('x', newElePosition); 
                    sib.position('x', newSibPosition);
                    switchChildrenPositions(cy, ele, sib)
                }
            }
        });
    });
}

function leftJustifyNodes(cy){
    //console.log(" --------- justifying nodes -----");
    var nodeMap = [];
    var nodeIds = [];
    var anchorToLeft = -6000;
    gatherAllNodes(nodeMap, nodeIds, backingTreeRoot);
    var activeNodes = treeData["elements"]["nodes"];
    positionActiveNodes(backingTreeRoot, activeNodes);
    cy.nodes().forEach(function( ele ){
        if (ele.data("xOffset") == undefined){
            console.log(" position of node " + ele.data("id") + " UNAVAILABLE ");
        }
        else{
            var nodeMargin = 200;
            var oldPosition = ele.position("x");
            //console.log(" ele.width : " + ele.width());
            //var widthFactor = (Number(ele.width()) + 200);
            var widthFactor = stateNodeWidth + nodeMargin; 
            var newXPosition = Number(ele.data("xOffset")) * widthFactor + anchorToLeft;
            //console.log("changing  position of node " + ele.data("id") + " from " + oldPosition + " to position " + newXPosition + " based on xOffset " + ele.data("xOffset"));
            ele.position('x', newXPosition);
        }
    });
}
var nodeYAdjustmentRegister = undefined;
var computedYAdjustmentDistance = undefined;
// since can't return a single value from the forEach loop below, register matching y value in a dictionary for lookup
var yPositionOfNodeForId = {};
function extractYPositionsOfNodes(){
    cy.nodes().forEach(function( ele ){
        var id = ele.data("id");
        var y = ele.position("y");
        yPositionOfNodeForId[id] = y;
    });
}


function computeYAdjustmentDistance(){
    extractYPositionsOfNodes();
    if (computedYAdjustmentDistance == undefined){
        var activeNodes = treeData["elements"]["nodes"];
        for (var i in activeNodes){
            // look for the first active friendlyAction node and find a child enemy action to use in calculation
            var node = activeNodes[i];
            if (node["data"]["sc2_nodeType"] == "friendlyAction"){
                for (var j in node["data"]["sc2_cyChildren"]){
                    var child = node["data"]["sc2_cyChildren"][j];
                    if (isNodeInCynodeList(child, activeNodes)){ 
                        var friendlyActionNodeId = node ["data"]["id"];
                        var enemyActionNodeId    = child["data"]["id"];
                        var yPositionFriendly = yPositionOfNodeForId[friendlyActionNodeId];
                        var yPositionEnemy = yPositionOfNodeForId[enemyActionNodeId];
                        var yDistance = yPositionEnemy - yPositionFriendly;
                        var halfHeightFriendly = friendlyActionNodeHeight / 2;
                        var halfHeightEnemy = enemyActionNodeHeight / 2;
                        computedYAdjustmentDistance = yDistance - halfHeightFriendly - halfHeightEnemy - halfOfBothBorders;
                        return;
                    }
                }
                
            }
        }
    }
}
function verticallyAdjustEnemyActions(cy){
    computeYAdjustmentDistance();
    nodeYAdjustmentRegister = {};
    registerNodeYAdjustments(cy);
    performNodeYAdjustments(cy);
    cy.fit();
}

function performNodeYAdjustments(cy){
    cy.nodes().forEach(function( ele ){
        var id = ele.data("id");
        var count = nodeYAdjustmentRegister[id];
        if (count != undefined){
            var currentY = ele.position('y');
            var newY = currentY - count * computedYAdjustmentDistance;
            ele.position('y',newY);
        }
    });
}
function registerNodeYAdjustments(){
    var activeNodes = treeData["elements"]["nodes"];
    var activeEnemyActionNodes = gatherEnemyActionNodes(activeNodes);
    for (var i in activeEnemyActionNodes){
        var node = activeEnemyActionNodes[i];
        registerYAdjustmentForNodeAndActiveChildren(node);
    }
}

function registerYAdjustmentForNode(node){
    var id = node["data"]["id"];
    var curValue = nodeYAdjustmentRegister[id];
    if (curValue == undefined){
        nodeYAdjustmentRegister[id] = 1;
    }
    else {
        nodeYAdjustmentRegister[id] += 1;
    }
    console.log("nodeYAdjustmentRegister for " + id + " = " +  nodeYAdjustmentRegister[id]);
}
function registerYAdjustmentForNodeAndActiveChildren(node){
    registerYAdjustmentForNode(node);
    var children = node["data"]["sc2_cyChildren"];
    if (children != undefined){
        for (var i in children){
            var child = children[i];
            if (isNodeInCynodeList(child,treeData["elements"]["nodes"])){
                registerYAdjustmentForNodeAndActiveChildren(child);
            }
        }
    }
}



function switchChildrenPositions(cy, currNode, switchNode){
    var currNodeChildren = currNode.successors().targets();
    var switchNodeChildren = switchNode.successors().targets();
  
    var currNodeChildrenPositions = [];
    currNodeChildren.forEach(function( child ){
        currNodeChildrenPositions.push(child.relativePosition('x'));
    });
    var temp = [];
    switchNodeChildren.forEach(function( child ){
        temp.push(child.relativePosition('x'));
    });
    
    var i = 0;
    switchNodeChildren.forEach(function( child ){
        child.relativePosition('x', currNodeChildrenPositions[i]);
        i++;
    });
    i = 0;
    currNodeChildren.forEach(function( child ){
        child.relativePosition('x', temp[i]);
        i++;
    });
}


function positionActiveNodes(tree, activeNodes){
    // 0.0.0.0
    // 0.1.0.0
    // 0.1.0.1
    var leafNodes = [];
    findChildrenExpressedAsLeavesUnderNode(tree, leafNodes, activeNodes);
    for (var i = leafNodes.length - 1; i >= 0; i--){
        var leafNode = leafNodes[i];
        positionNodeAndParent(leafNode, i);
    }
    // find all the children from left to right and add to list
    // from the end of the list to the beginning
    // position it and all parents to itsIndexInThatList * delta
    // do same for next one to left in list
}


function ChildScore(child, score) {
    this.child = child;
    this.score = score;
}

function sortNodesAsPerPredictedScore(data, children){
    if (isStateNode(data)){
        return sortChildren(children, sortScoreHighToLow);
    }
    else if (isFriendlyActionNode(data)){
        return sortChildren(children, sortScoreLowToHigh);
    }
    else {
        return children;
    }
}

function sortScoreHighToLow(a,b){
    if  (a.score < b.score){
        return 1;
    }
    if  (a.score > b.score){
        return -1;
    }
    return 0;
}

function sortScoreLowToHigh(a,b){
    if  (a.score > b.score){
        return 1;
    }
    if  (a.score < b.score){
        return -1;
    }
    return 0;
}

function sortChildren(children, sortFunction){
    var sortList = [];
    for (var index in children){
        var child = children[index];
        var score = child["data"]["best q_value"];
        var childScore = new ChildScore(child, score);
        sortList.push(childScore);
    }
    sortList.sort(sortFunction);
    var result = [];
    for (var i in sortList){
        var childScore = sortList[i];
        result.push(childScore.child);
    }
    return result;
}


// once I have the active leaves, I can follow the parentage up, so position node and parent should work
// the question is , how does findLeafNodes work on the active tree, not the backing tree.  
// Could just follow the backing tree, and omit ones not in nodes
// for position node and parent, could make a map of positions, then iterate through the ele style and lookup for the amount to set the 

function findChildrenExpressedAsLeavesUnderNode(node, leafNodes, activeNodes) {
    // assumes given node has been determined to be visible
    var children = node["data"]["sc2_cyChildren"];
    var sortedChildren = sortNodesAsPerPredictedScore(node.data, children);
    if (sortedChildren != undefined){
        for (var i in sortedChildren){
            var child = sortedChildren[i];
            if (isNodeVisible(child, activeNodes)){
                if (isNodeATrueLeaf(child) || isNodeExpressedAsLeaf(child, activeNodes)){
                    leafNodes.push(child);
                }
                else {
                    findChildrenExpressedAsLeavesUnderNode(child, leafNodes, activeNodes)
                }
            }
            
        }
    }
}


function isNodeVisible(node, activeNodes){
    return activeNodes.indexOf(node) != -1;
}

function isNodeATrueLeaf(node){
    var children = node["data"]["sc2_cyChildren"];
    if (children == undefined){
        return true;
    }
    if (children.length == 0){
        return true;
    }
    return false;
}

function isNodeExpressedAsLeaf(node, activeNodes){
    
    var children = node["data"]["sc2_cyChildren"];
    var visibleChildCount = 0;
    if (children != undefined){
        for (var i in children){
            var child = children[i];
            if (activeNodes.indexOf(child) != -1){
                visibleChildCount += 1;
            } 
        }
    }
    return (visibleChildCount == 0);
}

function positionNodeAndParent(node, i){
    setNodeXPosition(node, i);
    var parent = node["data"]["sc2_cyParent"];
    if (parent != undefined){
        positionNodeAndParent(parent, i)
    }
}

function setNodeXPosition(node, i){
    //console.log("setting xOffset for " + node["data"]["id"] + " to position " + i);
    node["data"]["xOffset"] = i;
}

function gatherAllNodes(nodeMap, ids, node){
    var id = node["id"];
    ids.push(id);
    nodeMap[id] = node;
    var children = node["data"]["sc2_cyChildren"];
    if (children != undefined){
        for (var i in children){
            var child = children[i]; 
            gatherAllNodes(nodeMap, ids, child);
        }
    }
}
