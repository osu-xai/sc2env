function populatePrincipalVariationTrajectory(startingCyNode){
    var nodes = treeData["elements"]["nodes"];
    nodes.push(startingCyNode);
    try{
        var startingNodeDataName = startingCyNode.data("name");
    }
    catch{
        var startingNodeDataName = startingCyNode["data"]["name"];
    }
    if (startingNodeDataName.indexOf("_action_max") != -1){
        addWorstEnemyActionToTrajectory(startingCyNode)
    }
    else if (startingNodeDataName.indexOf("_action_min") != -1){
        addChildStateNodeOfWorstEnemyActionToTrajectory(startingCyNode);
    }
    else{
        addBestFriendlyActionToTrajectory(startingCyNode);
    }
}

function addBestFriendlyActionToTrajectory(stateCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var stateCyNodeChildren = stateCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var stateCyNodeChildren = stateCyNode["data"]["sc2_cyChildren"]
    }
    var bestNode = getBestScoreSibling(stateCyNodeChildren);
    if (bestNode != undefined){
        nodes.push(bestNode);
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
            if (bestNode["data"]["id"] == edge["data"]["target"]){
                edges.push(edge);
            }
        }
        if(isTreatmentModelBased()){
            addWorstEnemyActionToTrajectory(bestNode);
        }
        else{
            return;
        }
    }    
}
function addWorstEnemyActionToTrajectory(friendlyActionCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    try{
        var friendlyActionCyNodeChildren = friendlyActionCyNode.data("sc2_cyChildren");
    }
    catch(error){
        var friendlyActionCyNodeChildren = friendlyActionCyNode["data"]["sc2_cyChildren"]
    }
    var worstNode = getWorstScoreSibling(friendlyActionCyNodeChildren);
    nodes.push(worstNode);
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
        if (worstNode["data"]["id"] == edge["data"]["target"]){
            edges.push(edge);
        }
    }
    addChildStateNodeOfWorstEnemyActionToTrajectory(worstNode);
}

function addChildStateNodeOfWorstEnemyActionToTrajectory(enemyActionCyNode){
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
    addBestFriendlyActionToTrajectory(node);
}
