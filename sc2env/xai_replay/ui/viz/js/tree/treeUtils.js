var trajectoryStartingEdges = {};

function getLargestUnitCount(cy){
    var biggestUnitCountAtState = 0;
    var biggestUnitCountAtAction = 0;
    cy.nodes().forEach(function( ele ){
      var unitValuesDict = parseActionString(ele.data());
      var biggestUnitCount = getNumberOfColumns(unitValuesDict);
      if (ele.data("id").indexOf("_action_max") != -1 || ele.data("id").indexOf("_action_min") != -1){
        if (biggestUnitCount > biggestUnitCountAtAction){
          biggestUnitCountAtAction = biggestUnitCount;
        }
      }
      else{
        if (biggestUnitCount > biggestUnitCountAtState){
          biggestUnitCountAtState = biggestUnitCount;
        }
      }
    });
    return [biggestUnitCountAtState, biggestUnitCountAtAction];
  }

  

// action_max present == friendly action, action_min present== enemy action 
//friendly does work for enemy actions - enemy key only references enemy state.  For enemy action nodes the friendly max value is 
// taken from the perspective of the enemy actually being the friendly.  
function getNumberOfColumns(unitValuesDict){
    var unitValuesDictEnemy = undefined;
    var maxActionTakenEnemy = undefined;
    var enemyMaxValue = undefined;
  
    if ("Enemy" in unitValuesDict){
      // have to null out this value to prevent a dictionary from being interpreted as a value (it was made a dictionary to enable code reuse)
      unitValuesDictEnemy = unitValuesDict["Enemy"];
      unitValuesDict["Enemy"] = null;
    }
  
    var maxActionTaken = Object.keys(unitValuesDict).reduce(function(a, b){ return unitValuesDict[a] > unitValuesDict[b] ? a : b });
    var maxValue = unitValuesDict[maxActionTaken];
  
    if ("Enemy" in unitValuesDict){
      maxActionTakenEnemy = Object.keys(unitValuesDictEnemy).reduce(function(a, b){ return unitValuesDictEnemy[a] > unitValuesDictEnemy[b] ? a : b });
      enemyMaxValue = unitValuesDictEnemy[maxActionTakenEnemy];
      if (enemyMaxValue > maxValue){
        if (enemyMaxValue < 5){
          return 5;
        }
        return enemyMaxValue;
      }
      else{
        if (maxValue < 5){
          return 5;
        }
        return maxValue;
      }
    }
    else{
      if (maxValue < 5){
        return 5;
      }
      return maxValue;
    }
  }

  

function parseActionString(data){
    if (data["action"] == null){
      var stateDict = getStateValues(data);
      return stateDict;
    }
    else{
      var actionDict = getActionValues(data);
      return actionDict;
    }
}



// html id's don't allow parens.  Xian only removed the parens from one instance, not the duplicate, so we mop up.
function trimBestNotationDuplicate(id){
    var index = id.indexOf("(best)");
    if (index != -1){
        
    }
    return id;
}


// search at each depth level for siblings and then if finds, check whether it's principle variation is higher (action_max), and x coordinate
// higher (farther to the right), then switch places with sibling.
function sortNodes(cy){
    cy.nodes().forEach(function( ele ){
        var currParent = ele.incomers().sources();
        var currSiblings = currParent.outgoers().targets();
        currSiblings.forEach(function( sib ){
            if (ele.data("id").indexOf("_action_max") != -1){
                if (ele.data("best q_value") > sib.data("best q_value") && ele.position('x') > sib.position('x')){
                    var switchPosition = ele.position('x');
                    ele.position('x', sib.position('x')); 
                    sib.position('x', switchPosition);
                    switchChildrenPositions(cy, ele, sib)
                }
            }
            else if (ele.data("id").indexOf("_action_min") != -1){
                if (ele.data("best q_value") < sib.data("best q_value") && ele.position('x') > sib.position('x')){
                    var switchPosition = ele.position('x');
                    ele.position('x', sib.position('x')); 
                    sib.position('x', switchPosition);
                    switchChildrenPositions(cy, ele, sib)
                }
            }
        });
    });
}

function restateLayout(cy){
  cy.style().fromString(treeStyle).update()
  var layout = cy.layout(treeLayout);
  layout.run();
}


function switchChildrenPositions(cy, currNode, switchNode){
    var currNodeChildren = currNode.successors().targets();
    var switchNodeChildren = switchNode.successors().targets();
  
    var currNodeChildrenPositions = [];
    currNodeChildren.forEach(function( child ){
        currNodeChildrenPositions.push(child.relativePosition('x'));
    });
    var switchChildrenPositions = [];
    switchNodeChildren.forEach(function( child ){
        switchChildrenPositions.push(child.relativePosition('x'));
    });
    
    var i = 0;
    switchNodeChildren.forEach(function( child ){
        child.relativePosition('x', currNodeChildrenPositions[i]);
        i++;
    });
    i = 0;
    currNodeChildren.forEach(function( child ){
        child.relativePosition('x', switchChildrenPositions[i]);
        i++;
    });
}

var actionButtonIds = [];  
function generateNodeActionMenu(id){
    var div = document.getElementById(id);
    //$("#" + id).css("visibility", "hidden");
    $("#" + id).css("padding", "20px");
    $("#" + id).css("background-color", "#E0E0E0");

    var nodeActionsLabel = document.createElement("LABEL");
    nodeActionsLabel.setAttribute("id", "node-actions-label");
    nodeActionsLabel.innerHTML = "Node Actions";    
    div.append(nodeActionsLabel);
    $("#node-actions-label").css("font-size", "30px");
    $("#node-actions-label").css("text-align", "center");
    $("#node-actions-label").css("padding", "20px");

    var nextBestActionId = "next-best-action-button";
    var nextBestActionButton = getNodeActionButton(nextBestActionId, "Show next best action", showNextBestAction);
    div.append(nextBestActionButton)
    decorateNodeActionButton(nextBestActionId);
    actionButtonIds.push(nextBestActionId);

    var nextBestFutureId = "next-best-future-button";
    var nextBestFutureButton = getNodeActionButton(nextBestFutureId, "Show next best future", showNextBestFuture);
    div.append(nextBestFutureButton)
    decorateNodeActionButton(nextBestFutureId);
    actionButtonIds.push(nextBestFutureId);

    var hideNodeId = "hide-node-button";
    var hideNodeButton = getNodeActionButton(hideNodeId, "Hide node", hideNode);
    div.append(hideNodeButton)
    decorateNodeActionButton(hideNodeId);
    actionButtonIds.push(hideNodeId);

    var hidePvId = "hide-pv-button";
    var hidePvButton = getNodeActionButton(hidePvId, "Hide future", hideFuture);
    div.append(hidePvButton)
    decorateNodeActionButton(hidePvId);
    actionButtonIds.push(hidePvId);

    var expandPvId = "expand-pv-button";
    var expandPvButton = getNodeActionButton(expandPvId, "Expand future", expandFuture);
    div.append(expandPvButton)
    decorateNodeActionButton(expandPvId);
    actionButtonIds.push(expandPvId);
}

function getNodeActionButton(id, buttonText, f){
    var b = document.createElement("button");
    b.setAttribute("id", id);
    b.setAttribute("width", "200px");
    var text = document.createTextNode(buttonText);
    b.appendChild(text);
    b.onmousedown = function(){ depressButton(id); };
    b.onmouseup = function(){ undepressButton(id); f() };
    return b;
}
function decorateNodeActionButton(id){
    var sel = "#" + id;
    $(sel).css("margin", "3px");
    $(sel).css("border-width", "1px");
    $(sel).css("opacity", "1.0");
    $(sel).css("color", "white");
    $(sel).css("font-family", "Arial");
    $(sel).attr("disabled", "true");
    colorButtonDisabled(id);
}
