
var nodeCount = 0;

function validateStateNode(node){
    console.log("examining node " + node["data"]["id"]);
    nodeCount = nodeCount + 1;
    var children = node["sc2_cyChildren"];
    for (var childIndex in children){
        var friendlyAction = children[childIndex];
        console.log("found friendlyAction child " + friendlyAction["data"]["id"] + " of state node "+ node["data"]["id"]);
        validateFriendlyActionNode(friendlyAction);
    }
}
function validateFriendlyActionNode(node){
    nodeCount = nodeCount + 1;
    console.log("examining node " + node["data"]["id"]);
    var children = node["sc2_cyChildren"];
    for (var childIndex in children){
        var enemyAction = children[childIndex];
        console.log("found enemyAction child " + enemyAction["data"]["id"] + " of friendly Action node "+ node["data"]["id"]);
        validateEnemyActionNode(enemyAction);
    }
}
function validateEnemyActionNode(node){
    nodeCount = nodeCount + 1;
    console.log("examining node " + node["data"]["id"]);
    var children = node["sc2_cyChildren"];
    for (var childIndex in children){
        var stateNode = children[childIndex];
        console.log("found stateNode child " + stateNode["data"]["id"] + " of enemy Action node "+ node["data"]["id"]);
        validateStateNode(stateNode);
    }
}