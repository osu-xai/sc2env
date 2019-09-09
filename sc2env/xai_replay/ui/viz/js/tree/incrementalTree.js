var backingTreeRoot = undefined;
var buildTreeOnDemand = false;
var frameOfCurrentTree = undefined;
function forgetBackingTree(){
    backingTreeRoot = undefined;
}
function generateBackingTreeOfCynodes(jsonStateNode){
    alert("start tree build");
    backingTreeRoot = createBackingTreeRootNode(jsonStateNode);
    buildFriendlyActionCynodesUnderStateNode(jsonStateNode, backingTreeRoot);
    //validateStateNode(backingTreeRoot);
    //console.log("finalNodeCount : " + nodeCount);
    alert("doneTreeBuild");
}
function populatePrincipalVariationTree(startingCyNode){
    var nodes = treeData["elements"]["nodes"];
    nodes.push(startingCyNode);
    addFriendlyActionChildrenOfStateNode(startingCyNode);
}

function getBestScoreSibling(nodes) {
    var bestQValueNode = undefined;
    for (var nodeIndex in nodes){
        var node = nodes[nodeIndex];
        if (bestQValueNode == undefined){
            bestQValueNode = node;
        }
        else{
            if (node["data"]["best q_value"] > bestQValueNode["data"]["best q_value"]){
                bestQValueNode = node;
            }
        }
    }
    return bestQValueNode;
}

function getWorstScoreSibling(nodes) {
    var worstQValueNode = undefined;
    for (var nodeIndex in nodes){
        var node = nodes[nodeIndex];
        if (worstQValueNode == undefined){
            worstQValueNode = node;
        }
        else{
            if (node["data"]["best q_value"] < worstQValueNode["data"]["best q_value"]){
                worstQValueNode = node;
            }
        }
    }
    return worstQValueNode;
}
function addFriendlyActionChildrenOfStateNode(stateCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    for (var nodeIndex in stateCyNode["sc2_cyChildren"] ){
        var node = stateCyNode["sc2_cyChildren"][nodeIndex];
        nodes.push(node);
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    for (var edgeIndex in stateCyNode["sc2_cyEdgesToCyChildren"] ){
        var edge = stateCyNode["sc2_cyEdgesToCyChildren"][edgeIndex];
        edges.push(edge);
    }
    var bestNode = getBestScoreSibling(stateCyNode["sc2_cyChildren"]);
    if (bestNode != undefined){
        addEnemyActionChildrenOfBestFriendlyAction(bestNode);
    }
}
function addEnemyActionChildrenOfBestFriendlyAction(friendlyActionCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    for (var nodeIndex in friendlyActionCyNode["sc2_cyChildren"] ){
        var node = friendlyActionCyNode["sc2_cyChildren"][nodeIndex];
        nodes.push(node);
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    for (var edgeIndex in friendlyActionCyNode["sc2_cyEdgesToCyChildren"] ){
        var edge = friendlyActionCyNode["sc2_cyEdgesToCyChildren"][edgeIndex];
        edges.push(edge);
    }
    var worstNode = getWorstScoreSibling(friendlyActionCyNode["sc2_cyChildren"]);
    addChildStateNodeOfWorstEnemyAction(worstNode);
}
function addChildStateNodeOfWorstEnemyAction(enemyActionCyNode){
    var node = enemyActionCyNode["sc2_cyChildren"][0];
    treeData["elements"]["nodes"].push(node);
    // add edges
    var edge = enemyActionCyNode["sc2_cyEdgesToCyChildren"][0];
    treeData["elements"]["edges"].push(edge);
    addFriendlyActionChildrenOfStateNode(node);
}

var enemyActionShapePoints =    [-1, -1, 1, -1, 1, .75, 0, 1, -1, .75]
var friendlyActionShapePoints = [-1, 1, 1, 1, 1, -.75, 0, -1, -1, -.75]
// from raw json, populating cytoscape data (recursive)
function buildFriendlyActionCynodesUnderStateNode(jsonStateNode, cyStateNode){
   cyStateNode["sc2_cyChildren"] = [];
   cyStateNode["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonStateNode["children"][0];
    for (var childIndex in children){
        var jsonFriendlyActionNode = children[childIndex];
        var className = "friendlyAction";
        var cyFriendlyActionNode = getCyNodeFromJsonNode(jsonFriendlyActionNode, jsonStateNode["name"], className);
        cyFriendlyActionNode["data"]["type"] = "friendlyAction";
        cyFriendlyActionNode["data"]["points"] = friendlyActionShapePoints;
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonStateNode["name"]), trimBestNotationDuplicate(cyFriendlyActionNode["data"]["id"]));
        cyStateNode["sc2_cyChildren"].push(cyFriendlyActionNode);
        cyStateNode["sc2_cyEdgesToCyChildren"].push(cyEdge);
        buildEnemyActionCynodesUnderFriendlyActionCynodes(jsonFriendlyActionNode, cyFriendlyActionNode);
    }
}


function buildEnemyActionCynodesUnderFriendlyActionCynodes(jsonFriendlyActionNode, cyFriendlyActionNode){
    cyFriendlyActionNode["sc2_cyChildren"] = [];
    cyFriendlyActionNode["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonFriendlyActionNode["children"][0];
    for (var childIndex in children){
        var jsonEnemyActionNode = children[childIndex];
        var className = "enemyAction";
        var cyEnemyActionNode = getCyNodeFromJsonNode(jsonEnemyActionNode, jsonFriendlyActionNode["name"], className);
        cyEnemyActionNode["data"]["type"] = "enemyAction";
        cyEnemyActionNode["data"]["points"] = enemyActionShapePoints;
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonFriendlyActionNode["name"]), trimBestNotationDuplicate(cyEnemyActionNode["data"]["id"]));
        cyFriendlyActionNode["sc2_cyChildren"].push(cyEnemyActionNode);
        cyFriendlyActionNode["sc2_cyEdgesToCyChildren"].push(cyEdge);
        buildStateCyNodeUnderEnemyActionCynode(jsonEnemyActionNode, cyEnemyActionNode);
    }
}
  
function buildStateCyNodeUnderEnemyActionCynode(jsonEnemyActionNode, cyEnemyActionNode){
    cyEnemyActionNode["sc2_cyChildren"] = [];
    cyEnemyActionNode["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonEnemyActionNode["children"][0];
    for (var childIndex in children){
        var jsonStateNode = children[childIndex];
        var className = "stateNode";
        var cyStateNode = getCyNodeFromJsonNode(jsonStateNode, jsonEnemyActionNode["name"], className);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonEnemyActionNode["name"]), trimBestNotationDuplicate(cyStateNode["data"]["id"]));
        cyEnemyActionNode["sc2_cyChildren"].push(cyStateNode);
        cyEnemyActionNode["sc2_cyEdgesToCyChildren"].push(cyEdge);
        buildFriendlyActionCynodesUnderStateNode(jsonStateNode, cyStateNode);
    }
}


function createBackingTreeRootNode(inputJsonTree){
    var rootNode = {};
    var rootNodeKeys = Object.keys(inputJsonTree); 
    rootNode["data"] = {}
    for (keyIndex in rootNodeKeys){
        var key = rootNodeKeys[keyIndex];
        rootNode["data"][key] = inputJsonTree[key];
    }
    rootNode["data"]["id"] = inputJsonTree["name"];
    rootNode["data"]["root"] = "iAmRoot";
    rootNode["classes"] = "stateNode rootNode principalVariation";
    return rootNode;
}


