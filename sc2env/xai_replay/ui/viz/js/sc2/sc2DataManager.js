function getSC2DataManager(sc2ReplaySessionConfig) {
    var frameInfos = extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig);
    return getSC2DataManagerFromFrameInfos(frameInfos);
}

function getSC2DataManagerFromJson(jsonData){
    var frameInfos =getFrameInfosFromJson(jsonData);
    return getSC2DataManagerFromFrameInfos(frameInfos);
}
function getSC2DataManagerFromFrameInfos(frameInfos) {
    var dm = {};
    dm.currentStep = 0;
    dm.frameInfos = frameInfos;
    
    dm.malFormedMessage = validateFrameInfos(dm.frameInfos);
    dm.stepCount = dm.frameInfos.length;
    dm.getCurrentStep = function() {
        return this.currentStep;
    }
    dm.getMalformedMessage = function() { //SC2_TEST
        return this.malFormedMessage;
    }
    
    dm.getStepCount = function() { //SC2_TEST
        return len(this.frameInfos);
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
        for (frameInfo in this.frameInfos){
            if (frameInfo["frame_info_type"] == "decision_point"){
                stepsWithExplanations.push(index);
            }
        }
        return stepsWithExplanations;
    }

    // move to next step and return that frame
    dm.nextFrame = function() {  //SC2_TEST
        if (this.currentStep != this.stepCount - 1){
            this.currentStep += 1;
        }
        return this.frameInfos[this.currentStep];
    }

    dm.getCumulativeRewards = function() {//SC2_DEFERRED
        alert('sc2DataManager.getCumulativeRewards unimplemented')
    }
    dm.getClosestUnitInRange = function(mouseCanvasX, mouseCanvasY) {//SC2_TEST
        var gameMousePixelX = convertCanvasXToGamePixelX(mouseCanvasX, sc2GameCanvasWidth);
        var gameMousePixelY = convertCanvasYToGamePixelY(mouseCanvasY, sc2GameCanvasHeight);
        var minDistance = 30;
        var minDistanceUnit = undefined;
        var frame_info = this.frameInfos[this.currentStep];
        var units = frame_info["units"];
        for (unit in units){
            var gameUnitX = Number(unit["x"]);
            var gameUnitY = Number(unit["y"]);
            var gameUnitPixelX = convertGameXToGamePixelX(gameUnitX);
            var gameUnitPixelY = convertGameYToGamePixelY(gameUnitY);
            var dx = gameMousePixelX - gameUnitPixelX;
            var dy = gameMousePixelY - gameUnitPixelY;
            var distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < minDistance){
                minDistance = distance;
                minDistanceUnit = unit;
            }
        }
        return minDistanceUnit;
    }

    dm.jumpToStep = function(step){ //SC2_TEST
        if (step < this.step_count){
            this.current_step = step;
        }
    }

    dm.getFrameInfo = function(step){//SC2_TEST
        if (step < this.step_count){
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
        if (step >= len(this.frameInfos)){
            throw('sc2DataManager - step is out of range ' + step + "...max step is " + len(this.frameInfos) - 1); 
        }
        var frameInfo = this.frameInfos[step]
        return frameInfo.units;
    }
    return dm;
}

function getFrameInfosFromJson(jsonData) {
    var result = JSON.parse(jsonData);
    return result;
}

function extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig) {
    var jsonData = sc2ReplaySessionConfig.getJsonData();
    return getFrameInfosFromJson(jsonData);
}

function validateFrameInfos(frameInfos){//SC2_TODO implement this 
    return undefined;
}