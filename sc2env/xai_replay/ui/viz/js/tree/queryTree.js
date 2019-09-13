var cyTreeDataList = [];

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
    var treeDataCopy = JSON.parse(JSON.stringify(treeData));
    cyTreeDataList.push(treeDataCopy);
}


function createTreeDivs(){
    var titledTreeList = getTitledTreeList();
    var cyDiv = document.getElementById("cy");
    for (var titledTreeListIndex in titledTreeList){
        var div = document.createElement("div");
        div.setAttribute("id", "cy" + titledTreeListIndex);
        div.setAttribute("style", "width:100%; height:100%; display:none;");
        cyDiv.appendChild(div);
    }
    for (var i = 0; i < titledTreeList.length; i++){
        var button = document.createElement("button");
        var buttonText = document.createTextNode(titledTreeList[i]["title"]); 
        button.appendChild(buttonText);  
        button.setAttribute("onclick", "switchQueryTrees(" + i + ", cyTreeDataList)")
        button.setAttribute("id", "cyButton" + i)
        button.setAttribute("style", "position:absolute; z-index:1001; display:block; height:35px;");
        button.style.bottom = i*35 + "px";
        cyDiv.appendChild(button);
    }
    var button = document.createElement("button");
    var buttonText = document.createTextNode("Whole Tree View"); 
    button.appendChild(buttonText);  
    button.setAttribute("onclick", "hideAllQueryTrees()")
    button.setAttribute("id", "cyButtonDefaultView")
    button.setAttribute("style", "position:absolute; z-index:1001; display:none; height:35px;");
    cyDiv.appendChild(button);
}


function appropriateCyContainers(cyTreeDataList){
    for (cyTreeDataListIndex in cyTreeDataList){
        var currCyTree = cyTreeDataList[cyTreeDataListIndex];
        var currContainer = document.getElementById('cy' + cyTreeDataListIndex);
        currCyTree["container"] = currContainer;
    }
}


function switchQueryTrees(treeNumber, cyTreeDataList){
    var buttonCounter = 1;
    for (cyTreeDataListIndex in titledTreeList){
        var currContainer = document.getElementById('cy' + cyTreeDataListIndex);
        var currButton = document.getElementById('cyButton' + cyTreeDataListIndex);
        currContainer.setAttribute("style", "height:100%; width:100%; display:none;")
        
        if (cyTreeDataListIndex != treeNumber){
            currButton.style.bottom = buttonCounter*35 + "px";
            buttonCounter++;
            currButton.style.display = "block";
        }
        else{
            currButton.style.display = "none";
        }
    }
    document.getElementById('cyButtonDefaultView').style.display = "block";
    document.getElementById('cyButtonDefaultView').style.bottom = "0px";
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
}


function unmentionNonSharedNodes(){
    for (var treeDataIndex = 0; treeDataIndex < titledTreeList.length; treeDataIndex++){
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

function hideAllQueryTrees(){
    for (var titledTreeListIndex in titledTreeList){
        var currContainer = document.getElementById('cy' + titledTreeListIndex);
        currContainer.setAttribute("style", "height:100%; width:100%; display:none;")
        var currButton = document.getElementById('cyButton' + titledTreeListIndex);
        currButton.style.bottom = titledTreeListIndex*35 + "px";
        currButton.style.display = "block";
    }
    document.getElementById('cyButtonDefaultView').style.display = "none";
}

titledTreeList = [ 
                    {
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
                    },
                    {
                        title: "test tree 3",
                        querys: [],
                        treeNodesInfo: [
                            {
                                cyID: "dp2_level2_action_max_1201",
                                highlight: false
                            },
                            {
                                cyID: "dp2_level2_state_120_best",
                                highlight: false 
                            },
                            {
                                cyID: "dp1_level1_action_min_12_best",
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
                                cyID: "dp2_level2_action_min_12012",
                                highlight: false
                            },
                            {
                                cyID: "dp2_level2_state_120120",
                                highlight: true
                            },
                            ///////////
                            {
                                cyID: "dp2_level2_state_020320",
                                highlight: false
                            },
                            {
                                cyID: "dp2_level2_action_min_02032",
                                highlight: false 
                            },
                            {
                                cyID: "dp2_level2_action_max_0203",
                                highlight: false
                            },
                            {
                                cyID: "dp2_level2_state_020",
                                highlight: false
                            },
                            {
                                cyID: "dp1_level1_action_min_02",
                                highlight: false
                            },
                            {
                                cyID: "dp1_level1_action_max_0",
                                highlight: true
                            },
                            {
                                cyID: "dp1_level1_state",
                                highlight: false
                            },
                            ///////////////
                            {
                                cyID: "dp2_level2_state_120130",
                                highlight: false
                            },
                            {
                                cyID: "dp2_level2_action_min_12013",
                                highlight: false 
                            },
                            {
                                cyID: "dp2_level2_action_max_1201",
                                highlight: true
                            },
                            {
                                cyID: "dp2_level2_state_120_best",
                                highlight: false
                            },
                            {
                                cyID: "dp1_level1_action_min_12_best",
                                highlight: false
                            },
                            {
                                cyID: "dp1_level1_action_max_1_best",
                                highlight: false
                            },
                            {
                                cyID: "dp1_level1_state",
                                highlight: false
                            }
                        ]
                    }
                ];
