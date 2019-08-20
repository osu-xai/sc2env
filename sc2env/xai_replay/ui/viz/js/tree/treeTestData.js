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
      'height': 1100,
      'width': 1100,
      'background-fit': 'cover',
      'border-color': ' #000',
      'border-width': 10,
    })
    .selector('.enemyAction')
    .css({
      'shape': 'polygon',
      'shape-polygon-points': 'data(points)',
      'height': 1100,
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
$.getJSON("js/tree/json/partial_decision_point_22.json", function(rawSc2Json) {
  
  createRootNode(rawSc2Json);
  getFriendlyActionsUnderState(rawSc2Json);

  cy = cytoscape(treeData);
  intitTreeLables(cy);
  childrenFollowParents(cy);
  

});

function finishInit(){
    createNodeGraphs();
    intitTreeFunctions(cy);
}

function intitTreeLables(cy){
  cy.nodeHtmlLabel(
    [
      {
        query: 'node', // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: '', // any classes will be as attribute of <div> container for every title
        tpl: function (data) { return   getNodeGlyphs(data) + getAfterStateValue(data)   } // your html template here
      }
    ]
  );
}


function getNodeGlyphs(data){
  if (data.id.indexOf("action_max") != -1 || data.id.indexOf("action_min") != -1){
    return  '<style>' + 
              '#' + data.id + '_graph_container' + '{' +
                'display: grid; grid-template-rows: auto auto auto auto auto auto auto;' + getNumberOfColumns(data);
            '</style>';
  }
  else{
    return '<canvas id="' + data.id + '_graph" width="700" height="700" style="bottom:0%;margin-top:10%;background-color:white;border:1px solid #000000;"></canvas>' + 
           '<canvas id="' + data.id + '_graph_enemy" width="700" height="700" style="bottom:0%;margin-top:10%;background-color:white;border:1px solid #000000;"></canvas>';
  }
}

// function getNodeGlyphs(data){
//   if (data.id.indexOf("action_max") != -1 || data.id.indexOf("action_min") != -1){
//     return '<canvas id="' + data.id + '_graph" width="700" height="700" style="bottom:0%;margin-top:10%;background-color:white;border:1px solid #000000;"></canvas>';
//   }
//   else{
//     return '<canvas id="' + data.id + '_graph" width="700" height="700" style="bottom:0%;margin-top:10%;background-color:white;border:1px solid #000000;"></canvas>' + 
//            '<canvas id="' + data.id + '_graph_enemy" width="700" height="700" style="bottom:0%;margin-top:10%;background-color:white;border:1px solid #000000;"></canvas>';
//   }
// }

function createNodeGraphs(){
  cy.nodes().forEach(function( ele ){

    var unitValuesDict = parseActionString(ele);

    if (unitValuesDict["Enemy"]){
      var c = document.getElementById(ele.data("id") + "_graph_enemy");
      var ctx = c.getContext("2d");

      ctx.beginPath();
      ctx.rect(0,294,700,12);
      ctx.fillStyle = "black";
      ctx.fill();
      var enemyUnitDict = unitValuesDict["Enemy"];
      // var maxActionTaken = Object.keys(enemyUnitDict).reduce(function(a, b){ return enemyUnitDict[a] > enemyUnitDict[b] ? a : b });

      drawMarines(ctx, unitValuesDict["Enemy"], maxActionTaken);
      drawBanelings(ctx, unitValuesDict["Enemy"], maxActionTaken);
      drawImmortals(ctx, unitValuesDict["Enemy"], maxActionTaken);
      drawPylons(ctx, unitValuesDict["Enemy"], maxActionTaken);
      drawNexusHealth(ctx, ele);
    }
    var c = document.getElementById(ele.data("id") + "_graph");
    var ctx = c.getContext("2d");

    ctx.beginPath();
    ctx.rect(0,294,700,12);
    ctx.fillStyle = "black";
    ctx.fill();

    var maxActionTaken = Object.keys(unitValuesDict).reduce(function(a, b){ return unitValuesDict[a] > unitValuesDict[b] ? a : b });

    drawMarines(ctx, unitValuesDict, maxActionTaken);
    drawBanelings(ctx, unitValuesDict, maxActionTaken);
    drawImmortals(ctx, unitValuesDict, maxActionTaken);
    drawPylons(ctx, unitValuesDict, maxActionTaken);
    drawNexusHealth(ctx, ele);

    ctx.beginPath();
    ctx.moveTo(0,600);
    ctx.lineTo(700,600);
    ctx.moveTo(600,700);
    ctx.lineTo(600,0);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "black";
    ctx.stroke();
  });
}

// function getStateValues(ele){
//     stateDict = {};
//     currState = ele.data("state");
//     stateDict["TOP Marines"] = currState[15];
//     stateDict["TOP Banelings"] = currState[16];
//     stateDict["TOP Immortals"] = currState[17];
//     stateDict["BOT Marines"] = currState[18];
//     stateDict["BOT Banelings"] = currState[19];
//     stateDict["BOT Immortals"] = currState[20];
//     stateDict["Pylons"] = currState[7];

//     stateDict["Enemy"] = {};
//     stateDict["TOP Marines"] = currState[21];
//     stateDict["TOP Banelings"] = currState[22];
//     stateDict["TOP Immortals"] = currState[23];
//     stateDict["BOT Marines"] = currState[24];
//     stateDict["BOT Banelings"] = currState[25];
//     stateDict["BOT Immortals"] = currState[26];
//     stateDict["Pylons"] = currState[14];
//     return stateDict;
// }

// function getActionValues(ele){
//   var action = ele.data("action");
//   var actionDict = {};

//   for (var i = 0; i < action.length; i++) {
//     if (i == 0){
//       actionDict["TOP Marines"] = action.charAt(i);
//     }
//     else if(i == 1){
//       actionDict["TOP Banelings"] = action.charAt(i);
//     }
//     else if(i == 2){
//       actionDict["TOP Immortals"] = action.charAt(i);
//     }
//     else if(i == 3){
//       actionDict["BOT Marines"] = action.charAt(i);
//     }
//     else if(i == 4){
//       actionDict["BOT Banelings"] = action.charAt(i);
//     }
//     else if(i == 5){
//       actionDict["BOT Immortals"] = action.charAt(i);
//     }
//     else if(i == 6){
//       actionDict["Pylons"] = action.charAt(i);
//     }
//   }
//   return actionDict;
// }

// function parseActionString(ele){
//   if (ele.data("action") == null){
//     var stateDict = getStateValues(ele);
//     return stateDict;
//   }
//   else{
//     var actionDict = getActionValues(ele);
//     return actionDict;
//   }
// }

// function drawPylons(ctx, unitValuesDict){
//   var pylonLimit = 3;
//   var pylons = unitValuesDict["Pylons"];
  
//   ctx.beginPath();
//   for (var i = 0; i < pylons; i++){
//     ctx.rect(0 + (i * ((600 - ((pylonLimit-2)*10))/pylonLimit) + (i*10)), 600, (600-(10*(pylonLimit-1)))/pylonLimit, 700);
//     ctx.fillStyle = "yellow";
//     ctx.fill();
//   }
// }

// function drawNexusHealth(ctx, ele){
//   var topFriendlyNexus = ele.data("state")[27];
//   var botFriendlyNexus = ele.data("state")[28];

//   ctx.beginPath();
//   ctx.rect(615, 294, 70, (-1* ((topFriendlyNexus/2000) * 294)));
//   ctx.fillStyle = "green";
//   ctx.fill();

//   ctx.beginPath();
//   ctx.rect(615, 600, 70,  (-1 *((botFriendlyNexus/2000) * 294)));
//   ctx.fillStyle = "green";
//   ctx.fill();
// }

// function drawMarines(ctx, unitValuesDict, maxActionTaken){
//   var topMar = unitValuesDict["TOP Marines"];
//   var botMar = unitValuesDict["BOT Marines"];
//   var maxActionTakenValue = unitValuesDict[maxActionTaken];
//   for(var i = 0; i < topMar; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 0, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "lightgrey";
//     ctx.fill();
//   }
//   for(var i = 0; i < botMar; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 306, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "lightgrey";
//     ctx.fill();
//   }
// }

// function drawBanelings(ctx, unitValuesDict, maxActionTaken){
//   var topBan = unitValuesDict["TOP Banelings"];
//   var botBan = unitValuesDict["BOT Banelings"];
//   var maxActionTakenValue = unitValuesDict[maxActionTaken];
//   for(var i = 0; i < topBan; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 98, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "orange";
//     ctx.fill();
//   }
//   for(var i = 0; i < botBan; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 404, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "orange";
//     ctx.fill();
//   }
// }

// function drawImmortals(ctx, unitValuesDict, maxActionTaken){
//   var topImm = unitValuesDict["TOP Immortals"];
//   var botImm = unitValuesDict["BOT Immortals"];
//   var maxActionTakenValue = unitValuesDict[maxActionTaken];
//   for(var i = 0; i < topImm; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 196, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "blue";
//     ctx.fill();
//   }
//   for(var i = 0; i < botImm; i++){
//     ctx.beginPath();
//     ctx.rect(0 + (i * ((600 - ((maxActionTakenValue-1)*10))/maxActionTakenValue) + (i*10)), 502, (600-(10*(maxActionTakenValue-1)))/maxActionTakenValue, 98)
//     ctx.fillStyle = "blue";
//     ctx.fill();
//   }
// }

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
      createNodeGraphs();
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

