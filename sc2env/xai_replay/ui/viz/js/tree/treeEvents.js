
var userExpandedNodes = [];
function intitTreeEvents(cy){
    //toggle show and hide nodes on click.
    addOrRemoveSubTree(cy);
    cy.center(cy.nodes());
}

function addOrRemoveSubTree(cy){
    cy.on('click', 'node', function (evt) {
        var currNode = evt.target;
        alert(currNode.data("id"))
        if (currNode.successors().targets().size() <= 0){
            populatePrincipalVariationTree(currNode);
            if (currNode.hasClass("principalVariation") == false){
                userExpandedNodes.push(currNode.data("id"));
            }
            cy = cytoscape(treeData);
        }
        else{
            var currentNodeId = currNode.data("id");
            removePrincipalVariationTree(currNode);
            cy = cytoscape(treeData);
            for (var i = 0; i < userExpandedNodes.length; i++){
                if (userExpandedNodes[i].indexOf(currentNodeId) != -1){
                    cy.$('#' + userExpandedNodes[i]).removeClass("selectedNode")
                    userExpandedNodes.splice(i, 1);
                } 
            }  
        }
        cy.ready(function (){
            for (var i = 0; i < userExpandedNodes.length; i++){
                var newSubTree = cy.$('#' + userExpandedNodes[i]).successors().targets();
                newSubTree.addClass("userAddedNode");
                var clickedOnNode = cy.$('#' + userExpandedNodes[i]);
                clickedOnNode.addClass("selectedNode");

                cy.style()        
                .selector('.userAddedNode')
                .css({
                    'background-color': 'SlateBlue',
                })
                .selector('.selectedNode')
                .css({
                    'background-color': 'PaleVioletRed',
                })
                .update();    
            }         
        });
        childrenFollowParents(cy);
        sortNodes(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        intitTreeEvents(cy);
    });
}