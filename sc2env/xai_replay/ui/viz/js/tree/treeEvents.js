
var userExpandedNodes = [];
function intitTreeEvents(cy){
    handleClickEvent(cy);
    cy.center(cy.nodes());
}


function handleClickEvent(cy){
    cy.on('click', 'node', function (evt) {
        var currNode = evt.target;
        if(document.getElementById("trajectory-view").checked == true){
            addOrRemoveTrajectory(currNode);
        }
        else{
            addOrRemoveIncrementalTree(currNode);
        }
    });
}

function addOrRemoveTrajectory(currNode){
    if (currNode.outgoers().targets().size() < currNode.data("sc2_cyChildren").length){
        addNextBestPrincipalVariation(cy, currNode);
        if (currNode.hasClass("principalVariation") == false){
            userExpandedNodes.push(currNode.data("id"));
        }
    }
    else{
        var currentNodeId = currNode.data("id");
        removePrincipalVariation(cy, currNode);
        for (var i = 0; i < userExpandedNodes.length; i++){
            if (userExpandedNodes[i].indexOf(currentNodeId) != -1){
                cy.$('#' + userExpandedNodes[i]).removeClass("selectedNode")
                userExpandedNodes.splice(i, 1);
            } 
        }  
    }
}

function addOrRemoveIncrementalTree(currNode){
    if (currNode.successors().targets().size() <= 0){
        populatePrincipalVariationTree(currNode);
        if (currNode.hasClass("principalVariation") == false){
            userExpandedNodes.push(currNode.data("id"));
        }
    }
    else{
        var currentNodeId = currNode.data("id");
        removePrincipalVariationTree(currNode);
        for (var i = 0; i < userExpandedNodes.length; i++){
            if (userExpandedNodes[i].indexOf(currentNodeId) != -1){
                cy.$('#' + userExpandedNodes[i]).removeClass("selectedNode")
                userExpandedNodes.splice(i, 1);
            } 
        }  
    }
    refreshCy();
}

function refreshCy(){
    cy = cytoscape(treeData);
    cy.ready(function (){
        if(userExpandedNodes.length != 0){
            for (var i = 0; i < userExpandedNodes.length; i++){
                var newSubTree = cy.$('#' + userExpandedNodes[i]).successors().targets();
                newSubTree.addClass("userAddedNode");
                var clickedOnNode = cy.$('#' + userExpandedNodes[i]);
                clickedOnNode.addClass("selectedNode");
            } 
        }
        restateLayout(cy);  
        childrenFollowParents(cy);
        sortNodes(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        intitTreeEvents(cy);      
    });
}