
var userExpandedNodes = [];

function intitTreeEvents(cy){
    handleClickEvent(cy);
    cy.center(cy.nodes());
}

function showNextBestAction(){
    addSibling(cy, currFocusNode);
    refreshCy();
}

function showNextBestFuture(){
    addNextBestPrincipalVariation(cy, currFocusNode);
    refreshCy();
}

function hideNode(){
    removeNode(cy, currFocusNode);
    refreshCy();
}

function hideFuture(){
    removePrincipalVariation(cy, currFocusNode);
    refreshCy();
}

function expandFuture(){
    addPrincipalVariationFromStartingNode(cy, currFocusNode);
    refreshCy();
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
    for (var i in actionButtonIds){
        var id = actionButtonIds[i];
        disableActionMenuButton(id);
    }
}
function enableActionMenu(){
    for (var i in actionButtonIds){
        var id = actionButtonIds[i];
        enableActionMenuButton(id);
    }
}

function disableActionMenuButton(id){
    $("#" + id).attr("disabled", true);
    colorButtonDisabled(id);
}

function enableActionMenuButton(id){
    $("#" + id).attr("disabled", false);
    colorButtonEnabled(id);
}

function refreshCy(){
    cy.destroy();
    cy = cytoscape(treeData);
    cy.ready(function(){
        restateLayout(cy);
        childrenFollowParents(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        sortNodes(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        intitTreeEvents(cy);
    });
}