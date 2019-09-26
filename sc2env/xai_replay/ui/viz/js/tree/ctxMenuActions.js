// used when you only want the sibling with no PV
// gets the next best sibling for the selected node (contextNode)
// contextNode must be a cytoscape node.
function addSibling(cy, contextNode){
    var contextNodeId = contextNode.data("id");
    var contextNodeParent = contextNode.incomers().sources();
    var contextNodeAndSiblings = contextNodeParent.data("sc2_cyChildren");
    var contextNodeAndSiblingsEdges = contextNodeParent.data("sc2_cyEdgesToCyChildren");
    var nextBestSibling = undefined;
    for (var i = 0; i < contextNodeAndSiblings.length; i++){
        var sibling = contextNodeAndSiblings[i];
        var siblingId = sibling["data"]["id"];
        var siblingQVal = sibling["data"]["best q_value"];
        if (siblingId != contextNodeId){
            var isSiblingInTree = false;
            cy.nodes().forEach(function (node){
                if (node.data("id") == siblingId){
                    isSiblingInTree = true;
                }
            });
            if (isSiblingInTree != true){
                if (nextBestSibling == undefined){
                    nextBestSibling = sibling;
                }
                if(siblingId.indexOf("_max") != -1){
                    if (nextBestSibling["data"]["best q_value"] < siblingQVal){
                        nextBestSibling = sibling;
                    }   
                }
                else{
                    if (nextBestSibling["data"]["best q_value"] > siblingQVal){
                        nextBestSibling = sibling;
                    }   
                }
                   
            }
        }
    }
    if (nextBestSibling != undefined){
        var nodes = treeData["elements"]["nodes"];
        var edges = treeData["elements"]["edges"];
        nodes.push(nextBestSibling);
        for (var e = 0; e < contextNodeAndSiblingsEdges.length; e++){
            var edge = contextNodeAndSiblingsEdges[e];
            if (edge["data"]["source"] == contextNodeParent.data("id") && edge["data"]["target"] == nextBestSibling["data"]["id"]){
                edges.push(edge);
            }
        }
        cy = cytoscape(treeData);
        return nextBestSibling;
    }
}

//used when you want to remove a node and its subtree (if one exists)
//selected node (contextNode) will be removed and anything attached below
//requires a cytoscape node for contextNode.
function removeNode(cy, contextNode){
    var contextNodeId = contextNode.data("id");
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
    for (var n = 0; n < nodes.length; n++){
        var node = nodes[n];
        var nodeId = node["data"]["id"];
        if (nodeId == contextNodeId){
            nodes.splice(n, 1);
        }
    }
    for (var e = 0; e < edges.length; e++){
        var edge = edges[e];
        var edgeData = edge["data"];
        if (edgeData["target"] == contextNodeId){
            edges.splice(e, 1);
        }
    }
    if (contextNode.outgoers().targets().size() > 0){
        var contextNodeChildren = contextNode.outgoers().targets()
        contextNodeChildren.forEach(function (child){
            removeNode(cy, child);
        });
    }
}

//used to remove a PV and any subtrees from it.
//used to remove all children from selected node (contextNode)
//will not remove the selected node
function removePrincipalVariation(cy, contextNode){
    var contextNodeChildren = contextNode.outgoers().targets();
    contextNodeChildren.forEach(function (child){
        removeNode(cy, child);
    });
}

// creates a PV under the selected node (contextNode)
// requires a parent to already exist
// contextNode does not need to be a cytoscape node, but can be one.
function addNextBestChild(cy, contextNode){
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
    try{
        var children = contextNode.data("sc2_cyChildren");
        var edgesToChildren = contextNode.data("sc2_cyEdgesToCyChildren");
        var currRenderedChildren = contextNode.outgoers().targets();
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
        if (nonRenderedChildren.length > 0){
            if(contextNode.data("id").indexOf("_max") != -1){
                var nextBestChild = getWorstScoreSibling(nonRenderedChildren);
            }
            else{
                var nextBestChild = getBestScoreSibling(nonRenderedChildren);
            }
        }
        else{
            alert("No more actions to expand.");
        }
    }
    catch{
        var children = contextNode["data"]["sc2_cyChildren"];
        var edgesToChildren = contextNode["data"]["sc2_cyEdgesToCyChildren"];
        if(contextNode["data"]["id"].indexOf("_max") != -1){
            var nextBestChild = getWorstScoreSibling(children);
        }
        else{
            var nextBestChild = getBestScoreSibling(children);
        }
    }

    if (nextBestChild != undefined){
        var currEdge = undefined;
        for (var edgesIndex in edgesToChildren){
            currEdge = edgesToChildren[edgesIndex];
            if (currEdge["data"]["target"] == nextBestChild["data"]["id"]){
                edges.push(currEdge);
            }
        }
        nodes.push(nextBestChild);
        return nextBestChild;
    }
}
function addPrincipalVariationFromStartingNode(cy, contextNode){
    var nextBestChild = addNextBestChild(cy, contextNode);
    if (nextBestChild != undefined){
        addPrincipalVariationFromStartingNode(cy, nextBestChild)
    }

}

// will get the next best sibling of selected node (contextNode) then create its PV
// requires a sibling to be selected in order to get next best
// contextNode must be a cytoscape node
function addNextBestPrincipalVariation(cy, contextNode){
    var nextBestSibling = addSibling(cy, contextNode);
    //nextBestSibling does not need to be returned as a cytoscape node
    addPrincipalVariationFromStartingNode(cy, nextBestSibling);
}
