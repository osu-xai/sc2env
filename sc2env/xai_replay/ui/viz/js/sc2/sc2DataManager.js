function getSC2DataManager(sc2ReplaySessionConfig) {
    var dm = {};
    dm.currentStep = 0;
    dm.frameInfos = extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig)
    dm.getCurrentStep = function() {
        return this.currentStep;
    }
    dm.nextStep = function(){
        alert('sc2DataManager.nextStep unimplemented')
    }
    dm.getMalformedMessage = function() {
        alert('sc2DataManager.getMalformedMessage unimplemented')
    }
    dm.getStepCount = function() {
        return len(this.frameInfos);
    }

    dm.getExplanationStepList = function() {
        alert('sc2DataManager.getExplanationStepList unimplemented')
    }
    dm.getNextFrameInfo = function() {
        alert('sc2DataManager.getNextFrameInfo unimplemented')
    }
    dm.getCumulativeRewards = function() {
        alert('sc2DataManager.getCumulativeRewards unimplemented')
    }
    dm.getClosestUnitInRange = function(canvasX, canvasY) {
        alert('sc2DataManager.getClosestUnitInRange unimplemented')
    }
    dm.jumpToStep = function(step){
        alert('sc2DataManager.jumpToStep unimplemented')
    }

    dm.getFrameInfo = function(step){
        alert('sc2DataManager.getFrameInfo unimplemented')
    }

    dm.getUnitInfos = function(step){ 
        if (step < 0){
            throw('sc2DataManager - step cannot be below zero ' + step);
        }
        if (step > len(frameInfos)){
            throw('sc2DataManager - step is out of range ' + step + "...max step is " + len(frameInfo) - 1); 
        }
        var frameInfo = this.frameInfos[step]
        return frameInfo.units;
    }
    dm.getVideoFilepath = function(){
        alert('sc2DataManager.getVideoFilepath unimplemented')
    }
    return dm;
}

function extractFrameInfosFromReplaySessionConfig(sc2ReplaySessionConfig) {
    alert('extractFrameInfosFromReplaySessionConfig unimplemented')
}