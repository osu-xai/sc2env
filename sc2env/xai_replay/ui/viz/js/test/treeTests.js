function runTreeTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("treeTests");
    {
        fc.setCase("nodePlacement");
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
        fc.assert(nodeMap["root"]["xOffset"]      , 0);
        fc.assert(nodeMap["root.0"]["xOffset"]    , 0);
        fc.assert(nodeMap["root.0.0"]["xOffset"]  , 0);
        fc.assert(nodeMap["root.0.0.0"]["xOffset"], 0);
        fc.assert(nodeMap["root.0.0.1"]["xOffset"], 1);
    }
    
    //tree = buildWideTree();
    //fc.assert(sim.getDPThatStartsEpochForStep(1), "DP1", "step1");
}

function gatherAllNodes(nodeMap, ids, node){
    var id = node["id"];
    ids.push(node);
    nodeMap[id] = node;
    var children = node["data"]["sc2_cyChildren"];
    if (children != undefined){
        for (var i in children){
            var child = children[i]; 
            gatherAllNodes(nodeMap, ids, child);
        }
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

function positionNodeAndParent(node, i){
    setNodePosition(node, i);
    var parent = node["data"]["sc2_cyParent"];
    if (parent != undefined){
        positionNodeAndParent(parent, i)
    }
}

function setNodePosition(node, i){
    node["data"]["xOffset"] = i;
}

function newNode(id){
    var n = {};
    n["data"] = {};
    n["data"]["sc2_cyChildren"] = [];
    n["id"] = id;    
    console.log("adding node " + id);
    return n;
}


function buildSmallTree(){
    
}

function buildWideTree(){
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
    return buildTree(indicesStrings);
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
