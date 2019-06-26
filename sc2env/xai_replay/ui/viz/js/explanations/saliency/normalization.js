function getNormalizationFactorByInvertingMaxValue(max){
    if (max == 0) {
        factor = 1;
    }
    else{
        factor = 1/ max;
    }
    return factor;
}

function getMaxFromCellsLists(cellsLists){
    var max = 0.0;
    for (var i in cellsLists){
        var cellsList = cellsLists[i];
        var curMax = getMaxValueForLayer(cellsList);
        if (curMax > max){
            max = curMax;
        }
    }
    return max;
}

// returns an array of cell arrays, one for each layer
function getCellsForAllLayersOfSaliencyId(saliencyId){
    result = [];
    var layerMessage = saliencyLookupMap.get(saliencyId);
    if (layerMessage == undefined){
        console.log("ERROR - no Layer message for saliencyID " + saliencyId);
    }
    else {
        var expLayers = layerMessage.getLayersList();
        for (var i in expLayers){
            var expLayer = expLayers[i];
            var name = expLayer.getName();
            console.log("Layer name:", name);
            var cellList = expLayer.getCellsList();
            result.push(cellList);
        }
    }
    return result;
}


function getCellsForSingleLayerForSaliencyId(saliencyId, desiredLayerName){
    var layerMessage = saliencyLookupMap.get(saliencyId);
    if (layerMessage == undefined){
        console.log("ERROR - no Layer message for saliencyID " + saliencyId);
    }
    else {
        var expLayers = layerMessage.getLayersList();
        for (var i in expLayers){
            var expLayer = expLayers[i];
            var name = expLayer.getName();
            if (name == desiredLayerName){
                cellList = expLayer.getCellsList();
                return cellList;
            }
        }
    }
    return undefined;
}

function addLayersToYieldSingleLayer(cellLists){
    var result = [];
    var length = cellLists[0].length;
    for (var i = 0; i < length; i++){
        var value = 0.0;
        for (var j in cellLists){
            value = value + cellLists[j][i];
        }
        result[i] = value;
    }
    return result;
}

function getNormalizationFactorForAllBarGroupSaliencies(barGroups){
    var temp = [];
    // gather up the cellList from each layer of all groups
    for (var i in barGroups){
        var group = barGroups[i];
        var saliencyId = group.saliencyId;
        var cellsLists = getCellsForAllLayersOfSaliencyId(saliencyId);
        for (var j in cellsLists){
            var cellsList = cellsLists[j];
            temp.push(cellsList);
        }
    }
    // now allthe cells lists are in temp.   Get the max of the max of each
    var max = getMaxFromCellsLists(temp);
    // now get the normalizationFactor
    var normFactor = getNormalizationFactorByInvertingMaxValue(max);
    return normFactor;
}

function getNormalizationFactorForAllBarSaliencies(barGroups){
    var temp = [];
    // gather up the cellList from each layer of all bars
    for (var i in barGroups){
        var group = barGroups[i];
        var bars = group.bars;
        for (var j in bars){
            var bar = bars[j];
            var saliencyId = bar.saliencyId;
            var cellsLists = getCellsForAllLayersOfSaliencyId(saliencyId);
            for (var j in cellsLists){
                var cellsList = cellsLists[j];
                temp.push(cellsList);
            }
        }
    }
    // now all the cells lists are in temp.   Get the max of the max of each
    var max = getMaxFromCellsLists(temp);
    // now get the normalizationFactor
    var normFactor = getNormalizationFactorByInvertingMaxValue(max);
    return normFactor;
}

function getNormalizationFactorForAllBarSalienciesNew(barGroups){
    var out = [];
    // gather up the cellList from each layer of all bars
    for (var i in barGroups){
        var group = barGroups[i];
        var bars = group.bars;
        for (var j in bars){
            var bar = bars[j];
            var saliencyId = bar.saliencyId;
            console.log( "saliencyID: " + saliencyId );
            var layerMessage = saliencyLookupMap.get(saliencyId);
            if (layerMessage == undefined){
                console.log("ERROR - no Layer message for saliencyID " + saliencyId);
                continue;
            }

            var expLayers = layerMessage.getLayersList();
            var name;
            for (var i in expLayers){
                var expLayer = expLayers[i];
                name = expLayer.getName();
                console.log("Layer name:", name);
            }

            out.push(1.0 / norm_dict[saliencyId][name]);
        }
    }

    return out;
}


function getNormalizationFactorForCombinedBarGroupSaliencies(barGroups) {
    var temp = [];
    // gather up the cellList from each layer of all groups
    for (var i in barGroups){
        var group = barGroups[i];
        var saliencyId = group.saliencyId;
        var cellsLists = getCellsForAllLayersOfSaliencyId(saliencyId);
        // add each pixel value from all layers together to get a flattened-combined single layer
        var flattentedCombinedCellList = addLayersToYieldSingleLayer(cellsLists);
        temp.push(flattentedCombinedCellList);
    }
    // now allthe cells lists are in temp.   Get the max of the max of each
    var max = getMaxFromCellsLists(temp);
    // now get the normalizationFactor
    var normFactor = getNormalizationFactorByInvertingMaxValue(max);
    return normFactor;
}

function getNormalizationFactorForCombinedBarSaliencies(barGroups) {
    var temp = [];
    // gather up the cellList from each layer of all groups
    for (var i in barGroups){
        var group = barGroups[i];
        var bars = group.bars;
        for (var j in bars) {
            var bar = bars[j];
            var saliencyId = bar.saliencyId;
            var cellsLists = getCellsForAllLayersOfSaliencyId(saliencyId);
            // add each pixel value from all layers together to get a flattened-combined single layer
            var flattentedCombinedCellList = addLayersToYieldSingleLayer(cellsLists);
            temp.push(flattentedCombinedCellList);
        }
    }
    // now allthe cells lists are in temp.   Get the max of the max of each
    var max = getMaxFromCellsLists(temp);
    // now get the normalizationFactor
    var normFactor = getNormalizationFactorByInvertingMaxValue(max);
    return normFactor;
}

var normalizationFunctionMap = {};
normalizationFunctionMap["action.detailed"] = getNormalizationFactorForAllBarGroupSaliencies;
normalizationFunctionMap["action.combined"] = getNormalizationFactorForCombinedBarGroupSaliencies;
normalizationFunctionMap["reward.detailed"] = getNormalizationFactorForAllBarSaliencies;
normalizationFunctionMap["reward.combined"] = getNormalizationFactorForCombinedBarSaliencies;

function getNormalizationKey(displayGranularity, dataGranularity){
    // dataGranularity == "action" | "reward"
    // dispplayGranularity = "detailed" | "combined"
    return dataGranularity + "." + displayGranularity;
}
function getNormalizationFactorForDisplayStyleAndResolution(style, resolution, actions) {
    var key =getNormalizationKey(style, resolution);
    var f = normalizationFunctionMap[key];
    return f(actions);
}

