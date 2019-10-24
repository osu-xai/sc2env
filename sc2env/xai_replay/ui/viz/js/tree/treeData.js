function getPlayerColor(player){
    if (player == "agent"){
        return "#8080F0";
    }
    return "#F08080";
}

var treeData = {    
                    container: document.getElementById('cy'),
                    boxSelectionEnabled: false,
                    autounselectify: true,
                    layout: treeLayout,
                    style: treeStyle,
                    headless: false,
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
        spacingFactor: 1.0, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
        avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
        roots: undefined, // the roots of the trees
        maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
        ready: undefined, // callback on layoutready
        stop: undefined, // callback on layoutstop
        transform: function (node, position) {return position } // transform a given node position. Useful for changing flow direction in discrete layouts
    }
// was SteelBlue  
// PV was        background-color: #239B56; \

// ' +  + '             background-image: linear-gradient(to right, #80F080 , #F0F0F0) ;\
   

var treeStyle =
    'node { \
        background-color: ' + nodeBackgroundColor + '; \
        height: ' + genericNodeHeight + 'px; \
        width: ' + genericNodeWidth + 'px; \
        background-fit: cover; \
        border-color: ' + genericNodeBorderColor  + '; \
        border-width: ' + genericNodeBorderWidth + 'px; \
    } \
    .highlightedNode { \
        background-color: ' + highlightedNodeColor + '; \
    } \
    .stateNode{ \
        height: ' + stateNodeHeight + 'px; \
        width: ' + stateNodeWidth + 'px; \
        shape: roundrectangle; \
    } \
    .friendlyAction{ \
        shape: polygon; \
        shape-polygon-points: data(points); \
        height: ' + friendlyActionNodeHeight + 'px; \
        width: ' + actionNodeWidth + 'px; \
        border-color: ' + getPlayerColor("agent") + '; \
        border-width: ' + actionNodeBorderWidth + 'px; \
    } \
    .enemyAction{ \
        shape: polygon; \
        shape-polygon-points: data(points); \
        height: ' + enemyActionNodeHeight + 'px; \
        width: ' + actionNodeWidth + '; \
        border-color: ' + getPlayerColor("enemy") + '; \
        border-width: ' + actionNodeBorderWidth + 'px; \
    } \
    .principalVariation { \
        background-color: ' + principalVariationBackgroundColor + '; \
    } \
    edge { \
        curve-style: taxi; \
        taxi-direction: downward;\
        taxi-turn: 150;\
        width: 60; \
        target-arrow-shape: triangle; \
        line-color: ' + genericEdgeLineColor + '; \
        target-arrow-color: ' + genericEdgeLineColor + '; \
    } \
    .enemyActionEdge { \
        target-arrow-shape: none; \
    } \
    .principalVariationEdge { \
        line-color: ' + principalVariationBackgroundColor + '; \
        target-arrow-color: ' + principalVariationBackgroundColor + '; \
        width: 60; \
    } \
    .userAddedNode { \
        background-color: ' + userAddedNodeColor + '; \
    } \
    .selectedNode{ \
        background-color: ' + selectedNodeColor + '; \
    }';

var cy = undefined;
function initTree(jsonPath, frameNumber){
        controlsManager.setWaitCursor();
        $.getJSON(jsonPath, function(rawSc2Json) {
        generateBackingTreeOfCynodes(rawSc2Json);
        populatePrincipalVariationTrajectory(backingTreeRoot);
        var nodeMenuExist = document.getElementById("node-actions-label");
        if (nodeMenuExist == undefined){
            generateNodeActionMenu("node-menu");
        }
        else{
            currFocusNode = undefined;
            disableActionMenu();
        }
        cy = cytoscape(treeData);
        var rootNodeId = backingTreeRoot["data"]["id"];
        addNextFourBestChildren(cy,cy.getElementById(rootNodeId));
        refreshCy();
        if (alertWithZoomAndPanValuesOfModelBasedView){
            var zoom = cy.zoom();
            var pan = cy.pan();
            alert("zoom : " + zoom + "  pan x " + pan["x"] + " pan y " + pan["y"]);
        }
        controlsManager.clearWaitCursor();
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
            tpl: function (data) { return   getNodeHtml(data, biggestUnitCountTuple)  } // your html template here
        }
        ]
    );
}

function getStateAndActionValues(data){
    stateDict = {};
    currState = data["state"];
    stateDict["TOP Marines State"] = currState[1];
    stateDict["TOP Banelings State"] = currState[2];
    stateDict["TOP Immortals State"] = currState[3];
    stateDict["BOT Marines State"] = currState[4];
    stateDict["BOT Banelings State"] = currState[5];
    stateDict["BOT Immortals State"] = currState[6];
    stateDict["Pylons State"] = currState[7];

    stateDict["Enemy"] = {};
    var stateDictEnemy = stateDict["Enemy"];
    stateDictEnemy["TOP Marines State"] = currState[8];
    stateDictEnemy["TOP Banelings State"] = currState[9];
    stateDictEnemy["TOP Immortals State"] = currState[10];
    stateDictEnemy["BOT Marines State"] = currState[11];
    stateDictEnemy["BOT Banelings State"] = currState[12];
    stateDictEnemy["BOT Immortals State"] = currState[13];
    stateDictEnemy["Pylons State"] = currState[14];

    var action = data["action"];
    if (action != null || action != undefined){
        if (data["name"].indexOf("_min") != -1){
            stateDictEnemy["TOP Marines Action"] = action[0];
            stateDictEnemy["TOP Banelings Action"] = action[1];
            stateDictEnemy["TOP Immortals Action"] = action[2];
            stateDictEnemy["BOT Marines Action"] = action[3];
            stateDictEnemy["BOT Banelings Action"] = action[4];
            stateDictEnemy["BOT Immortals Action"] = action[5];
            stateDictEnemy["Pylons Action"] = action[6];

            stateDict["TOP Marines Action"] = 0;
            stateDict["TOP Banelings Action"] = 0;
            stateDict["TOP Immortals Action"] = 0;
            stateDict["BOT Marines Action"] = 0;
            stateDict["BOT Banelings Action"] = 0;
            stateDict["BOT Immortals Action"] = 0;
            stateDict["Pylons Action"] = 0;   
        }
        else{
            stateDict["TOP Marines Action"] = action[0];
            stateDict["TOP Banelings Action"] = action[1];
            stateDict["TOP Immortals Action"] = action[2];
            stateDict["BOT Marines Action"] = action[3];
            stateDict["BOT Banelings Action"] = action[4];
            stateDict["BOT Immortals Action"] = action[5];
            stateDict["Pylons Action"] = action[6];

            stateDictEnemy["TOP Marines Action"] = 0;
            stateDictEnemy["TOP Banelings Action"] = 0;
            stateDictEnemy["TOP Immortals Action"] = 0;
            stateDictEnemy["BOT Marines Action"] = 0;
            stateDictEnemy["BOT Banelings Action"] = 0;
            stateDictEnemy["BOT Immortals Action"] = 0;
            stateDictEnemy["Pylons Action"] = 0;
        }
    }
    else{
        stateDict["TOP Marines Action"] = 0;
        stateDict["TOP Banelings Action"] = 0;
        stateDict["TOP Immortals Action"] = 0;
        stateDict["BOT Marines Action"] = 0;
        stateDict["BOT Banelings Action"] = 0;
        stateDict["BOT Immortals Action"] = 0;
        stateDict["Pylons Action"] = 0;

        stateDictEnemy["TOP Marines Action"] = 0;
        stateDictEnemy["TOP Banelings Action"] = 0;
        stateDictEnemy["TOP Immortals Action"] = 0;
        stateDictEnemy["BOT Marines Action"] = 0;
        stateDictEnemy["BOT Banelings Action"] = 0;
        stateDictEnemy["BOT Immortals Action"] = 0;
        stateDictEnemy["Pylons Action"] = 0;
    }
    return stateDict;
}

function getActionValues(data){
    var action = data["action"];
    var actionDict = {};

    actionDict["TOP Marines Action"] = action.charAt(0);
    actionDict["TOP Banelings Action"] = action.charAt(1);
    actionDict["TOP Immortals Action"] = action.charAt(2);
    actionDict["BOT Marines Action"] = action.charAt(3);
    actionDict["BOT Banelings Action"] = action.charAt(4);
    actionDict["BOT Immortals Action"] = action.charAt(5);
    actionDict["Pylons Action"] = action.charAt(6);

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

function getEdgeClassFromParentNode(target){
    var result = '';
    var classString = target["classes"];
    if (classString.includes("principalVariation")){
        result += "principalVariationEdge";
    }
    
    if (target["data"]["sc2_nodeType"] == "enemyAction"){
        result += " enemyActionEdge";
    }
    return result;
}

function getEdge(source, target, cyClass){
    var cyEdge = {}
    cyEdge["data"] = {};
    cyEdge["data"]["source"] = source;
    cyEdge["data"]["target"] = target;
    cyEdge["classes"] = cyClass;
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
