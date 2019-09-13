var treeData = {    
                    container: document.getElementById('cy'),
                    boxSelectionEnabled: false,
                    autounselectify: true,
                    layout: treeLayout,
                    style: treeStyle,
                    elements : {
                        nodes: [],
                        edges: []
                    }
                };

var treeLayout = {
        name: 'breadthfirst',
        fit: true, // whether to fit the viewport to the graph
        directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
        padding: 10, // padding on fit
        spacingFactor: 1.1, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) {return position } // transform a given node position. Useful for changing flow direction in discrete layouts
    }

var treeStyle =
    'node{ \
        background-color: LightSlateGray; \
        height: 1200; \
        width: 1800; \
        background-fit: cover; \
        border-color: black; \
        border-width: 10px; \
    } \
    .stateNode{ \
        shape: roundrectangle; \
    } \
    .friendlyAction{ \
        shape: polygon; \
        shape-polygon-points: data(points); \
        width: 1100; \
    } \
    .enemyAction{ \
        shape: polygon; \
        shape-polygon-points: data(points); \
        width: 1100; \
    } \
    .principalVariation { \
        background-color: SteelBlue; \
    } \
    .userAddedEnemyAction{ \
        background-color: Green; \
    } \
    .userAddedFriendlyAction { \
        background-color: Green; \
    } \
    edge { \
        curve-style: straight; \
        width: 30; \
        target-arrow-shape: triangle; \
        line-color: #ffaaaa; \
        target-arrow-color: #ffaaaa; \
    } ';



  
var cy = undefined;
function initTree(jsonPath, frameNumber){
        $.getJSON(jsonPath, function(rawSc2Json) {
        generateBackingTreeOfCynodes(rawSc2Json);
        generateStoryLines(backingTreeRoot, frameNumber);
        renderStoryLinesDefaultView(frameNumber);
        // populatePrincipalVariationTree(backingTreeRoot);
        createRootNode(rawSc2Json)
        populateCompleteTree(rawSc2Json)
        initQueryTrees();
        switchQueryTrees(0, cyTreeDataList)
        // cy = cytoscape(treeData);
        cy.ready(function(){
            cy.center();
            childrenFollowParents(cy);
            var biggestUnitCountTuple = getLargestUnitCount(cy);
            sortNodes(cy);
            intitTreeLables(cy, biggestUnitCountTuple);
            intitTreeEvents(cy); 
        });
    });
}

function forgetCyTree(){
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
    rootNode["data"]["sc2_nodeType"] = "stateNode";
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


function openExplanationView(evt, viewName) {
    // Declare all variables
    var i, tabcontent, tabbuttons, tabcontentTagAlong;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tabcontent" and hide them
    tabcontentTagAlong = document.getElementsByClassName("tabcontent-tag-along");
    for (i = 0; i < tabcontentTagAlong.length; i++) {
        tabcontentTagAlong[i].style.display = "none";
    }
    // Get all elements with class="tabbuttons" and remove the class "active"
    tabbuttons = document.getElementsByClassName("tabbutton");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(viewName).style.display = "block";
    evt.currentTarget.className += " active";
    if (viewName == "cy"){
        document.getElementById("unit-legend").style.display = "block";
    }
  }