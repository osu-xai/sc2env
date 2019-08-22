var treeData = {
  container: document.getElementById('cy'),
  boxSelectionEnabled: false,
  autounselectify: true,
  style: cytoscape.stylesheet()
    .selector('.stateNode')
    .css({
      'shape': 'roundrectangle',
      'height': 1100,
      'width': 1800,
      'background-fit': 'cover',
      'border-color': ' #000',
      'border-width': 10,
    })
    .selector('.friendlyAction')
    .css({
      'shape': 'polygon',
      'shape-polygon-points': 'data(points)',
      'height': 1200,
      'width': 1100,
      'background-fit': 'cover',
      'border-color': ' #000',
      'border-width': 10,
    })
    .selector('.enemyAction')
    .css({
      'shape': 'polygon',
      'shape-polygon-points': 'data(points)',
      'height': 1200,
      'width': 1100,
      'background-fit': 'cover',
      'border-color': ' #000',
      'border-width': 10,
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
    sort: function(a, b){ return a.data('best q_value') + b.data('best q_value') },
    fit: true, // whether to fit the viewport to the graph
    directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
    padding: 30, // padding on fit
    spacingFactor: .75, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
    roots: undefined, // the roots of the trees
    maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
    animate: false, // whether to transition the node positions
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
$.getJSON("js/tree/json/partial_decision_point_21.json", function(rawSc2Json) {
  
  createRootNode(rawSc2Json);
  getFriendlyActionsUnderState(rawSc2Json);

  cy = cytoscape(treeData);
  childrenFollowParents(cy);
  var biggestUnitCountAtDP = 0;
  cy.nodes().forEach(function( ele ){
    var unitValuesDict = parseActionString(ele.data());
    var biggestUnitCount = getNumberOfColumns(unitValuesDict);
    if (biggestUnitCount > biggestUnitCountAtDP){
      biggestUnitCountAtDP = biggestUnitCount;
      console.log(biggestUnitCountAtDP)
    }
  });
  intitTreeLables(cy, biggestUnitCountAtDP);
  intitTreeFunctions(cy);


});

function finishInit(){

}

function intitTreeLables(cy, biggestUnitCountAtDP){
  cy.nodeHtmlLabel(
    [
      {
        query: 'node', // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: '', // any classes will be as attribute of <div> container for every title
        tpl: function (data) { return   getNodeGlyphs(data, biggestUnitCountAtDP) + getAfterStateValue(data)   } // your html template here
      }
    ]
  );
}

function getEnemyGraphString(data, unitValuesDict, biggestUnitCountAtDP){
return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto auto; height: 800; width: 800;">' +
          '<style>' + 
          '#' + data.id + '_unit_graph_container ' + '{' +
            'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCountAtDP) + ';' +
            'background-color: white; height:700px;width:700px;' +
          '}' +
        '</style>' +
        '<div id="' + data.id + '_unit_graph_container">' +
          drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCountAtDP) + drawMarines(unitValuesDict["TOP Marines"]) + 
          drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCountAtDP) + drawBanelings(unitValuesDict["TOP Banelings"]) + 
          drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCountAtDP) + drawImmortals(unitValuesDict["TOP Immortals"]) + 
          '<div style="background-color:black; grid-column-end: span ' + biggestUnitCountAtDP + ';"></div>' +
          drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCountAtDP) + drawMarines(unitValuesDict["BOT Marines"]) + 
          drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCountAtDP) + drawBanelings(unitValuesDict["BOT Banelings"]) + 
          drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCountAtDP) + drawImmortals(unitValuesDict["BOT Immortals"]) + 
        '</div>' +
        '<style>' + 
          '#' + data.id + '_nexus_graph_container ' + '{' +
            'display: grid; grid-gap: 12px; grid-template-rows: auto auto; grid-template-columns: auto;' +
            'background-color: black; height:700px;width:100px;' +
          '}' +
        '</style>' +
        '<div id="' + data.id + '_nexus_graph_container">' +
          drawNexusHealth(data["state"][29]) +
          drawNexusHealth(data["state"][30]) +
        '</div>' +
        '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto; height: 70px;">' + 
          drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + drawPylons(unitValuesDict["Pylons"]) + 
        '</div>' +
        '<div></div>' +
      '</div>';
}


function getFriendlyGraphString(data, unitValuesDict, biggestUnitCountAtDP){
  return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto auto; height: 800; width: 800;">' +
            '<style>' + 
              '#' + data.id + '_nexus_graph_container ' + '{' +
                'display: grid; grid-gap: 12px; grid-template-rows: auto auto; grid-template-columns: auto;' +
                'background-color: black; height:700px;width:100px; margin-top:140%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_nexus_graph_container">' +
              drawNexusHealth(data["state"][27]) +
              drawNexusHealth(data["state"][28]) +
            '</div>' +
            '<style>' + 
              '#' + data.id + '_unit_graph_container ' + '{' +
                'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCountAtDP) + ';' +
                'background-color: white; height:700px;width:700px; margin-top:20%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_unit_graph_container">' +
              drawMarines(unitValuesDict["TOP Marines"]) + drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCountAtDP) +
              drawBanelings(unitValuesDict["TOP Banelings"]) + drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCountAtDP) +
              drawImmortals(unitValuesDict["TOP Immortals"]) + drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCountAtDP) +
              '<div style="background-color:black; grid-column-end: span ' + biggestUnitCountAtDP + ';"></div>' +
              drawMarines(unitValuesDict["BOT Marines"]) + drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCountAtDP) +
              drawBanelings(unitValuesDict["BOT Banelings"]) + drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCountAtDP) +
              drawImmortals(unitValuesDict["BOT Immortals"]) + drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCountAtDP) +
            '</div>' +
            '<div></div>' +
            '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto; height: 70px;">' + 
              drawPylons(unitValuesDict["Pylons"]) + drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + 
            '</div>' +
          '</div>';
}

function getNodeGlyphs(data, biggestUnitCountAtDP){
  var unitValuesDict = parseActionString(data);
  if (data.id.indexOf("action_max") != -1){
    return getFriendlyGraphString(data, unitValuesDict, biggestUnitCountAtDP);
  }
  else if (data.id.indexOf("action_min") != -1){
    return getEnemyGraphString(data, unitValuesDict, biggestUnitCountAtDP);
  }
  else{
    return '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto;">' + getFriendlyGraphString(data, unitValuesDict, biggestUnitCountAtDP) + getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCountAtDP) + '</div>';
  }
}


function drawNexusHealth(nexusHealth){
  var nexusHealthPercent = (nexusHealth/2000) * 100;
  return '<div style="background-color: rgba(200,0,0,1)"><div style="position: relative; bottom:0%; background-color: green; height: ' + nexusHealthPercent + '%"></div></div>';
}


function drawPylons(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for (var i = 0; i < pylonCount; i++){
    pylonString += '<div style="text-align: center; background-color:yellow;"></div>';
  }
  return pylonString;
}

function drawPylonPlaceHolderDivs(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for(var i = 0; i < (maxPylons-pylonCount); i++){
    pylonString += '<div style="background-color:rgba(255,255,0,.10);"></div>'
  }
  return pylonString;
}

function drawMarines(marineCount){
  var marineString = "";
  for(var i = 0; i < marineCount; i++){
    marineString += '<div style="text-align: center; background-color:lightgrey;">'
    // if (i == marineCount-1){
    //   marineString += marineCount;
    // }
    marineString += '</div>'
  }
  return marineString;
}

function drawBanelings(banelingCount){
  var banelingString = "";
  for(var i = 0; i < banelingCount; i++){
    banelingString += '<div style="text-align: center; font-size:50px; background-color:orange;">'
    // if (i == banelingCount-1){
    //   banelingString += banelingCount;
    // }
    banelingString += '</div>'
  }
  return banelingString;
}

function drawImmortals(immortalCount){
  var immortalString = "";
  for(var i = 0; i < immortalCount; i++){
    immortalString += '<div style="text-align: center; background-color:blue;">'
    // if (i == immortalCount-1){
    //   immortalString += marineCount;
    // }
    immortalString += '</div>'
  }
  return immortalString;
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
  return columsString;
}

function getNumberOfColumns(unitValuesDict){
  
  var maxActionTaken = Object.keys(unitValuesDict).reduce(function(a, b){ return unitValuesDict[a] > unitValuesDict[b] ? a : b });
  var friendlyMaxValue = unitValuesDict[maxActionTaken];

  if ("Enemy" == maxActionTaken){
    var unitValuesDictEnemy = unitValuesDict["Enemy"];
    var maxActionTakenEnemy = Object.keys(unitValuesDictEnemy).reduce(function(a, b){ return unitValuesDictEnemy[a] > unitValuesDictEnemy[b] ? a : b });
    var enemyMaxValue = unitValuesDictEnemy[maxActionTakenEnemy];
    return enemyMaxValue;
  }
  return friendlyMaxValue;
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

  for (var i = 0; i < action.length; i++) {
    if (i == 0){
      actionDict["TOP Marines"] = action.charAt(i);
    }
    else if(i == 1){
      actionDict["TOP Banelings"] = action.charAt(i);
    }
    else if(i == 2){
      actionDict["TOP Immortals"] = action.charAt(i);
    }
    else if(i == 3){
      actionDict["BOT Marines"] = action.charAt(i);
    }
    else if(i == 4){
      actionDict["BOT Banelings"] = action.charAt(i);
    }
    else if(i == 5){
      actionDict["BOT Immortals"] = action.charAt(i);
    }
    else if(i == 6){
      actionDict["Pylons"] = action.charAt(i);
    }
  }
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
  cy.nodes().ungrabify();

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
      // createNodeGraphs();
    }
  });
}


function getAfterStateValue(data){
  var afterStateQValue =  + data["after state q_value"]
  var bestStateQValue = data["best q_value"];
  if(data['root']){
    return '<div style="color:lime;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
  }
    if (afterStateQValue == 0){
      if (data["name"].indexOf("(best)") != -1){
        return '<div style="color:lime;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
        return '<div style="color:blue;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
    }
    else{
      if (data["name"].indexOf("(best)") != -1){
        return '<div style="color:lime;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
        return '<div style="color:blue;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
    }
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
  rootNode["classes"] = "stateNode";
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
  cyNode["data"]["id"] = inputNode["name"];
  cyNode["data"]["sc2_parent_id"] = parentId;
  cyNode["classes"] = cyClass;
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
    var cyEdge = getEdge(stateNode["name"], cyNode["data"]["id"]);
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
    var cyEdge = getEdge(friendlyAction["name"], cyNode["data"]["id"]);
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
    var cyEdge = getEdge(enemyAction["name"], cyNode["data"]["id"]);
    edges.push(cyEdge);
    getFriendlyActionsUnderState(stateNode);
  }
}

