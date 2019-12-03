var trajectoryStartingEdges = {};

function getLargestUnitCount(cy){
    var biggestUnitCount = 0;
    cy.nodes().forEach(function( ele ){
        var unitValuesDict = parseActionString(ele.data());
        var currUnitCount = getNumberOfColumns(unitValuesDict);
        if (currUnitCount > biggestUnitCount){
            biggestUnitCount = currUnitCount;
        }
    });
    console.log("biggest unit count = " + biggestUnitCount);
    return biggestUnitCount;
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
      unitValuesDictEnemy = JSON.parse(JSON.stringify(unitValuesDict["Enemy"]));
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
    var unitValuesDict = getStateAndActionValues(data);
    return unitValuesDict;
}



// html id's don't allow parens.  Xian only removed the parens from one instance, not the duplicate, so we mop up.
function trimBestNotationDuplicate(id){
    var index = id.indexOf("(best)");
    if (index != -1){
        
    }
    return id;
}

function isNodeInCynodeList(node, cynodeList){
    for (var i in cynodeList){
        var cyNode = cynodeList[i];
        var cyNodeId = cyNode["data"]["id"];
        var nodeId = node["data"]["id"];
        if (nodeId == cyNodeId){
            return true;
        }
    }
    return false;
}
function gatherEnemyActionNodes(nodes){
    var result = [];
    for (var i in nodes){
        var node = nodes[i];
        if (node["data"]["sc2_nodeType"] == "enemyAction"){
            result.push(node);
        }
    }
    return result;
}
function restateLayout(cy){
  cy.style().fromString(treeStyle).update()
  var layout = cy.layout(treeLayout);
  layout.run();
}

var actionButtonIds = [];  
function generateNodeActionMenu(id, dp){
    var div = document.getElementById(id);
    var bigDPDiv = document.createElement("div");
    bigDPDiv.setAttribute("id", "big-dp-for-tree");
    bigDPDiv.setAttribute("style", "margin:auto;padding:10px;");
    var svgForBigDP = getSVGDP('big-dp-for-tree-svg', 85, 85, 35, dp, 0);
    bigDPDiv.innerHTML = svgForBigDP;
    div.append(bigDPDiv);
    //$("#" + id).css("visibility", "hidden");
    $("#" + id).css("padding", "12px");
    $("#" + id).css("background-color", "#E0E0E0");

    var nodeActionsLabel = document.createElement("LABEL");
    nodeActionsLabel.setAttribute("id", "node-actions-label");
    nodeActionsLabel.innerHTML = "Node Actions";    
    div.append(nodeActionsLabel);
    $("#node-actions-label").css("font-size", "30px");
    $("#node-actions-label").css("text-align", "center");
    $("#node-actions-label").css("padding", "0px");

    var nextBestActionId = "next-best-action-button";
    var nextBestActionButton = getNodeActionButton(nextBestActionId, "Show next best action", showNextBestAction);
    div.append(nextBestActionButton)
    decorateNodeActionButton(nextBestActionId);
    actionButtonIds.push(nextBestActionId);

    // var nextBestFutureId = "next-best-future-button";
    // var nextBestFutureButton = getNodeActionButton(nextBestFutureId, "Show next best future", showNextBestFuture);
    // div.append(nextBestFutureButton)
    // decorateNodeActionButton(nextBestFutureId);
    // actionButtonIds.push(nextBestFutureId);

    var expandPvId = "expand-pv-button";
    var expandPvButton = getNodeActionButton(expandPvId, "Expand future", expandFuture);
    div.append(expandPvButton)
    decorateNodeActionButton(expandPvId);
    actionButtonIds.push(expandPvId);

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


function checkMenuAvailibleActions(currFocusNode){
    var actionButtonsToBeActivted = [];
    if ( currFocusNode.hasClass("principalVariation") == false || (currFocusNode.hasClass("principalVariation") == true && currFocusNode.hasClass("stateNode") == true)){
        if (currFocusNode.data("id").indexOf("_max") != -1){
            if (currFocusNode.outgoers().targets().size() > 0){
                if (isTreatmentModelBased()){
                    actionButtonsToBeActivted.push("hide-node-button");
                    $('#hide-pv-button').css("display","block");
                    $('#expand-pv-button').css("display","block");
                    actionButtonsToBeActivted.push("hide-pv-button");
                }
                else{
                    $('#hide-pv-button').css("display","none");
                    actionButtonsToBeActivted.push("hide-node-button");
                }
            }
            else{
                if (isTreatmentModelBased()){
                    $('#expand-pv-button').css("display","block");
                    $('#hide-pv-button').css("display","block");
                    actionButtonsToBeActivted.push("expand-pv-button");
                    actionButtonsToBeActivted.push("hide-node-button");
                }
                else{
                    $('#hide-pv-button').css("display","none");
                    $('#expand-pv-button').css("display","none");
                    actionButtonsToBeActivted.push("hide-node-button");
                }
            }
        }
        else if (currFocusNode.data("id").indexOf("state") != -1){
            if (currFocusNode.outgoers().targets().size() != currFocusNode.data("sc2_cyChildren").length){
                if (isTreatmentModelBased()){
                    $('#expand-pv-button').css("display","block");
                    $('#hide-pv-button').css("display","block");
                    actionButtonsToBeActivted.push("next-best-action-button");
                }
                else{
                    $('#hide-pv-button').css("display","none");
                    $('#expand-pv-button').css("display","none");
                    actionButtonsToBeActivted.push("next-best-action-button");
                }
            }
        }
    }
    return actionButtonsToBeActivted;
}

function isFriendlyActionNode(data){
    if (data.id.indexOf("action_max") != -1){
        return true;
    }
    return false;
}
function isEnemyActionNode(data){
    if (data.id.indexOf("action_min") != -1){
        return true;
    }
    return false;
}



function getBestScoreSibling(nodes) {
    var bestQValueNode = undefined;
    for (var nodeIndex in nodes){
        var node = nodes[nodeIndex];
        if (bestQValueNode == undefined){
            bestQValueNode = node;
        }
        else{
            try{
                var nodeQValue = node.data("best q_value");
                var bestNodeQValue = bestQValueNode.data("best q_value");
                if (nodeQValue > bestNodeQValue){
                    bestQValueNode = node;
                }
            }
            catch(error){
                var nodeQValue = node["data"]["best q_value"];
                var bestNodeQValue = bestQValueNode["data"]["best q_value"]
                if (nodeQValue > bestNodeQValue){
                    bestQValueNode = node;
                }
            }
        }
    }
    return bestQValueNode;
}

function getWorstScoreSibling(nodes) {
    var worstQValueNode = undefined;
    for (var nodeIndex in nodes){
        var node = nodes[nodeIndex];
        if (worstQValueNode == undefined){
            worstQValueNode = node;
        }
        else{
            try{
                var nodeQValue = node.data("best q_value");
                var worstNodeQValue = worstQValueNode.data("best q_value");
                if (nodeQValue < worstNodeQValue){
                    worstQValueNode = node;
                }
            }
            catch(error){
                var nodeQValue = node["data"]["best q_value"];
                var worstNodeQValue = worstQValueNode["data"]["best q_value"]
                if (nodeQValue < worstNodeQValue){
                    worstQValueNode = node;
                }
            }
        }
    }
    return worstQValueNode;
}
