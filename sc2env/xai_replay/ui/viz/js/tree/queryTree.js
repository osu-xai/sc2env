var cyTreeDataList = [];
var cyQuery = undefined;

function initQueryTrees(){
    copyTreeDataForTitledTree();
    unmentionNonSharedNodes();
    createTreeDivs();
    appropriateCyContainers(cyTreeDataList);    
}

function getTitledTreeList(){
    return titledTreeList;
}

function copyTreeDataForTitledTree(){
    var titledTreeList = getTitledTreeList();
    for (var titledTreeListIndex in titledTreeList){
        var treeDataCopy = JSON.parse(JSON.stringify(treeData));
        cyTreeDataList.push(treeDataCopy);
    }
}

function createTreeDivs(){
    var titledTreeList = getTitledTreeList();
    var cyDiv = document.getElementById("cy");
    for (var titledTreeListIndex in titledTreeList){
        var div = document.createElement("div");
        div.setAttribute("id", "cy" + titledTreeListIndex);
        div.setAttribute("style", "width:100%; height:100%; display:block;");
        for (var i = 0; i < titledTreeList.length; i++){
            if(titledTreeListIndex != i){
                var button = document.createElement("button");
                var buttonText = document.createTextNode(titledTreeList[i]["title"]); 
                button.appendChild(buttonText);  
                button.setAttribute("onclick", "switchQueryTrees(" + i + ", cyTreeDataList)")
                div.appendChild(button);
            }
        }
            cyDiv.appendChild(div);
    }
}

function appropriateCyContainers(cyTreeDataList){
    for (cyTreeDataListIndex in cyTreeDataList){
        var currCyTree = cyTreeDataList[cyTreeDataListIndex];
        var currContainer = document.getElementById('cy' + cyTreeDataListIndex);
        currCyTree["container"] = currContainer;
    }
}

function switchQueryTrees(treeNumber, cyTreeDataList){
    for (cyTreeDataListIndex in cyTreeDataList){
        var currContainer = document.getElementById('cy' + cyTreeDataListIndex);
        currContainer.setAttribute("style", "height:100%; width:100%; display:none;")
    }
    document.getElementById('cy' + treeNumber).setAttribute("style", "display:block; height:100%; width:100%;");
    cy = cytoscape(cyTreeDataList[treeNumber]);

    cy.ready(function(){
        restateLayout(cy);
        cy.center();
        childrenFollowParents(cy);
        var biggestUnitCountTuple = getLargestUnitCount(cy);
        sortNodes(cy);
        intitTreeLables(cy, biggestUnitCountTuple);
        intitTreeEvents(cy); 
    });
    return cy;
}

function unmentionNonSharedNodes(){
    for (var treeDataIndex = 0; treeDataIndex < cyTreeDataList.length; treeDataIndex++){
        var currTreeData = cyTreeDataList[treeDataIndex];
        var currTitledTree = titledTreeList[treeDataIndex];
        var treeNodesInfo = currTitledTree["treeNodesInfo"];
        var savedNodesCopy = [];
        for (var cyNodesIndex in currTreeData["elements"]["nodes"]){
            var currCyNode = currTreeData["elements"]["nodes"][cyNodesIndex];
            for (var sharedNodesIndex in treeNodesInfo){
                var currSharedNode = treeNodesInfo[sharedNodesIndex]
                if (currSharedNode["cyID"] == currCyNode["data"]["id"]){
                    savedNodesCopy.push(currCyNode);
                }
            }
        }
        var savedEdgesCopy = [];
        for (var cyEdgesIndex in currTreeData["elements"]["edges"]){
            var currCyEdge = currTreeData["elements"]["edges"][cyEdgesIndex];
            for (var sharedNodesIndex in treeNodesInfo){
                var currTreeInfo = treeNodesInfo[sharedNodesIndex];
                if (currCyEdge["data"]["source"] == currTreeInfo["cyID"]){
                    for (var sharedNodesIndex2 in treeNodesInfo){
                        var currTreeInfo2 = treeNodesInfo[sharedNodesIndex2];
                        if (currCyEdge["data"]["target"] == currTreeInfo2["cyID"]){
                            savedEdgesCopy.push(currCyEdge);
                        }
                    }
                }
            }
        }
        currTreeData["elements"]["nodes"] = [];
        for (var savedNodesCopyIndex in savedNodesCopy){
            currTreeData["elements"]["nodes"].push(savedNodesCopy[savedNodesCopyIndex]);
        }
        currTreeData["elements"]["edges"] = [];
        for (var savedEdgesCopyIndex in savedEdgesCopy){
            currTreeData["elements"]["edges"].push(savedEdgesCopy[savedEdgesCopyIndex])
        }
    }
    return cyTreeDataList;
}

function restateLayout(cy){
    cy.style()
    .selector('node')
    .css({
        'background-color': 'LightSlateGray',
        'height': 1200,
        'width': 1800,
        'background-fit': 'cover',
        'border-color': 'black',
        'border-width': '10px'
    })
    .selector('.stateNode')
    .css({
        'shape': 'roundrectangle',
    })
    .selector('.friendlyAction')
    .css({
        'shape': 'polygon',
        'shape-polygon-points': 'data(points)',
        'width': 1100
    })
    .selector('.enemyAction')
    .css({
        'shape': 'polygon',
        'shape-polygon-points': 'data(points)',
        'width': 1100,
    })
    .selector('.principalVariation')
    .css({
        'background-color': 'SteelBlue',
    })
    .selector('.userAddedEnemyAction')
    .css({
        'background-color': 'Green',
    })
    .selector('.userAddedFriendlyAction')
    .css({
        'background-color': 'Green',
    })
    .selector('edge')
    .css({
        'curve-style': 'straight',
        'width': 30,
        'target-arrow-shape': 'triangle',
        'line-color': '#ffaaaa',
        'target-arrow-color': '#ffaaaa'
    })
    .update();
    var layout = cy.layout({
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
    })
    layout.run();
}


titledTreeList = [ {
                                    title: "test tree 1",
                                    querys: [],
                                    treeNodesInfo: [
                                                        {
                                                            cyID: "dp1_level1_action_min_12_best",
                                                            highlight: true
                                                        },
                                                        {
                                                            cyID: "dp2_level2_state_120_best",
                                                            highlight: false 
                                                        },
                                                        {
                                                            cyID: "dp1_level1_action_max_1_best",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp1_level1_state",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_action_max_1200_best",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_action_min_12002_best",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_state_120020_best",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp1_level1_action_max_3",
                                                            highlight: true
                                                        },
                                                        {
                                                            cyID: "dp1_level1_action_min_30",
                                                            highlight: false 
                                                        },
                                                        {
                                                            cyID: "dp2_level2_state_300030",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_action_min_30003",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_action_max_3000",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp2_level2_state_300",
                                                            highlight: false
                                                        },
                                                        {
                                                            cyID: "dp1_level1_state",
                                                            highlight: false
                                                        }
                                                    ]
                        },
                        {
                        title: "test tree 2",
                        querys: [],
                        treeNodesInfo: [
                                            {
                                                cyID: "dp1_level1_action_max_3",
                                                highlight: true
                                            },
                                            {
                                                cyID: "dp1_level1_action_min_30",
                                                highlight: false 
                                            },
                                            {
                                                cyID: "dp2_level2_state_300030",
                                                highlight: false
                                            },
                                            {
                                                cyID: "dp2_level2_action_min_30003",
                                                highlight: false
                                            },
                                            {
                                                cyID: "dp2_level2_action_max_3000",
                                                highlight: false
                                            },
                                            {
                                                cyID: "dp2_level2_state_300",
                                                highlight: false
                                            },
                                            {
                                                cyID: "dp1_level1_state",
                                                highlight: false
                                            }
                                    ]
                        }
                    ]