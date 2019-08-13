var treeData = undefined
$.getJSON("./DP1pruned.json", function(json) {
  treeData = generateTreeData(json);
  
  var jsonTreeData = JSON.stringify(treeData);
  var cy = cytoscape(treeData);

  // fillActionNodes();
  // drawActionCanvas();
});



function generateTreeData(inputJsonTree) {
  var treeData = {
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    style: cytoscape.stylesheet()
      .selector('node')
      .css({
        'shape': 'barrel',
        'height': 250,
        'width': 300,
        'background-fit': 'cover',
        'border-color': ' #000',
        'border-width': 3,
        'border-opacity': 0.5,
      })
      .selector('edge')
      .css({
        'curve-style': 'bezier',
        'width': 6,
        'target-arrow-shape': 'triangle',
        'line-color': '#ffaaaa',
        'target-arrow-color': '#ffaaaa'
      })
      .selector('.eating')
      .css({
        'border-color': 'red'
      })
      .selector('.eater')
      .css({
        'border-width': 9
      }),
    layout: {
      name: 'breadthfirst',

      fit: true, // whether to fit the viewport to the graph
      directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
      padding: 30, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
      spacingFactor: 1.5, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
      roots: undefined, // the roots of the trees
      maximal: false, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled,
      animateFilter: function (node, i) { return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop
      transform: function (node, position) {return position } // transform a given node position. Useful for changing flow direction in discrete layouts
    }
  }


  treeData["elements"] = {};
  var elements = treeData["elements"];

  elements["nodes"] = [];
  var nodes = elements["nodes"]

  elements["edges"] = [];
  var edges = elements["edges"];


  var rootNode = {};
  var rootNodeKeys = Object.keys(inputJsonTree); 
  rootNode["data"] = {}
  for (keyIndex in rootNodeKeys){
    var key = rootNodeKeys[keyIndex];
    rootNode["data"][key] = inputJsonTree[key];
  }
  rootNode["data"]["id"] = inputJsonTree["name"];
  rootNode["classes"] = "stateNode";
  nodes.push(rootNode);
  
  getFriendlyActionsUnderState(inputJsonTree);

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
    var stateNodeKeys = Object.keys(stateNode);
    for (var keyIndex in stateNodeKeys){
      var key = stateNodeKeys[keyIndex];
      if (key.indexOf("action_max") != -1){
        var friendlyAction = stateNode[key];
        var className = "friendlyAction";
        var cyNode = getDataFromInputNode(friendlyAction, stateNode["name"], className);
        nodes.push(cyNode);
        var cyEdge = getEdge(stateNode["name"], cyNode["data"]["id"]);
        edges.push(cyEdge);
        getEnemyActionsUnderFriendlyAction(friendlyAction);
      }
    }
  }

  function getEnemyActionsUnderFriendlyAction(friendlyAction){
    var friendlyActionKeys = Object.keys(friendlyAction);
    for (var keyIndex in friendlyActionKeys){
      var key = friendlyActionKeys[keyIndex];
      if (key.indexOf("action_min") != -1){
        var enemyAction = friendlyAction[key];
        var className = "enemyAction";
        var cyNode = getDataFromInputNode(enemyAction, friendlyAction["name"], className);
        nodes.push(cyNode);
        var cyEdge = getEdge(friendlyAction["name"], cyNode["data"]["id"]);
        edges.push(cyEdge);
        getStateNodesUnderEnemyActions(enemyAction);
      }
    }

  }


  function getStateNodesUnderEnemyActions(enemyAction){
    var enemyActionKeys = Object.keys(enemyAction);
    for (var keyIndex in enemyActionKeys){
      var key = enemyActionKeys[keyIndex];
      if (key.indexOf("_state") != -1){
        var stateNode = enemyAction[key]
        var className = "stateNode";
        var cyNode = getDataFromInputNode(stateNode, enemyAction["name"], className);
        nodes.push(cyNode);
        var cyEdge = getEdge(enemyAction["name"], cyNode["data"]["id"]);
        edges.push(cyEdge);
        getFriendlyActionsUnderState(stateNode);
      }
    }
  }
  return treeData;
}

function fillActionNodes(){

  cy.nodeHtmlLabel(
    [
      {
        query: 'node', // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: '', // any classes will be as attribute of <div> container for every title
        tpl: function (data) { return  '<div style="color:red;font-size:15px;">' + '<b>Node: ' + data.id + '</b></div>' } // your html template here
      }
    ]
  );
}

// //hide nodes at init for all past d = 0,1
// function drawActionCanvas(){
//   cy.nodes().forEach(function (ele) {
//     ele.lock();
//     if (ele.classes() == 'initShow') {
//       // Save node data and remove
//       ele.scratch({
//         restData: ele.successors().targets().remove()
//       });
//     }
//   //   var documentId = "actionChart_" + ele.data("id")
//   //   var c = document.getElementById(documentId);
//   //   console.log(c)
//   //   var ctx = c.getContext("2d");
//   //   ctx.moveTo(40, 5);
//   //   ctx.lineTo(40, 80);
//   //   ctx.stroke();
//   //   ctx.moveTo(40, 80);
//   //   ctx.lineTo(180, 80);
//   //   ctx.stroke();
//   });
// }


/* <div style="color:red;font-size:15px;">' + '<b>Node: ' + data.id + '</b></div>\
                                      <div style="color:red;font-size:15px;">' + 'Marines: ' + data.state[0] + '</div>\
                                      <div style="color:red;font-size:15px;">' + 'Banelings: ' + data.state[1] + '</div>\
                                      <div style="color:red;font-size:15px;">' + 'Immortals: ' + data.state[2] + '</div>\
                                      <div style="color:red;font-size:15px;">' + 'Pylons: ' + data.state[3] + '</div>\
                                      <div style="color:red;font-size:15px;">' + 'Top Nexus: ' + data.state[4] + '</div>\
                                      <div style="color:red;font-size:15px;">' + 'Bot Nexus: ' + data.state[5] + '</div>' */

// cy.bind('click ', 'node', function (evt) {
//   // cy.center( this );
//   var pos = cy.nodes(this.data().id).renderedPosition();
//   var center = cy.center()
//   var pan = cy.pan()
//   console.log(pos)
//   console.log(center)
//   var parent = cy.getElementById(this.data.sc2_parent_id);
  
//   cy.fit(this)
//   cy.zoom({level: 1.5,
//            renderedPosition: pan
//           })
// });


// //toggle show and hide nodes on hover over. Dont allow nodes at at d =0,1 to hide
// cy.on('mouseover', 'node', function (evt) {
//   if ((this.scratch().restData == undefined || this.scratch().restData == null) && this.classes() == 'initShow') {
//     // Save node data and remove
//     this.scratch({
//       restData: this.successors().targets().remove()
//     });
//   }
//   else {
//     // Restore the removed nodes from saved data
//     this.scratch().restData.restore();
//     this.scratch({ restData: null });
//   }
// });
