var backingTreeRoot = undefined;
var buildTreeOnDemand = true;
var frameOfCurrentTree = undefined;
function forgetBackingTree(){
    backingTreeRoot = undefined;
}
function generateBackingTreeOfCynodes(jsonStateNode){
    backingTreeRoot = createBackingTreeRootNode(jsonStateNode);
    buildFriendlyActionCynodesUnderStateNode(jsonStateNode, backingTreeRoot);
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
        var edgeClass = getEdgeClassFromParentNode(cyFriendlyActionNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonStateNode["name"]), trimBestNotationDuplicate(cyFriendlyActionNode["data"]["id"]), edgeClass);
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
        var edgeClass = getEdgeClassFromParentNode(cyEnemyActionNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonFriendlyActionNode["name"]), trimBestNotationDuplicate(cyEnemyActionNode["data"]["id"]), edgeClass);
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
        var edgeClass = getEdgeClassFromParentNode(cyStateNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonEnemyActionNode["name"]), trimBestNotationDuplicate(cyStateNode["data"]["id"]), edgeClass);
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
