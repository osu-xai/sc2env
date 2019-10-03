const forwardDP = 3;
const forwardDPCheck = false;
const interestingDPs = [3,4,5,10,11,14,15,16,27,28,29,30,31,32,33]
var activeSC2DataManager = undefined;
var DATA_GATHERING_UNIT_ID = 45;
var trimBy = 80
var interestingDPsByFrame = [];

function getSC2DataManager(sc2ReplaySessionConfig) {
    var frameInfos = extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig);
    frameInfos = trimFirstFrames(frameInfos, trimBy)
    addWaveTriggeredToFrames(frameInfos);
    addUnitCountsToFrames(frameInfos);
    addUnitDeltasToFrames(frameInfos);
    getDecisionPointFrames(frameInfos, 0)
    getInterestingFrameNumbersForDPs();
    return getSC2DataManagerFromFrameInfos(frameInfos);
}

function getSC2DataManagerFromJson(jsonData){
    var frameInfos = getFrameInfosFromJson(jsonData);
    return getSC2DataManagerFromFrameInfos(frameInfos);
}

function getInterestingFrameNumbersForDPs(){
    for (var dpIndex in interestingDPs){
        var currInterestingDP = interestingDPs[dpIndex];
        interestingDPsByFrame.push(decisionPoints[currInterestingDP-1]);
    }
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

var decisionPoints = []
function getDecisionPointFrames(frameInfos, frameNumber){
    decisionPoints = [];
    for (var i = frameNumber; i < frameInfos.length; i++){
        if (frameInfos[i].frame_info_type == "decision_point"){
            decisionPoints.push(frameInfos[i].frame_number);
        }
    }
}

var unitInfoKeys = [
    "friendly.marineBuilding.top",
    "friendly.banelingBuilding.top",
    "friendly.immortalBuilding.top",
    "friendly.marineBuilding.bottom",
    "friendly.banelingBuilding.bottom",
    "friendly.immortalBuilding.bottom",
    "enemy.marineBuilding.top",
    "enemy.banelingBuilding.top",
    "enemy.immortalBuilding.top",
    "enemy.marineBuilding.bottom",
    "enemy.banelingBuilding.bottom",
    "enemy.immortalBuilding.bottom",
    "friendly.Pylon",
    "enemy.Pylon"
]

var unitIdForKey = {};
unitIdForKey["friendly.marineBuilding.top"] = 21;
unitIdForKey["friendly.banelingBuilding.top"] = 28;
unitIdForKey["friendly.immortalBuilding.top"] = 70;
unitIdForKey["friendly.marineBuilding.bottom"] = 21;
unitIdForKey["friendly.banelingBuilding.bottom"] = 28;
unitIdForKey["friendly.immortalBuilding.bottom"] = 70;
unitIdForKey["enemy.marineBuilding.top"] = 21;
unitIdForKey["enemy.banelingBuilding.top"] = 28;
unitIdForKey["enemy.immortalBuilding.top"] = 70;
unitIdForKey["enemy.marineBuilding.bottom"] = 21;
unitIdForKey["enemy.banelingBuilding.bottom"] = 28;
unitIdForKey["enemy.immortalBuilding.bottom"] = 70;
unitIdForKey["friendly.Pylon"] = 60;
unitIdForKey["enemy.Pylon"] = 60;


var allianceForKey = {};
allianceForKey["friendly.marineBuilding.top"] = 1;
allianceForKey["friendly.banelingBuilding.top"] = 1;
allianceForKey["friendly.immortalBuilding.top"] = 1;
allianceForKey["friendly.marineBuilding.bottom"] = 1;
allianceForKey["friendly.banelingBuilding.bottom"] = 1;
allianceForKey["friendly.immortalBuilding.bottom"] = 1;
allianceForKey["enemy.marineBuilding.top"] = 4;
allianceForKey["enemy.banelingBuilding.top"] = 4;
allianceForKey["enemy.immortalBuilding.top"] = 4;
allianceForKey["enemy.marineBuilding.bottom"] = 4;
allianceForKey["enemy.banelingBuilding.bottom"] = 4;
allianceForKey["enemy.immortalBuilding.bottom"] = 4;
allianceForKey["friendly.Pylon"] = 1;
allianceForKey["enemy.Pylon"] = 4;


var laneForKey = {};
laneForKey["friendly.marineBuilding.top"] = "top";
laneForKey["friendly.banelingBuilding.top"] = "top";
laneForKey["friendly.immortalBuilding.top"] = "top";
laneForKey["friendly.marineBuilding.bottom"] = "bottom";
laneForKey["friendly.banelingBuilding.bottom"] = "bottom";
laneForKey["friendly.immortalBuilding.bottom"] = "bottom";
laneForKey["enemy.marineBuilding.top"] = "top";
laneForKey["enemy.banelingBuilding.top"] = "top";
laneForKey["enemy.immortalBuilding.top"] = "top";
laneForKey["enemy.marineBuilding.bottom"] = "bottom";
laneForKey["enemy.banelingBuilding.bottom"] = "bottom";
laneForKey["enemy.immortalBuilding.bottom"] = "bottom";
laneForKey["friendly.Pylon"] = "NA";
laneForKey["enemy.Pylon"] = "NA";


function addUnitCountsToFrames(frameInfos){
    var prevWaveCounts = {};
    var prevFrame = {};
    for (keyIndex in unitInfoKeys){
        var key = unitInfoKeys[keyIndex];
        var countKey = key +"_count";
        for (frameIndex in frameInfos){
            var frame = frameInfos[frameIndex];
            frame[countKey] = 0;
            var unitId = unitIdForKey[key];
            var lane = laneForKey[key];
            var alliance = allianceForKey[key];
            var units = frame["units"];
            for (unitIndex in units){
                var unit = units[unitIndex];
                var curUnitId = unit["unit_type"];
                var curAlliance = unit["alliance"];
                if (curUnitId == 60){
                    var curLane = "NA";
                }
                else{
                    var curLane = getUnitLane(unit["y"]);
                }
                if (curUnitId == unitId &&  curAlliance == alliance){
                    if (curLane == "NA" || curLane == lane) {
                        if (curAlliance == 4 && frame["wave_triggered"] == 1 && prevFrame["wave_triggered"] == 0){
                            if (countKey in prevFrame){
                                prevWaveCounts[countKey] = prevFrame[countKey];
                            }
                            else{
                                prevFrame[countKey] = 0;
                                prevWaveCounts[countKey] = prevFrame[countKey];
                            }
                            if (prevWaveCounts != undefined){
                                frame[countKey] = prevWaveCounts[countKey];
                            }
                        }
                        else{
                            frame[countKey]++;
                        }
                    }
                }
            }
            prevFrame[countKey] = frame[countKey];
        }
    }
}

function addUnitDeltasToFrames(frameInfos){
    var deltaKeyCounters = {};
    for (keyIndex in unitInfoKeys){
        var key = unitInfoKeys[keyIndex];
        var prevFrame = undefined;
        var countKey = key +"_count";
        var deltaKey = key + "_delta";
        var deltaCounterKey = key + "_delta_count";
        for (frameIndex in frameInfos){
            var frame = frameInfos[frameIndex];
            frame[deltaKey] = 0;
            frame[deltaKey + "_triggered"] = 0;

            if (prevFrame != undefined){
                if (prevFrame[countKey] < frame[countKey]){
                    frame[deltaKey] = frame[countKey] - prevFrame[countKey];
                    frame[deltaKey + "_triggered"] = 1;
                    deltaKeyCounters[deltaCounterKey] = 1;
                }
                else {
                    // no difference between frames
                    var curCount = deltaKeyCounters[deltaCounterKey];
                    if (curCount == undefined){
                        deltaKeyCounters[deltaCounterKey] = 0;
                        frame[deltaKey + "_triggered"] = 0;

                    }
                    else if (curCount != 0){
                        curCount++;
                        // console.log(key + " frame " + frameIndex + " curCount " + curCount);
                        if (curCount > 40){
                            deltaKeyCounters[deltaCounterKey] = 0;
                            // console.log(key + " frame " + frameIndex + " resetting to 0")
                            frame[deltaKey + "_triggered"] = 0;
                        }
                        else {
                            deltaKeyCounters[deltaCounterKey] = curCount;
                            frame[deltaKey] = prevFrame[deltaKey];
                            frame[deltaKey + "_triggered"] = 1;
                            // console.log(key + " frame " + frameIndex + " applying prior delta")
                        }
                    }
                }
            }
            prevFrame = frame;
        }
    }
}

function addWaveTriggeredToFrames(frameInfos){
    var key = "wave_triggered";
    var count = undefined
    for (var frameIndex = 0; frameIndex < frameInfos.length-1; frameIndex++){
        var currFrame = frameInfos[frameIndex]
        var nextFrame = frameInfos[frameIndex+1]
        var currUnits = currFrame["units"]
        var nextUnits = nextFrame["units"]
        var currFrameWaveNumber = undefined;
        var nextFrameWaveNumber = undefined;
        for (var currUnitsIndex in currUnits){
            var currUnit = currUnits[currUnitsIndex]
            if (currUnit["unit_type"] == 45){
                if(currUnit["shield"] == 42){
                    currFrameWaveNumber = currUnit["health"] - 1; //first wave is 0
                }
            }
        }
        for (var nextUnitsIndex in nextUnits){
            var nextUnit = nextUnits[nextUnitsIndex]
            if (nextUnit["unit_type"] == 45){
                if(nextUnit["shield"] == 42){
                    nextFrameWaveNumber = nextUnit["health"] - 1; //first wave is 0
                }
            }
        }
        if(nextFrameWaveNumber > currFrameWaveNumber){
            nextFrame[key] = 1;
            count = 0;
        }
        else if (count != undefined && count <= 40){
            nextFrame[key] = 1;
            count++;
        }
        else{
            nextFrame[key] = 0;
        }
    }
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
        // console.log("MouseX: " + mouseCanvasX + "\tUnitX: " + unitCoordX)
        // console.log("MouseY: " + mouseCanvasY + "\tUnitY: " + unitCoordY)
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