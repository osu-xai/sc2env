var activeSC2DataManager = undefined;
var DATA_GATHERING_UNIT_ID = 45;
var trimBy = 80
function getSC2DataManager(sc2ReplaySessionConfig) {
    var frameInfos = extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig);
    frameInfos = trimFirstFrames(frameInfos, trimBy)
    return getSC2DataManagerFromFrameInfos(frameInfos);
}

function getSC2DataManagerFromJson(jsonData){
    var frameInfos =getFrameInfosFromJson(jsonData);
    return getSC2DataManagerFromFrameInfos(frameInfos);
}

function trimFirstFrames(frameInfos, trimBy){
    for (var i = 0; i < trimBy; i++){
        frameInfos.shift()
    }
    for (var i = 0; i < frameInfos.length; i++){
        frameInfos[i].frame_number = i;
    }
    return frameInfos;
}

function getSC2DataManagerFromFrameInfos(frameInfos) {
    var dm = {};
    dm.frameInfos = frameInfos;
    
    dm.malFormedMessage = validateFrameInfos(dm.frameInfos);
    dm.stepCount = frameInfos.length;
    console.log("step count found to be "+ dm.stepCount);

    dm.getMalformedMessage = function() { //SC2_TEST
        return this.malFormedMessage;
    }
    
    dm.getStepCount = function() { //SC2_TEST
        return this.frameInfos.length;
    }

    dm.validateStep = function(step){//SC2_TEST
        if (step > this.stepCount - 1){
            return this.stepCount - 1;
        }
        else {
            return step;
        }
    }
    // find the indices of all the decision_point frames
    dm.getExplanationStepsList = function() { //SC2_TEST
        var stepsWithExplanations = [];
        var index = 0
        for (i in this.frameInfos){
            var frameInfo = this.frameInfos[i];
            if (frameInfo["frame_info_type"] == "decision_point"){
                stepsWithExplanations.push(index);
            }
            index += 1;
        }
        return stepsWithExplanations;
    }

    dm.getExplanationTitlesList = function(){//SC2_TEST
        var actionNames = [];
        for (i in this.frameInfos){
            var frameInfo = this.frameInfos[i];
            if (frameInfo["frame_info_type"] + "decision_point"){
                actionnames.push(frameInfo["action"]);
            }
        }
        return actionnames;
    }

    dm.getCumulativeRewards = function(frameInfo) {
        return frameInfo["cumulative_rewards"];
    }
 
    dm.getClosestUnitIdInRange = function(mouseCanvasX, mouseCanvasY) {//SC2_TEST
        var unitCoordX = translateCanvasXCoordToGameUnitXCoord(mouseCanvasX, gameboard_canvas.width);
        var unitCoordY = translateCanvasYCoordToGameUnitYCoord(mouseCanvasY, gameboard_canvas.height);
        console.log("MouseX: " + mouseCanvasX + "\tUnitX: " + unitCoordX)
        console.log("MouseY: " + mouseCanvasY + "\tUnitY: " + unitCoordY)
        var minDistance = roughlyHalfWidthOfUnitInGameUnits;
        var minDistanceUnit = undefined;
        var frame_info = this.frameInfos[sessionIndexManager.getCurrentIndex()];
        var units = frame_info["units"];
        for (i in units){
            var unit = units[i];
            var gameUnitX = Number(unit["x"]);
            var gameUnitY = Number(unit["y"]);
            
            var dx = Math.abs(unitCoordX - gameUnitX);
            var dy = Math.abs(unitCoordY - gameUnitY);
            var distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < minDistance){
                minDistance = distance;
                minDistanceUnit = unit;
            }
        }
        if (minDistanceUnit == undefined){
            return undefined;
        }
        else {
            return minDistanceUnit["tag"];
        }
    }

    dm.getFrameInfo = function(step){//SC2_TEST
        if (step < this.stepCount){
            return this.frameInfos[step];
        }
        else {
            return undefined;
        }
    }

    dm.getUnitInfos = function(step){ //SC2_TEST
        if (step < 0){
            throw('sc2DataManager - step cannot be below zero ' + step);
        }
        if (step >= this.frameInfos.length){
            throw('sc2DataManager - step is out of range ' + step + "...max step is " + this.frameInfos.length - 1); 
        }
        var frameInfo = this.frameInfos[step]
        var allUnits = frameInfo.units;
        var trueUnits = screenOutCustomDataGatheringUnits(allUnits);
        return trueUnits;
    }
    return dm;
}

function screenOutCustomDataGatheringUnits(allUnits){
    var result = [];
    for (i in allUnits){
        var unit = allUnits[i];
        if (unit.unit_type != DATA_GATHERING_UNIT_ID){ // data gathering uni
            result.push(unit);
        }
    }
    return result;
}
function getFrameInfosFromJson(jsonData) {
    var result = JSON.parse(jsonData);
    return result;
}

function extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig) {
    var jsonData = sc2ReplaySessionConfig.getJsonData();
    return getFrameInfosFromJson(jsonData);
}

function validateFrameInfos(frameInfos){//SC2_TODO_DEFER implement this 
    return undefined;
}

// function convertSC2QValuesToJSChart(frameInfo){
//     var chart = {};
//     chart.title = "CHART TITLE";
//     chart.v_title = "VERTICAL AXIS"
//     chart.h_title = "HORIZONTAL AXIS";
//     chart.actions = [];
//     var qValues = frameInfo["q_values"];
//     var step = frameInfo["frame_number"];
//     var actionAttackQ1 = collectActionInfo(step, "Attack Q1", qValues["Top_Right"]);
//     var actionAttackQ2 = collectActionInfo(step, "Attack Q2", qValues["Top_Left"]);
//     var actionAttackQ3 = collectActionInfo(step, "Attack Q3", qValues["Bottom_Left"]);
//     var actionAttackQ4 = collectActionInfo(step, "Attack Q4", qValues["Bottom_Right"]);
//     chart.actions.push(actionAttackQ1);
//     chart.actions.push(actionAttackQ2);
//     chart.actions.push(actionAttackQ3);
//     chart.actions.push(actionAttackQ4);
//     return chart;
// }

function averageValuesInDictionary(actionValues){//SC2_TEST
    var values = Object.values(actionValues);
    var valuesCount = values.length;
    var total = 0;
    for (i in values){
        var value = values[i];
        total += Number(value);
    }
    var average = total / valuesCount;
    return average;
}

function collectActionInfo(step, actionName, actionValues){
    var action = {};
    action.name = actionName;
    action.bars = [];
    action.saliencyId = step + "_" + actionName + '_all';
    action.value = averageValuesInDictionary(actionValues);
    var keys = Object.keys(actionValues);
    var sortedRewardNames = sortRewardNamesIntoRelatedPairs(keys);
    for (i in sortedRewardNames){
        var rewardName = sortedRewardNames[i];
        if (rewardName != 'all'){
            var bar_saliency_id = step + "_" + actionName + "_" + rewardName;
            var bar = collectBarInfo(bar_saliency_id, rewardName, actionValues[rewardName]);
            action.bars.push(bar);
        }
    }
    return action;
}

function collectBarInfo(bar_saliency_id, barName, barValue){
    var bar = {};
    bar.name = barName;
    bar.saliencyId = bar_saliency_id;
    bar.value = barValue;
    return bar;
}