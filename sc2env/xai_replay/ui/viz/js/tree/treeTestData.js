var treeData = {
  container: document.getElementById('cy'),
  boxSelectionEnabled: false,
  autounselectify: true,
  style: cytoscape.stylesheet()
    .selector('node')
    .css({
      'background-color': 'LightSlateGray',
      'height': 1200,
      'width': 1100,
      'background-fit': 'cover',
      'border-color': 'black'
    })
    .selector('.stateNode')
    .css({
      'shape': 'roundrectangle',
      'height': 1100,
      'width': 1800
    })
    .selector('.friendlyAction')
    .css({
      'shape': 'polygon',
      'shape-polygon-points': 'data(points)'
    })
    .selector('.enemyAction')
    .css({
      'shape': 'polygon',
      'shape-polygon-points': 'data(points)'
    })
    .selector('.principalVariation')
    .css({
      'background-color': 'SteelBlue',
      'border-color': 'black'
    })
    .selector('edge')
    .css({
      'curve-style': 'straight',
      'width': 20,
      'target-arrow-shape': 'triangle',
      'line-color': '#ffaaaa',
      'target-arrow-color': '#ffaaaa'
    }),
  layout: {
    name: 'breadthfirst',
    fit: true, // whether to fit the viewport to the graph
    directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
    padding: 30, // padding on fit
    spacingFactor: 1.25, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
    roots: undefined, // the roots of the trees
    maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position) {return position } // transform a given node position. Useful for changing flow direction in discrete layouts
  },
  elements : {
    nodes: [],
    edges: []
  }
}

var cy = undefined;
function initTree(jsonPath){
  // $.getJSON(jsonPath, function(rawSc2Json) {
  $.getJSON("js/tree/whole_decision_point_1.json", function(rawSc2Json) {
    
    createRootNode(rawSc2Json);
    getFriendlyActionsUnderState(rawSc2Json);

    cy = cytoscape(treeData);
    childrenFollowParents(cy);
    var root = cy.$('.rootNode');
    var biggestUnitCountTuple = getLargestUnitCount(cy);
    intitTreeLables(cy, biggestUnitCountTuple);
    intitTreeFunctions(cy);    
    sortNodes(cy);
  });
}

// const observer = new MutationObserver(function (mutations){
//   mutations.forEach(function (mutation){
//     if (mutation.addedNodes.length){
//       for (var i in mutation.addedNodes){
//         console.log(mutation.addedNodes);
//       }
//       cy.nodes().forEach(function( ele ){
//         var nexusToolTip = document.getElementById( ele.data("id") + "_nexus_graph_container" )
//         nexusToolTip.addEventListener('mouseover', function (event){
//           console.log("NEXUS")
//           var toolTip = document.createElement("div");
//           var toolTipVal = document.createTextNode("nexus health: ")
//           toolTip.appendChild(toolTipVal);
//           toolTip.appendChild(toolTip);
//           toolTip.style.backgroundColor = "black";
//           toolTip.style.color = "white";
//           toolTip.style.zIndex = 1000;
//         });
//       });
//     }
//   })
// })

// const treeContainer = document.getElementById("cy");
// observer.observe(treeContainer, {childList:true});


function removeTree(){
    treeData["elements"] = {  nodes: [],
                              edges: []
                            };
}

function intitTreeLables(cy, biggestUnitCountTuple){
  cy.nodeHtmlLabel(
    [
      {
        query: 'node', // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: '', // any classes will be as attribute of <div> container for every title
        tpl: function (data) { return   getNodeGlyphs(data, biggestUnitCountTuple) + getBestQValue(data)   } // your html template here
      }
    ]
  );
}

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

function getFriendlyGraphString(data, unitValuesDict, biggestUnitCount){
  return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto auto; height: 800; width: 800;">' +
            '<style>' + 
              '#' + data.id + '_nexus_graph_container ' + '{' +
                'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:start;' +
                'background-color: ivory; height:700px;width:100px; margin-top:140%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_nexus_graph_container">' +
              drawNexusHealth(data["state"][27]) +
              '<div style="background-color:black;"></div>' +
              drawNexusHealth(data["state"][28]) +
            '</div>' +
            '<style>' + 
              '#' + data.id + '_unit_graph_container ' + '{' +
                'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
                'background-color: ivory; height:700px;width:700px; margin-top:20%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_unit_graph_container">' +
              drawUnitDiv(unitValuesDict["TOP Marines"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCount) +
              drawUnitDiv(unitValuesDict["TOP Banelings"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCount) +
              drawUnitDiv(unitValuesDict["TOP Immortals"], 'blue') + drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCount) +
              '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
              drawUnitDiv(unitValuesDict["BOT Marines"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCount) +
              drawUnitDiv(unitValuesDict["BOT Banelings"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCount) +
              drawUnitDiv(unitValuesDict["BOT Immortals"], 'blue') + drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCount) +
            '</div>' +
            '<div></div>' +
            '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto; height: 70px;">' + 
              drawPylons(unitValuesDict["Pylons"]) + drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + 
            '</div>' +
          '</div>';
}


function getEnemyGraphString(data, unitValuesDict, biggestUnitCount){
return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto 70px; height: 800; width: 800;" onload="finishInit()">' +
          '<style>' + 
          '#' + data.id + '_unit_graph_container ' + '{' +
            'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
            'background-color: ivory; height:700px;width:700px;' +
          '}' +
        '</style>' +
        '<div id="' + data.id + '_unit_graph_container">' +
          drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Marines"], 'darkGrey') + 
          drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Banelings"]) + 
          drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Immortals"]) + 
          '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
          drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Marines"], 'darkGrey') + 
          drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Banelings"], 'darkOrange') + 
          drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Immortals"], 'blue') + 
        '</div>' +
        '<style>' + 
          '#' + data.id + '_nexus_graph_container ' + '{' +
            'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:end;' +
            'background-color: ivory; height:700px;width:100px;' +
          '}' +
        '</style>' +
        '<div id="' + data.id + '_nexus_graph_container">' +
          drawNexusHealth(data["state"][29]) +
          '<div style="background-color:black;grid-row-end:span 1;"></div>' +
          drawNexusHealth(data["state"][30]) +
        '</div>' +
        '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto;">' + 
          drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + drawPylons(unitValuesDict["Pylons"]) + 
        '</div>' +
        '<div></div>' +
      '</div>';
}

function getNodeGlyphs(data, biggestUnitCountTuple){
  var unitValuesDict = parseActionString(data);
  if (data.id.indexOf("action_max") != -1){
    return getFriendlyGraphString(data, unitValuesDict, biggestUnitCountTuple[1]);
  }
  else if (data.id.indexOf("action_min") != -1){
    return getEnemyGraphString(data, unitValuesDict, biggestUnitCountTuple[1]);
  }
  else{
    return '<div style="display:grid;grid-gap:50px;grid-template-columns:auto auto;">' + '<div style="color:ivory;font-size:80px;font-weight:bold;position:absolute;top:3%;left:15%;">FRIENDLY</div>' + getFriendlyGraphString(data, unitValuesDict, biggestUnitCountTuple[0]) + '<div style="color:ivory;font-size:80px;font-weight:bold;position:absolute;top:3%;left:67%;">ENEMY</div>' + getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCountTuple[0]) + '</div>';
  }
}

function drawNexusHealth(nexusHealth){
  var nexusHealthPercent = (1-(nexusHealth/2000)) * 100;
  return '<div style="bottom:0%;background-color:green;margin:10px;width:50px;"><div style="background-color:ivory;margin:2.5px;position:relative;width:45px;height:' + nexusHealthPercent + '%;"></div></div>';
}

function drawPylons(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for (var i = 0; i < pylonCount; i++){
    pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
  }
  return pylonString;
}

function drawPylonPlaceHolderDivs(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for(var i = 0; i < (maxPylons-pylonCount); i++){
    pylonString += '<div style="border: 4px solid yellow;background-color:rgba(255,255,0,.30);height:25px;margin:15px;"></div>'
  }
  return pylonString;
}

function drawUnitDiv(unitCount, color){
  var unitDivString = "";
  for(var i = 0; i < unitCount; i++){
    unitDivString += '<div style="text-align:center;background-color:' + color + ';"></div>'
  }
  return unitDivString;
}

function drawPlaceHolderDivs(unitCount, colCount){
  var placeholder = "";
  for(var i = 0; i < (colCount-unitCount); i++){
    placeholder += '<div style="background-color:rgba(0,0,0,0);"></div>'
  }
  return placeholder
}

function getColumnStylingString(biggestUnitCount){
  var columsString = "";
  for (var i = 0; i < biggestUnitCount; i++){
    columsString += " auto";
  }
  return columsString
}

function getNumberOfColumns(unitValuesDict){
  var unitValuesDictEnemy = undefined;
  var maxActionTakenEnemy = undefined;
  var enemyMaxValue = undefined;

  if ("Enemy" in unitValuesDict){
    unitValuesDictEnemy = unitValuesDict["Enemy"];
    unitValuesDict["Enemy"] = null;
  }

  var maxActionTaken = Object.keys(unitValuesDict).reduce(function(a, b){ return unitValuesDict[a] > unitValuesDict[b] ? a : b });
  var friendlyMaxValue = unitValuesDict[maxActionTaken];

  if ("Enemy" in unitValuesDict){
    maxActionTakenEnemy = Object.keys(unitValuesDictEnemy).reduce(function(a, b){ return unitValuesDictEnemy[a] > unitValuesDictEnemy[b] ? a : b });
    enemyMaxValue = unitValuesDictEnemy[maxActionTakenEnemy];
    if (enemyMaxValue > friendlyMaxValue){
      if (enemyMaxValue < 5){
        return 5;
      }
      return enemyMaxValue;
    }
    else{
      if (friendlyMaxValue < 5){
        return 5;
      }
      return friendlyMaxValue;
    }
  }
  else{
    if (friendlyMaxValue < 5){
      return 5;
    }
    return friendlyMaxValue;
  }
}

function getStateValues(data){
    stateDict = {};
    currState = data["state"];
    stateDict["TOP Marines"] = currState[1];
    stateDict["TOP Banelings"] = currState[2];
    stateDict["TOP Immortals"] = currState[3];
    stateDict["BOT Marines"] = currState[4];
    stateDict["BOT Banelings"] = currState[5];
    stateDict["BOT Immortals"] = currState[6];
    stateDict["Pylons"] = currState[7];

    stateDict["Enemy"] = {};
    var stateDictEnemy = stateDict["Enemy"];
    stateDictEnemy["TOP Marines"] = currState[8];
    stateDictEnemy["TOP Banelings"] = currState[9];
    stateDictEnemy["TOP Immortals"] = currState[10];
    stateDictEnemy["BOT Marines"] = currState[11];
    stateDictEnemy["BOT Banelings"] = currState[12];
    stateDictEnemy["BOT Immortals"] = currState[13];
    stateDictEnemy["Pylons"] = currState[14];
    return stateDict;
}

function getActionValues(data){
  var action = data["action"];
  var actionDict = {};

  actionDict["TOP Marines"] = action.charAt(0);
  actionDict["TOP Banelings"] = action.charAt(1);
  actionDict["TOP Immortals"] = action.charAt(2);
  actionDict["BOT Marines"] = action.charAt(3);
  actionDict["BOT Banelings"] = action.charAt(4);
  actionDict["BOT Immortals"] = action.charAt(5);
  actionDict["Pylons"] = action.charAt(6);

  return actionDict;
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

function getBestQValue(data){
  // var afterStateQValue = data["after state q_value"];
  var bestStateQValue = data["best q_value"];
  var name = data["name"];
  if(data['root']){
    return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
  }
    if (name.indexOf("_action") != -1){
      if (name.indexOf("best") != -1){
        return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
        return '<div style="color:Turquoise;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
    }
    else{
      if (name.indexOf("best") != -1){
        return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
        return '<div style="color:Turquoise;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
    }
}

function childrenFollowParents(cy){
  cy.nodes().forEach(function( ele ){
    // nodesMatching gets pulled along with dragWith on drag
    cy.automove({
      nodesMatching: ele.successors().targets(),
      reposition: 'drag',
      dragWith: ele,
    });
  });
}

function intitTreeFunctions(cy){
  // cy.nodes().ungrabify();
  cy.center(cy.nodes());
  //toggle show and hide nodes on hover over. Dont allow nodes at at d =0,1 to hide
  cy.on('click', 'node', function (evt) {
    if (this.scratch().restData == undefined || this.scratch().restData == null) {
      // Save node data and remove
      this.scratch({
        restData: this.successors().targets().remove()
      });
    }
    else {
      // Restore the removed nodes from saved data
      this.scratch().restData.restore();
      this.scratch({ restData: null });
    }
  });
}

function createRootNode(inputJsonTree){
  var nodes = treeData["elements"]["nodes"];
  var rootNode = {};
  var rootNodeKeys = Object.keys(inputJsonTree); 
  rootNode["data"] = {}
  for (keyIndex in rootNodeKeys){
    var key = rootNodeKeys[keyIndex];
    rootNode["data"][key] = inputJsonTree[key];
  }
  rootNode["data"]["id"] = inputJsonTree["name"];
  rootNode["data"]["root"] = "iAmRoot";
  rootNode["classes"] = "stateNode rootNode principalVariation";
  nodes.push(rootNode);
}

function getDataFromInputNode(inputNode, parentId, cyClass){
  var cyNode = {};
  cyNode["data"] = {};
  var nodeKeys = Object.keys(inputNode);
  for (var keyIndex in nodeKeys){
    var key = nodeKeys[keyIndex];
    if (key.indexOf("_level") == -1 && key.indexOf("dp") != 0){
      cyNode["data"][key] = inputNode[key];
    }
  }
  cyNode["data"]["sc2_parent_id"] = parentId;
  
  if (inputNode["name"].indexOf("(best)") != -1){
    cyNode["data"]["id"] = trimBestNotationDuplicate(inputNode["name"]);
    cyNode["classes"] = cyClass + " principalVariation";
  }
  else{
    cyNode["data"]["id"] = inputNode["name"];
    cyNode["classes"] = cyClass;
  }
  return cyNode;
}

function getEdge(source, target){
  var cyEdge = {}
  cyEdge["data"] = {};
  cyEdge["data"]["source"] = source;
  cyEdge["data"]["target"] = target;
  return cyEdge
}

function getFriendlyActionsUnderState(stateNode){
  var nodes = treeData["elements"]["nodes"];
  var edges = treeData["elements"]["edges"];

  var children = stateNode["children"][0];
  for (var childIndex in children){
    var friendlyAction = children[childIndex];
    var className = "friendlyAction";
    var cyNode = getDataFromInputNode(friendlyAction, stateNode["name"], className);
    cyNode["data"]["type"] = "friendlyAction";
    cyNode["data"]["points"] = [-1, 1, 1, 1, 1, -.75, 0, -1, -1, -.75];
    nodes.push(cyNode);
    var cyEdge = getEdge(trimBestNotationDuplicate(stateNode["name"]), trimBestNotationDuplicate(cyNode["data"]["id"]));
    edges.push(cyEdge);
    getEnemyActionsUnderFriendlyAction(friendlyAction);
  }
}

function getEnemyActionsUnderFriendlyAction(friendlyAction){
  var nodes = treeData["elements"]["nodes"];
  var edges = treeData["elements"]["edges"];

  var children = friendlyAction["children"][0];
  for (var childIndex in children){
    var enemyAction = children[childIndex];
    var className = "enemyAction";
    var cyNode = getDataFromInputNode(enemyAction, friendlyAction["name"], className);
    cyNode["data"]["type"] = "enemyAction";
    cyNode["data"]["points"] = [-1, -1, 1, -1, 1, .75, 0, 1, -1, .75];
    nodes.push(cyNode);
    var cyEdge = getEdge(trimBestNotationDuplicate(friendlyAction["name"]), trimBestNotationDuplicate(cyNode["data"]["id"]));
    edges.push(cyEdge);
    getStateNodesUnderEnemyActions(enemyAction);
  }

}

function getStateNodesUnderEnemyActions(enemyAction){
  var nodes = treeData["elements"]["nodes"];
  var edges = treeData["elements"]["edges"];

  var children = enemyAction["children"][0];
  for (var childIndex in children){
    var stateNode = children[childIndex];
    var className = "stateNode";
    var cyNode = getDataFromInputNode(stateNode, enemyAction["name"], className);
    nodes.push(cyNode);
    var cyEdge = getEdge(trimBestNotationDuplicate(enemyAction["name"]), trimBestNotationDuplicate(cyNode["data"]["id"]));
    edges.push(cyEdge);
    getFriendlyActionsUnderState(stateNode);
  }
}

function trimBestNotationDuplicate(id){
  var index = id.indexOf("(best)");
  if (index != -1){
    id = id.slice(0, index) + id.slice(index + "(best)".length);
  }
  return id;
}

function sortNodes(cy){
  cy.nodes().forEach(function( ele ){
    var currParent = ele.incomers();
    var currSiblings = currParent.outgoers();
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

