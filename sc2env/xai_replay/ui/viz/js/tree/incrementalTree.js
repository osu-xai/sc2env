var backingTreeRoot = undefined;
var buildTreeOnDemand = true;
var frameOfCurrentTree = undefined;
function forgetBackingTree(){
    backingTreeRoot = undefined;
}
function generateBackingTreeOfCynodes(jsonStateNode){
    backingTreeRoot = createBackingTreeRootNode(jsonStateNode);
    buildFriendlyActionCynodesUnderStateNode(jsonStateNode, backingTreeRoot);
    //validateStateNode(backingTreeRoot);
    //console.log("finalNodeCount : " + nodeCount);
}
function populatePrincipalVariationTree(startingCyNode){
    if (cy == undefined){
        var nodes = treeData["elements"]["nodes"];
        nodes.push(startingCyNode);
        addFriendlyActionChildrenOfStateNode(startingCyNode);
    }
    else{
        if (startingCyNode.data("name").indexOf("_action_max") != -1){
            addEnemyActionChildrenOfBestFriendlyAction(startingCyNode)
        }
        else if (startingCyNode.data("name").indexOf("_action_min") != -1){
            addChildStateNodeOfWorstEnemyAction(startingCyNode);
        }
        else{
            addFriendlyActionChildrenOfStateNode(startingCyNode);
        }
    }
}


function removePrincipalVariationTree(startingCyNode){
    if (startingCyNode.data("name").indexOf("_action_max") != -1){
        removeEnemyActionChildrenOfBestFriendlyAction(startingCyNode)
    }
    else if (startingCyNode.data("name").indexOf("_action_min") != -1){
        removeChildStateNodeOfWorstEnemyAction(startingCyNode);
    }
    else{
        removeFriendlyActionChildrenOfStateNode(startingCyNode);
    }
}


function getBestScoreSibling(nodes) {
    var bestQValueNode = undefined;
    for (var nodeIndex in nodes){
        var node = nodes[nodeIndex];
        if (bestQValueNode == undefined){
            bestQValueNode = node;
        }
        else{
            try{
                var nodeQValue = node.data("best q_value");
                var bestNodeQValue = bestQValueNode.data("best q_value");
                if (nodeQValue > bestNodeQValue){
                    bestQValueNode = node;
                }
            }
            catch(error){
                var nodeQValue = node["data"]["best q_value"];
                var bestNodeQValue = bestQValueNode["data"]["best q_value"]
                if (nodeQValue > bestNodeQValue){
                    bestQValueNode = node;
                }
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
            try{
                var nodeQValue = node.data("best q_value");
                var worstNodeQValue = worstQValueNode.data("best q_value");
                if (nodeQValue < worstNodeQValue){
                    worstQValueNode = node;
                }
            }
            catch(error){
                var nodeQValue = node["data"]["best q_value"];
                var worstNodeQValue = worstQValueNode["data"]["best q_value"]
                if (nodeQValue < worstNodeQValue){
                    worstQValueNode = node;
                }
            }
        }
    }
    return worstQValueNode;
}

function addFriendlyActionChildrenOfStateNode(stateCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var stateCyNodeChildren = stateCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var stateCyNodeChildren = stateCyNode["data"]["sc2_cyChildren"]
    }
    for (var nodeIndex in stateCyNodeChildren){
        var node = stateCyNodeChildren[nodeIndex];
        nodes.push(node);
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    try{
        var stateCyNodeEdges = stateCyNode.data("sc2_cyEdgesToCyChildren");
    }
    catch(error){
        var stateCyNodeEdges = stateCyNode["data"]["sc2_cyEdgesToCyChildren"]
    }
    for (var edgeIndex in stateCyNodeEdges){
        var edge = stateCyNodeEdges[edgeIndex];
        edges.push(edge);
    }
    var bestNode = getBestScoreSibling(stateCyNodeChildren);
    if (bestNode != undefined){
        addEnemyActionChildrenOfBestFriendlyAction(bestNode);
    }
}
function addEnemyActionChildrenOfBestFriendlyAction(friendlyActionCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var friendlyActionCyNodeChildren = friendlyActionCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var friendlyActionCyNodeChildren = friendlyActionCyNode["data"]["sc2_cyChildren"]
    }
    for (var nodeIndex in friendlyActionCyNodeChildren){
        var node = friendlyActionCyNodeChildren[nodeIndex];
        nodes.push(node);
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    try{
        var friendlyActionCyNodeEdges = friendlyActionCyNode.data("sc2_cyEdgesToCyChildren");
    }
    catch(error){
        var friendlyActionCyNodeEdges = friendlyActionCyNode["data"]["sc2_cyEdgesToCyChildren"]
    }
    for (var edgeIndex in  friendlyActionCyNodeEdges){
        var edge = friendlyActionCyNodeEdges[edgeIndex];
        edges.push(edge);
    }
    var worstNode = getWorstScoreSibling(friendlyActionCyNodeChildren);
    addChildStateNodeOfWorstEnemyAction(worstNode);
}
function addChildStateNodeOfWorstEnemyAction(enemyActionCyNode){
    try {
        var node = enemyActionCyNode.data("sc2_cyChildren")[0];
    }
    catch(error){
        var node = enemyActionCyNode["data"]["sc2_cyChildren"][0];
    }
    treeData["elements"]["nodes"].push(node);
    // add edges
    try{
        var edge = enemyActionCyNode.data("sc2_cyEdgesToCyChildren")[0];
    }
    catch(error){
        var edge = enemyActionCyNode["data"]["sc2_cyEdgesToCyChildren"][0];
    }
    treeData["elements"]["edges"].push(edge);
    addFriendlyActionChildrenOfStateNode(node);
}

var enemyActionShapePoints =    [-1, -1, 1, -1, 1, .75, 0, 1, -1, .75]
var friendlyActionShapePoints = [-1, 1, 1, 1, 1, -.75, 0, -1, -1, -.75]
// from raw json, populating cytoscape data (recursive)
function buildFriendlyActionCynodesUnderStateNode(jsonStateNode, cyStateNode){
   cyStateNode["data"]["sc2_cyChildren"] = [];
   cyStateNode["data"]["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonStateNode["children"][0];
    for (var childIndex in children){
        var jsonFriendlyActionNode = children[childIndex];
        var className = "friendlyAction";
        var cyFriendlyActionNode = getCyNodeFromJsonNode(jsonFriendlyActionNode, jsonStateNode["name"], className);
        var chartValues = jsonFriendlyActionNode["decom best q_value"];
        if (chartValues == undefined){
            chartValues = [ 0.1, 0.025, 0.05, 0.7, 0.05, 0.025, 0.025, 0.025];
        }
        cyFriendlyActionNode["data"]["chartData"] = createChartData(chartValues);
        cyFriendlyActionNode["data"]["type"] = "friendlyAction";
        cyFriendlyActionNode["data"]["points"] = friendlyActionShapePoints;
        cyFriendlyActionNode["data"]["sc2_cyParent"] = cyStateNode;
        cyFriendlyActionNode["data"]["sc2_nodeType"] = className;
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonStateNode["name"]), trimBestNotationDuplicate(cyFriendlyActionNode["data"]["id"]));
        cyStateNode["data"]["sc2_cyChildren"].push(cyFriendlyActionNode);
        cyStateNode["data"]["sc2_cyEdgesToCyChildren"].push(cyEdge);
        buildEnemyActionCynodesUnderFriendlyActionCynodes(jsonFriendlyActionNode, cyFriendlyActionNode);
    }
}


function buildEnemyActionCynodesUnderFriendlyActionCynodes(jsonFriendlyActionNode, cyFriendlyActionNode){
    cyFriendlyActionNode["data"]["sc2_cyChildren"] = [];
    cyFriendlyActionNode["data"]["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonFriendlyActionNode["children"][0];
    for (var childIndex in children){
        var jsonEnemyActionNode = children[childIndex];
        var className = "enemyAction";
        var cyEnemyActionNode = getCyNodeFromJsonNode(jsonEnemyActionNode, jsonFriendlyActionNode["name"], className);
        cyEnemyActionNode["data"]["type"] = "enemyAction";
        cyEnemyActionNode["data"]["points"] = enemyActionShapePoints;
        cyEnemyActionNode["data"]["sc2_cyParent"] = cyFriendlyActionNode;
        cyEnemyActionNode["data"]["sc2_nodeType"] = className;

        var cyEdge = getEdge(trimBestNotationDuplicate(jsonFriendlyActionNode["name"]), trimBestNotationDuplicate(cyEnemyActionNode["data"]["id"]));
        cyFriendlyActionNode["data"]["sc2_cyChildren"].push(cyEnemyActionNode);
        cyFriendlyActionNode["data"]["sc2_cyEdgesToCyChildren"].push(cyEdge);
        buildStateCyNodeUnderEnemyActionCynode(jsonEnemyActionNode, cyEnemyActionNode);
    }
}
  
function buildStateCyNodeUnderEnemyActionCynode(jsonEnemyActionNode, cyEnemyActionNode){
    cyEnemyActionNode["data"]["sc2_cyChildren"] = [];
    cyEnemyActionNode["data"]["sc2_cyEdgesToCyChildren"] = [];
    var children = jsonEnemyActionNode["children"][0];
    for (var childIndex in children){
        var jsonStateNode = children[childIndex];
        var className = "stateNode";
        var cyStateNode = getCyNodeFromJsonNode(jsonStateNode, jsonEnemyActionNode["name"], className);
        cyStateNode["data"]["sc2_nodeType"] = className;
        cyStateNode["data"]["sc2_cyParent"] = cyEnemyActionNode;
        cyStateNode["data"]["state"] = jsonStateNode["state"];

        var cyEdge = getEdge(trimBestNotationDuplicate(jsonEnemyActionNode["name"]), trimBestNotationDuplicate(cyStateNode["data"]["id"]));
        cyEnemyActionNode["data"]["sc2_cyChildren"].push(cyStateNode);
        cyEnemyActionNode["data"]["sc2_cyEdgesToCyChildren"].push(cyEdge);
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
    rootNode["data"]["id"] = trimBestNotationDuplicate(inputJsonTree["name"]);
    rootNode["data"]["root"] = "iAmRoot";
    rootNode["classes"] = "stateNode rootNode principalVariation";
    rootNode["data"]["sc2_nodeType"] = "stateNode";
    return rootNode;
}



function removeFriendlyActionChildrenOfStateNode(stateCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var stateCyNodeChildren = stateCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var stateCyNodeChildren = stateCyNode["data"]["sc2_cyChildren"]
    }
    for (var nodeIndex in stateCyNodeChildren){
        var node = stateCyNodeChildren[nodeIndex];
        for (var treeDataNodeIndex in nodes){
            var currNodeData = nodes[treeDataNodeIndex]["data"];
            if (currNodeData["id"] == node["data"]["id"]){
                nodes.splice(treeDataNodeIndex, 1);
            }
        }
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    try{
        var stateCyNodeEdges = stateCyNode.data("sc2_cyEdgesToCyChildren");
    }
    catch(error){
        var stateCyNodeEdges = stateCyNode["data"]["sc2_cyEdgesToCyChildren"]
    }
    for (var edgeIndex in stateCyNodeEdges){
        var edge = stateCyNodeEdges[edgeIndex];
        for (treeDataEdgeIndex in edges){
            var currEdgeData = edges[treeDataEdgeIndex]["data"]
            if (currEdgeData["target"] == edge["data"]["target"] && currEdgeData["source"] == edge["data"]["source"]){
                edges.splice(treeDataEdgeIndex, 1);
            }
        }
    }
    var bestNode = getBestScoreSibling(stateCyNodeChildren);
    if (bestNode != undefined){
        removeEnemyActionChildrenOfBestFriendlyAction(bestNode);
    }
}
function removeEnemyActionChildrenOfBestFriendlyAction(friendlyActionCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var friendlyActionCyNodeChildren = friendlyActionCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var friendlyActionCyNodeChildren = friendlyActionCyNode["data"]["sc2_cyChildren"]
    }
    for (var nodeIndex in friendlyActionCyNodeChildren){
        var node = friendlyActionCyNodeChildren[nodeIndex];
        for (var treeDataNodeIndex in nodes){
            var currNodeData = nodes[treeDataNodeIndex]["data"];
            if (currNodeData["id"] == node.data["id"]){
                nodes.splice(treeDataNodeIndex, 1);
            }
        }
    }
    // add edges
    var edges = treeData["elements"]["edges"];
    try{
        var friendlyActionCyNodeEdges = friendlyActionCyNode.data("sc2_cyEdgesToCyChildren");
    }
    catch(error){
        var friendlyActionCyNodeEdges = friendlyActionCyNode["data"]["sc2_cyEdgesToCyChildren"]
    }
    for (var edgeIndex in  friendlyActionCyNodeEdges){
        var edge = friendlyActionCyNodeEdges[edgeIndex];
        for (treeDataEdgeIndex in edges){
            var currEdgeData = edges[treeDataEdgeIndex]["data"]
            if (currEdgeData["target"] == edge["data"]["target"] && currEdgeData["source"] == edge["data"]["source"]){
                edges.splice(treeDataEdgeIndex, 1);
            }
        }
    }
    var worstNode = getWorstScoreSibling(friendlyActionCyNodeChildren);
    removeChildStateNodeOfWorstEnemyAction(worstNode);
}
function removeChildStateNodeOfWorstEnemyAction(enemyActionCyNode){
    try {
        var node = enemyActionCyNode.data("sc2_cyChildren")[0];
    }
    catch(error){
        var node = enemyActionCyNode["data"]["sc2_cyChildren"][0];
    }
    var nodes = treeData["elements"]["nodes"];
    for (var treeDataNodeIndex in nodes){
        var currNodeData = nodes[treeDataNodeIndex]["data"];
        if (currNodeData["id"] == node["data"]["id"]){
            nodes.splice(treeDataNodeIndex, 1);
        }
    }
    // add edges
    try{
        var edge = enemyActionCyNode.data("sc2_cyEdgesToCyChildren")[0];
    }
    catch(error){
        var edge = enemyActionCyNode["data"]["sc2_cyEdgesToCyChildren"][0];
    }
    var edges = treeData["elements"]["edges"];
    for (treeDataEdgeIndex in edges){
        var currEdgeData = edges[treeDataEdgeIndex]["data"]
        if (currEdgeData["target"] == edge["data"]["target"] && currEdgeData["source"] == edge["data"]["source"]){
            edges.splice(treeDataEdgeIndex, 1);
        }
    }
    removeFriendlyActionChildrenOfStateNode(node);
}
