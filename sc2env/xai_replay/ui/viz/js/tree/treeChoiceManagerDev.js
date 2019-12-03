function getTreeChoiceManagerDev(pauseAndExplainDPs){
    var tcm = {};

    tcm.dps = [];
    // clone the list
    for (var i in pauseAndExplainDPs){
        var dp = pauseAndExplainDPs[i];
        tcm.dps.push(dp);
    }
    tcm.dpToRender = undefined;
    tcm.highestDPWhereExplanationShown = -1;
    tcm.dpParkedAtforControlledExplanation = undefined;
    
    tcm.pauseAtDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.hopToDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.pauseAfterDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.hopToAfterDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.someExplanationShown = function(){
    }

    tcm.showedControlledExplanation = function(dp){
    }

    tcm.resume = function(){
    }
    
    tcm.isForwardGestureBlocked = function(frame){
        return false;
    }

    return tcm;
}