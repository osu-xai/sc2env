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

function populateNextBestTrajectory(clickedNode){
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
    try{
        var children = clickedNode.data("sc2_cyChildren");
        var edgesToChildren = clickedNode.data("sc2_cyEdgesToCyChildren");
        var currRenderedChildren = clickedNode.outgoers().targets();
        var nonRenderedChildren = [];

        for (childIndex in children){
            var currChild = children[childIndex];
            var isRendered = false;
            currRenderedChildren.forEach(function (child){
                var childId = child.data("id");
                if (currChild["data"]["id"] == childId){
                    isRendered = true;
                }
            });     
            if (isRendered == false){
                nonRenderedChildren.push(currChild);        
            }
        }
        var nextBestChild = getBestScoreSibling(nonRenderedChildren);
        nodes.push(nextBestChild);

    }
    catch{
        var children = clickedNode["data"]["sc2_cyChildren"];
        var edgesToChildren = clickedNode["data"]["sc2_cyEdgesToCyChildren"];
        var nextBestChild = getBestScoreSibling(children);
        nodes.push(nextBestChild);

    }


    var currEdge = undefined;
    for (var edgesIndex in edgesToChildren){
        currEdge = edgesToChildren[edgesIndex];
        if (currEdge["data"]["target"] == nextBestChild["data"]["id"]){
            edges.push(currEdge);
        }
    }
    if (nextBestChild != undefined){
        populatePrincipalVariationTrajectory(nextBestChild);
    }
    return;
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
        addWorstEnemyActionToTrajectory(bestNode);
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

function removePrincipalVariationTrajectory(startingCyNode){
    var startingNodeChildren = startingCyNode.outgoers().targets()

    if (startingCyNode.data("name").indexOf("_action_max") != -1){
        removeEnemyActionChildrenOfBestFriendlyAction(startingCyNode)
    }
    else if (startingCyNode.data("name").indexOf("_action_min") != -1){
        removeChildStateNodeOfWorstEnemyAction(startingCyNode);
    }
    else{
        if (startingNodeChildren.size() == 2){
            var secondBestNode = undefined;
            startingNodeChildren.forEach(function (currChild){
                try{
                    var currChildQVal = currChild.data("best q_value");
                }
                catch{
                    var currChildQVal = currChild["data"]["best q_value"];
                }
                if (secondBestNode == undefined){
                    secondBestNode = currChild;
                }
                if (currChildQVal < secondBestNode["data"]["best q_value"]){
                    secondBestNode = currChild;
                }
            });
        }
        removeChildNodeFromTrajectory(secondBestNode);
    }
}

function removeChildNodeFromTrajectory(startingCyNode){
    // add nodes
    var nodes = treeData["elements"]["nodes"];
    var node = startingCyNode.outgoers().targets();
    if (node.size() == 0){
        return;
    }
    for (var treeDataNodeIndex in nodes){
        var currNodeData = nodes[treeDataNodeIndex]["data"];
        if (currNodeData["id"] == node.data("id")){
            nodes.splice(treeDataNodeIndex, 1);
        }
    }
    // add edges
    var edges = treeData["elements"]["edges"];

    for (treeDataEdgeIndex in edges){
        var currEdgeData = edges[treeDataEdgeIndex]["data"]
        if (currEdgeData["target"] == node["data"]["id"]){
            edges.splice(treeDataEdgeIndex, 1);
        }
    }
    removeChildNodeFromTrajectory(node);
}
function removeEnemyActionChildrenOfBestFriendlyActionFromTrajectory(friendlyActionCyNode){
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
    removeChildStateNodeOfWorstEnemyActionFromTrajectory(worstNode);
}
function removeChildStateNodeOfWorstEnemyActionFromTrajectory(enemyActionCyNode){
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
    removeFriendlyActionChildrenOfStateNodeFromTrajectory(node);
}
