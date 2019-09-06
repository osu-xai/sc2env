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
        $.getJSON(jsonPath, function(rawSc2Json) {
        // $.getJSON("js/tree/whole_decision_point_1.json", function(rawSc2Json) {
        generateBackingTreeOfCynodes(rawSc2Json);
        populatePrincipalVariationTree(backingTreeRoot);
        // alert("creating tree")
        // createRootNode(rawSc2Json);

        // cyPopulateFriendlyActionUnderState(rawSc2Json);
        // //alert("telling cytoscape about it")
        cy = cytoscape(treeData);
        // //alert("telling children to follow parents")
        // childrenFollowParents(cy);
        // var root = cy.$('.rootNode');
        // //alert("biggest unit count")
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        // //alert("initTreeLabels")
        intitTreeLables(cy, biggestUnitCountTuple);
        // //alert("initTreeFunctions")
        // intitTreeFunctions(cy);    
        // //alert("sortNodes")
        // sortNodes(cy);
        // alert("done");
    });
}


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


function getCyNodeFromJsonNode(inputNode, parentId, cyClass){
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
    
    if (inputNode["name"].indexOf("best") != -1){
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

function populateCompleteTree(jsonStateNode){
    cyPopulateFriendlyActionUnderState(jsonStateNode);
}
var enemyActionShapePoints =    [-1, -1, 1, -1, 1, .75, 0, 1, -1, .75]
var friendlyActionShapePoints = [-1, 1, 1, 1, 1, -.75, 0, -1, -1, -.75]
// from raw json, populating cytoscape data (recursive)
function cyPopulateFriendlyActionUnderState(jsonStateNode){
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
  
    var children = jsonStateNode["children"][0];
    for (var childIndex in children){
        var jsonFriendlyActionNode = children[childIndex];
        var className = "friendlyAction";
        var cyFriendlyActionNode = getCyNodeFromJsonNode(jsonFriendlyActionNode, jsonStateNode["name"], className);
        cyFriendlyActionNode["data"]["type"] = "friendlyAction";
        cyFriendlyActionNode["data"]["points"] = friendlyActionShapePoints;
        nodes.push(cyFriendlyActionNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonStateNode["name"]), trimBestNotationDuplicate(cyFriendlyActionNode["data"]["id"]));
        edges.push(cyEdge);
        cyPopulateEnemyActionsUnderFriendlyAction(jsonFriendlyActionNode);
    }
}


function cyPopulateEnemyActionsUnderFriendlyAction(jsonFriendlyActionNode){
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
  
    var children = jsonFriendlyActionNode["children"][0];
    for (var childIndex in children){
        var jsonEnemyActionNode = children[childIndex];
        var className = "enemyAction";
        var cyEnemyActionNode = getCyNodeFromJsonNode(jsonEnemyActionNode, jsonFriendlyActionNode["name"], className);
        cyEnemyActionNode["data"]["type"] = "enemyAction";
        cyEnemyActionNode["data"]["points"] = enemyActionShapePoints;
        nodes.push(cyEnemyActionNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonFriendlyActionNode["name"]), trimBestNotationDuplicate(cyEnemyActionNode["data"]["id"]));
        edges.push(cyEdge);
        cyPopulateStateNodesUnderEnemyActions(jsonEnemyActionNode);
    }
}
  
function cyPopulateStateNodesUnderEnemyActions(jsonEnemyActionNode){
    var nodes = treeData["elements"]["nodes"];
    var edges = treeData["elements"]["edges"];
  
    var children = jsonEnemyActionNode["children"][0];
    for (var childIndex in children){
        var jsonStateNode = children[childIndex];
        var className = "stateNode";
        var cyStateNode = getCyNodeFromJsonNode(jsonStateNode, jsonEnemyActionNode["name"], className);
        nodes.push(cyStateNode);
        var cyEdge = getEdge(trimBestNotationDuplicate(jsonEnemyActionNode["name"]), trimBestNotationDuplicate(cyStateNode["data"]["id"]));
        edges.push(cyEdge);
        cyPopulateFriendlyActionUnderState(jsonStateNode);
    }
}
