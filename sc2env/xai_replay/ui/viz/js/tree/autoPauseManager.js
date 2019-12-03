function getAutoPauseManagerDev(){
    var apm = {};
    // no autopause in dev mode, just stubbed out
    apm.affirmAutoPause = function(dp, highestDPCompleted){
        return undefined;
    }

    return apm;
}

function getAutoPauseManagerStudy(pauseAndPredictDPs, pauseAndExplainDPs){
    var apm = {};
    
    apm.highestPauseAndPredictDPPausedAt = -1;
    apm.ppDps = [];
    apm.peDps = [];

    // clone the lists
    for (var i in pauseAndExplainDPs){
        var dp = pauseAndExplainDPs[i];
        apm.peDps.push(dp);
    }

    for (var i in pauseAndPredictDPs){
        var dp = pauseAndPredictDPs[i];
        apm.ppDps.push(dp);
    }

    // returning undefined means don't pause, returning dp means that's where we are pausing
    apm.affirmAutoPause = function(dp, highestDPCompleted){
        // case - we're at the first pauseAndExplainDP and have not yet completed it
        if (highestDPCompleted == "NA" && this.peDps.includes(dp)){
            controlsManager.disablePauseResume();
            return dp;
        }
        // case - we haven't completed a pauseAndExplainDP yet and we are at the first pauseAndPredictDP for the first time
        if (highestDPCompleted == "NA" && this.ppDps.includes(dp) && dp > this.highestPauseAndPredictDPPausedAt){
            this.highestPauseAndPredictDPPausedAt = dp;
            return dp;
        }
        // case - we haven't completed a pauseAndExplainDP yet and we are at the first pauseAndPredictDP for the 2nd or higher time
        if (highestDPCompleted == "NA" && this.ppDps.includes(dp) && dp == this.highestPauseAndPredictDPPausedAt){
            return undefined;
        }
        // if we haven't completed any and we are at ANY other dp, then we shouldn't pause
        if (highestDPCompleted == "NA"){
            return undefined;
        }
        // case revisiting completed pedp , don't pause
        if ((this.peDps.includes(dp)) && (highestDPCompleted == dp)){
            return undefined;
        }
        // case dp is in ppDPs, hasn't been paused at yet
        if ((this.ppDps.includes(dp)) && !this.peDps.includes(dp) && (this.highestPauseAndPredictDPPausedAt < dp)){
            this.highestPauseAndPredictDPPausedAt = dp;
            return dp;
        }

        // case dp is in ppDps, has been paused at
        if ((this.ppDps.includes(dp)) && (this.highestPauseAndPredictDPPausedAt >= dp)){
            return undefined;
        }

        
        // case dp is in peDPs, hasn't been completed
        if ((this.peDps.includes(dp)) && (highestDPCompleted < dp)){
            controlsManager.disablePauseResume();
            return dp;
        }


        // case dp is in peDps, has been completed
        if ((this.peDps.includes(dp)) && (highestDPCompleted >=  dp)){
            return undefined;
        }
        // case dp in neither list
        return undefined;

    }

    return apm;
}