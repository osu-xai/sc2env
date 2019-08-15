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


$.getJSON("js/tree/json/partial_decision_point_2.json", function(rawSc2Json) {
  
  createRootNode(rawSc2Json);
  getFriendlyActionsUnderState(rawSc2Json);

  var cy = cytoscape(treeData);
  intitTreeLables(cy);
  // intitTreeFunctions(cy);
  childrenFollowParents(cy)

});

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

  var nodes = cy.nodes().sort(function( a, b ){
    return a.data('best q_value') - b.data('best q_value');
  });

  cy.bind('click ', 'node', function (evt) {
    var pos = cy.nodes(this.data().id).renderedPosition();
    var center = cy.center()
    var pan = cy.pan()

    var parent = cy.getElementById(this.data.sc2_parent_id);
    
    cy.fit(this)
    cy.zoom({level: .1,
             renderedPosition: pan
            })
  });

  //toggle show and hide nodes on hover over. Dont allow nodes at at d =0,1 to hide
  cy.on('mouseover', 'node', function (evt) {
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



function getNodeGlyphs(data){
  if (data.id.indexOf("action_max") != -1 || data.id.indexOf("action_min") != -1){
    return '<img src="imgs/tree/DP2/' + data.id + '.jpg' + '" style="padding-top:8%;padding-bottom:5%;display:inline;"></img>'
  }
  else{
    return '<div style="width:200%; height:180%;position:relative;right:16%;top:0%">' +
              '<img src="imgs/tree/DP2/' + data.id + '' +'.jpg' + '" style="left:0%;;display:inline;"></img>' +
              '<img src="imgs/tree/DP2/' + data.id + '_enemy' +'.jpg' + '" style="padding-left:5%;;display:inline;"></img>' +
              '<div style="font-size:125px;color:blue;padding-left:1%;;display:inline;">FRIENDLY</div>' +
              '<div style="font-size:125px;color:blue;padding-left:11%;;display:inline;">ENEMY</div>' +
           '</div>'
  }
}

function getAfterStateValue(data){
  var afterStateQValue =  + data["after state q_value"]
  var bestStateQValue = data["best q_value"];
  if(data['root']){
    return getBestStateDiv(bestStateQValue.toFixed(5));
  }
    if (afterStateQValue == 0){
      if (data["name"].indexOf("(best)") != -1){
        return getBestStateDiv(bestStateQValue.toFixed(5));
      }
      else{
        return getAfterStateDiv(bestStateQValue.toFixed(5));
      }
    }
    else{
      if (data["name"].indexOf("(best)") != -1){
        return getBestStateDiv(bestStateQValue.toFixed(5));
      }
      else{
        return getAfterStateDiv(bestStateQValue.toFixed(5)); //switch
      }
    }
}

function getAfterStateDiv(afterStateValue){
  return '<div style="color:blue;font-size:200px;text-align:center;">' + afterStateValue.replace(/^[0]+/, "") + '</div>';
}



function getBestStateDiv(bestStateValue){
  return '<div style="color:lime;font-size:200px;text-align:center;">' + bestStateValue.replace(/^[0]+/, "") + '</div>';
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

