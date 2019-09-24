
var userExpandedNodes = [];
function intitTreeEvents(cy){
    handleClickEvent(cy);
    cy.center(cy.nodes());
}

function showNextBestAction(){
    addSibling(cy, currFocusNode);
}
function showNextBestFuture(){
    addOrRemoveTrajectory(currFocusNode);
}
var selectedNodeClasses = undefined;
var currFocusNode = undefined;
function handleClickEvent(cy){
    cy.on('click', 'node', function (evt) {
        var currNode = evt.target;
      
        if (currFocusNode == undefined){
            // clicking a node activates its menu
            enableActionMenu();
            //highlightNode(currNode);
            currFocusNode = currNode;
        }
        else if (currFocusNode == currNode){
            // clicking the same node again turns off the menu
            disableActionMenu();
            currFocusNode = undefined;
        }
        else {
            // clicking node n when node m has a menu just changes the currFocusNode
            currFocusNode = currNode;
        }
    });
}
function highlightNode(n){
    n["classes"] = " highlightedNode" ;
    refreshCy();
}
function colorButtonEnabled(id){
    $("#" + id).css("background-image", "linear-gradient(rgb(40, 72, 251) 1%, rgb(4, 31, 185) 5%, rgb(4, 18, 117) 60%)"); 
}
function colorButtonDisabled(id){
    $("#" + id).css("background-image", "linear-gradient(rgb(200, 200, 251) 1%, rgb(150, 150, 185) 5%, rgb(80, 80, 117) 60%)");
}
function depressButton(id){
    $("#" + id).css("background-image", "linear-gradient(rgb(40, 72, 100) 1%, rgb(4, 31, 50) 5%, rgb(4, 18, 30) 60%)");
}
function undepressButton(id){
    colorButtonEnabled(id);
}
function disableActionMenu(id){
    $("#next-best-action-button").attr("disabled", true);
    $("#next-best-future-button").attr("disabled", true);
    colorButtonDisabled("next-best-action-button");
    colorButtonDisabled("next-best-future-button");
    
}
function enableActionMenu(){
    $("#next-best-action-button").attr("disabled", false);
    $("#next-best-future-button").attr("disabled", false);
    colorButtonEnabled("next-best-action-button");
    colorButtonEnabled("next-best-future-button");
    
}
function handleClickEventOrig(cy){
    cy.on('click', 'node', function (evt) {
        var currNode = evt.target;
        //if(document.getElementById("trajectory-view").checked == true){
        //    addOrRemoveTrajectory(currNode);
        //}
        ////else{
        addOrRemoveIncrementalTree(currNode);
//}
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