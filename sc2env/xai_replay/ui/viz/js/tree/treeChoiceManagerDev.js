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
    tcm.highestDPCompleted = -1;

    
    tcm.pauseAtDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.hopToDP = function(dp){
        this.dpToRender = dp;
    }

    tcm.showedExplanation = function(dp){
        this.highestDPWhereExplanationShown = dp;
    }
    tcm.forwardedFromExplanation = function(){
        this.highestDPCompleted = this.highestDPWhereExplanationShown;
    }
    return tcm;
}