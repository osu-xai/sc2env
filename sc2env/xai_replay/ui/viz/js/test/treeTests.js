var indicesToBestQVal = {
    ["root"] : 25,
    ["root.0"] : 25,
    ["root.0.0"] : 25,
    ["root.0.0.0"] : 25,
    ["root.0.0.0.0"] : 25,
    ["root.0.0.0.1"] : 24,
    ["root.0.0.0.2"] : 23,
    ["root.0.0.0.3"]  : 22,
    ["root.1"] : 21,
    ["root.1.0"] : 21,
    ["root.1.0.0"] : 21,
    ["root.1.0.0.1"] : 20,
    ["root.1.0.0.2"] : 19,
    ["root.1.0.0.3"] : 18,
    ["root.2"] : 17,
    ["root.2.0"] : 17,
    ["root.2.0.0"] : 17,
    ["root.2.0.0.1"] : 16,
    ["root.2.0.0.2"] : 15,
    ["root.2.0.0.3"] : 14,
    ["root.3"] : 13,
    ["root.3.0"] : 13,
    ["root.3.0.0"] : 13,
    ["root.3.0.0.1"] : 12,
    ["root.3.0.0.2"] : 11,
    ["root.3.0.0.3"] : 10 
                        }

function runTreeTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("treeTests");
    {
        fc.setCase("nodePlacement1");
        //cm = getExplanationsV2Manager(chartData);
        var indicesStrings = [];
        indicesStrings.push("0.0.0");
        indicesStrings.push("0.0.1");
        var tree = buildTree(indicesStrings);
        
        positionNodes(tree);
        var nodeMap = [];
        var nodeIds = [];
        gatherAllNodes(nodeMap, nodeIds, tree);
        fc.assert(nodeIds.length, 5);
        fc.assert(nodeMap["root"]["data"]["xOffset"]      , 0);
        fc.assert(nodeMap["root.0"]["data"]["xOffset"]    , 0);
        fc.assert(nodeMap["root.0.0"]["data"]["xOffset"]  , 0);
        fc.assert(nodeMap["root.0.0.0"]["data"]["xOffset"], 0);
        fc.assert(nodeMap["root.0.0.1"]["data"]["xOffset"], 1);
    }
    {
        fc.setCase("nodePlacement2");
        //cm = getExplanationsV2Manager(chartData);
        var indicesStrings = [];
        indicesStrings.push("0.0.0");
        indicesStrings.push("0.0.1");
        indicesStrings.push("0.0.2");
        indicesStrings.push("0.0.3");
        indicesStrings.push("0.1.0");
        indicesStrings.push("0.1.1");
        indicesStrings.push("0.1.2");
        indicesStrings.push("0.1.3");
        indicesStrings.push("0.2.0");
        indicesStrings.push("0.2.1");
        indicesStrings.push("0.2.2");
        indicesStrings.push("0.2.3");
        indicesStrings.push("0.3.0");
        indicesStrings.push("0.3.1");
        indicesStrings.push("0.3.2");
        indicesStrings.push("0.3.3");
        var tree = buildTree(indicesStrings);
        
        positionNodes(tree);
        var nodeMap = [];
        var nodeIds = [];
        gatherAllNodes(nodeMap, nodeIds, tree);
        fc.assert(nodeIds.length, 22);
        fc.assert(nodeMap["root"]["data"]["xOffset"]      , 0);
        fc.assert(nodeMap["root.0"]["data"]["xOffset"]    , 0);
        fc.assert(nodeMap["root.0.0"]["data"]["xOffset"]  , 0);
        fc.assert(nodeMap["root.0.0.0"]["data"]["xOffset"], 0);
        fc.assert(nodeMap["root.0.0.1"]["data"]["xOffset"], 1);
        fc.assert(nodeMap["root.0.0.2"]["data"]["xOffset"], 2);
        fc.assert(nodeMap["root.0.0.3"]["data"]["xOffset"], 3);
        fc.assert(nodeMap["root.0.1"]["data"]["xOffset"], 4);
        fc.assert(nodeMap["root.0.1.0"]["data"]["xOffset"], 4);
        fc.assert(nodeMap["root.0.1.1"]["data"]["xOffset"], 5);
        fc.assert(nodeMap["root.0.1.2"]["data"]["xOffset"], 6);
        fc.assert(nodeMap["root.0.1.3"]["data"]["xOffset"], 7);
        fc.assert(nodeMap["root.0.2"]["data"]["xOffset"], 8);
        fc.assert(nodeMap["root.0.2.0"]["data"]["xOffset"], 8);
        fc.assert(nodeMap["root.0.2.1"]["data"]["xOffset"], 9);
        fc.assert(nodeMap["root.0.2.2"]["data"]["xOffset"], 10);
        fc.assert(nodeMap["root.0.2.3"]["data"]["xOffset"], 11);
        fc.assert(nodeMap["root.0.3"]["data"]["xOffset"], 12);
        fc.assert(nodeMap["root.0.3.0"]["data"]["xOffset"], 12);
        fc.assert(nodeMap["root.0.3.1"]["data"]["xOffset"], 13);
        fc.assert(nodeMap["root.0.3.2"]["data"]["xOffset"], 14);
        fc.assert(nodeMap["root.0.3.3"]["data"]["xOffset"], 15);
    }
    
    {
        fc.setCase("activeNodePlacement3");
        //cm = getExplanationsV2Manager(chartData);
        var indicesStrings = [];
        indicesStrings.push("0.0.0.0");
        indicesStrings.push("0.0.0.1");
        indicesStrings.push("0.0.0.2");
        indicesStrings.push("0.0.0.3");
        indicesStrings.push("1.0.0.0");
        indicesStrings.push("1.0.0.1");
        indicesStrings.push("1.0.0.2");
        indicesStrings.push("1.0.0.3");
        indicesStrings.push("2.0.0.0");
        indicesStrings.push("2.0.0.1");
        indicesStrings.push("2.0.0.2");
        indicesStrings.push("2.0.0.3");
        indicesStrings.push("3.0.0.0");
        indicesStrings.push("3.0.0.1");
        indicesStrings.push("3.0.0.2");
        indicesStrings.push("3.0.0.3");
        var tree = buildTree(indicesStrings);
        
        var activeNodes = [];
        var nodeMap = [];
        var nodeIds = [];
        gatherAllNodes(nodeMap, nodeIds, tree);
        activeNodes.push(nodeMap["root"]);
        activeNodes.push(nodeMap["root.0"]);
        activeNodes.push(nodeMap["root.0.0"]);
        activeNodes.push(nodeMap["root.0.0.0"]);
        activeNodes.push(nodeMap["root.0.0.0.0"]);
        activeNodes.push(nodeMap["root.0.0.0.1"]);

        activeNodes.push(nodeMap["root.2"]);
        activeNodes.push(nodeMap["root.2.0"]);
        activeNodes.push(nodeMap["root.2.0.0"]);
        activeNodes.push(nodeMap["root.2.0.0.0"]);
        activeNodes.push(nodeMap["root.2.0.0.1"]);

        activeNodes.push(nodeMap["root.3"]);
        activeNodes.push(nodeMap["root.3.0"]);
        activeNodes.push(nodeMap["root.3.0.0"]);
        activeNodes.push(nodeMap["root.3.0.0.0"]);
        activeNodes.push(nodeMap["root.3.0.0.3"]);
        
        //  TODO - THESE ARE BROKEN- STILL RELEVANT?
        // positionActiveNodes(tree, activeNodes);
        
        // fc.assert(nodeIds.length, 29);
        // fc.assert(nodeMap["root"]["data"]["xOffset"]      , 0, "a");
        // fc.assert(nodeMap["root.0"]["data"]["xOffset"]    , 0, "b");
        // fc.assert(nodeMap["root.0.0"]["data"]["xOffset"]  , 0, "c"); 
        // fc.assert(nodeMap["root.0.0.0"]["data"]["xOffset"], 0, "d"); 
        // fc.assert(nodeMap["root.0.0.0.0"]["data"]["xOffset"], 0, "e"); 
        // fc.assert(nodeMap["root.0.0.0.1"]["data"]["xOffset"], 1, "f"); 

        // fc.assert(nodeMap["root.2"]["data"]["xOffset"]    , 2, "g");
        // fc.assert(nodeMap["root.2.0"]["data"]["xOffset"]  , 2, "h"); 
        // fc.assert(nodeMap["root.2.0.0"]["data"]["xOffset"], 2, "i"); 
        // fc.assert(nodeMap["root.2.0.0.0"]["data"]["xOffset"], 2, "j"); 
        // fc.assert(nodeMap["root.2.0.0.1"]["data"]["xOffset"], 3, "k"); 

        // fc.assert(nodeMap["root.3"]["data"]["xOffset"]    , 4, "l");
        // fc.assert(nodeMap["root.3.0"]["data"]["xOffset"]  , 4, "m"); 
        // fc.assert(nodeMap["root.3.0.0"]["data"]["xOffset"], 4, "n"); 
        // fc.assert(nodeMap["root.3.0.0.0"]["data"]["xOffset"], 4, "o");
        // fc.assert(nodeMap["root.3.0.0.3"]["data"]["xOffset"], 5, "p"); 
    }
}

function positionNodes(tree){
    // 0.0.0.0
    // 0.1.0.0
    // 0.1.0.1
    var leafNodes = [];
    findLeafNodes(tree, leafNodes);
    for (var i = leafNodes.length - 1; i >= 0; i--){
        var leafNode = leafNodes[i];
        positionNodeAndParent(leafNode, i);
    }
    // find all the children from left to right and add to list
    // from the end of the list to the beginning
    // position it and all parents to itsIndexInThatList * delta
    // do same for next one to left in list
}

function findLeafNodes(node, leafNodes) {
    var children = node["data"]["sc2_cyChildren"];
    if (children != undefined){
        if (children.length == 0){
            leafNodes.push(node);
        }
        else {
            for (var i in children){
                var child = children[i];
                findLeafNodes(child, leafNodes)
            }
        }
    }
}

function newNode(id){
    var n = {};
    n["data"] = {};
    n["data"]["sc2_cyChildren"] = [];
    n["id"] = id;
    n["data"]["best q_value"] = indicesToBestQVal[id];
    console.log("adding node " + id);
    return n;
}

function buildTree(indicesStrings){
    var root = newNode("root");
    for (var i in indicesStrings){
        var indicesString = indicesStrings[i];
        addTreeNode(root, indicesString);
    }
    return root;
}

function addTreeNode(root, indexString){
    var indices = indexString.split(".");
    addChildAsPerFirstIndex(root, indices);
}

function addChildAsPerFirstIndex(parent, indices){
    var index = indices.shift();
    var desiredCount = Number(index) + 1;
    while (desiredCount > parent["data"]["sc2_cyChildren"].length){
        var newChild = newNode(parent["id"] + "." + parent["data"]["sc2_cyChildren"].length);
        newChild["data"]["sc2_cyParent"] = parent;
        parent["data"]["sc2_cyChildren"].push(newChild);
    }
    if (indices.length > 0){
        var childAsNextParent = parent["data"]["sc2_cyChildren"][Number(index)]; 
        addChildAsPerFirstIndex(childAsNextParent, indices);
    }
}
