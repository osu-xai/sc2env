
var userExpandedNodes = [];

function intitTreeEvents(cy){
    if (currFocusNode != undefined){
        cy.nodes().forEach(function (node){
            if (node.data("id") == currFocusNode.data("id")){
                currFocusNode = node;
                disableActionMenu();
                var actionButtonsToBeActivted = checkMenuAvailibleActions(currFocusNode);
                enableActionMenu(actionButtonsToBeActivted);
                highlightNode(currFocusNode);
            }
        });
    }
    handleClickEvent(cy);
}

function showNextBestAction(){
    if (currFocusNode.hasClass("stateNode")){
        addNextBestChild(cy, currFocusNode);
        refreshCy();
    }
    else{
        alert("Actions can only be expanded from state nodes! Please select a state node then add an action.");
    }
}

// function showNextBestFuture(){
//     addNextBestPrincipalVariation(cy, currFocusNode);
//     refreshCy();
// }

function hideNode(){
    
    removeNode(cy, currFocusNode);
    disableActionMenu();
    refreshCy();
}

function hideFuture(){
    removePrincipalVariation(cy, currFocusNode);
    refreshCy();
}

function expandFuture(){
    if (currFocusNode.hasClass("stateNode") != true){
        addPrincipalVariationFromStartingNode(cy, currFocusNode);
        refreshCy();
    }
    else{
        alert("Can only expand from an action node. Please select an action node and expand");
    }
}

var selectedNodeClasses = undefined;
var currFocusNode = undefined;
function handleClickEvent(cy){
    cy.on('click', 'node', function (evt) { 
        var currNode = evt.target;
        
        leftJustifyNodes(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        if (currNode.hasClass("stateNode") == true || currNode.hasClass("friendlyAction") == true){
            if (currFocusNode == undefined){
                // clicking a node activates its menu
                disableActionMenu(); // clear menu of previous activated options
                var actionButtonsToBeActivted = checkMenuAvailibleActions(currNode);
                enableActionMenu(actionButtonsToBeActivted);
                currFocusNode = currNode;
                highlightNode(currFocusNode);

            }
            else if (currFocusNode == currNode){
                // clicking the same node again turns off the menu
                removeHighlightNode(currFocusNode);
                disableActionMenu();
                currFocusNode = undefined;
            }
            else {
                removeHighlightNode(currFocusNode);
                disableActionMenu(); // clear menu of previous active options
                // clicking node n when node m has a menu just changes the currFocusNode
                currFocusNode = currNode;
                var actionButtonsToBeActivted = checkMenuAvailibleActions(currFocusNode);
                enableActionMenu(actionButtonsToBeActivted);   
                highlightNode(currFocusNode);
            }
        }
        else{
            removeHighlightNode(currFocusNode);
            disableActionMenu();
            currFocusNode = undefined;
        }
    });
}
function highlightNode(n){
    var nId = n.data("id");
    if (n.data("id") == nId){
        n.style("background-color", "navy");
    }
}
function removeHighlightNode(n){
    var nId = n.data("id");
    if (n.hasClass("principalVariation") == true){
        n.style("background-color", "#999999");// was SteelBlue  003300
    }
    else{
        n.style("background-color", "LightSlateGray");
    }       
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
function disableActionMenu(){
    for (var i in actionButtonIds){
        var id = actionButtonIds[i];
        disableActionMenuButton(id);
    }
}
function enableActionMenu(actionButtonsToBeActivted){
    for (var i in actionButtonsToBeActivted){
        var id = actionButtonsToBeActivted[i];
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
        if (currFocusNode != undefined){
            highlightNode(currFocusNode);
        }
        restateLayout(cy);
        //sortNodes(cy);
        verticallyAdjustEnemyActions(cy);
        leftJustifyNodes(cy);
        intitTreeEvents(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        childrenFollowParents(cy);
        if (sc2Treatment  == "ModelFree"){
            cy.zoom({
                level: treeZoom
              });
            var panInfo = {};
            panInfo["x"] = treePanX;
            panInfo["y"] = treePanY;
            cy.pan(panInfo);
        }
    });
}
