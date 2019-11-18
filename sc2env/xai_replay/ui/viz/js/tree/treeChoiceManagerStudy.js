function getTreeChoiceManagerStudy(pauseAndExplainDPs){
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
        //this.highestDPPaused = dp;
        if (this.dps.includes(dp)){
            if (dp > this.highestDPCompleted){
                // at interestingDp and dp > highestCompleted, then show prev DP
                this.dpToRender = dp - 1;
            }
            else {
                // at interestingDp and that dp <= highestCompleted, then show given DP
                this.dpToRender = dp;
            }
        }
        else {
            if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestComplete, then given DP
                this.dpToRender = dp;
            }
            else {
                // not at interestingDP and > highestComplete, then NA
                this.dpToRender = "NA";
            }
        }
    }

    tcm.hopToDP = function(dp){
        if (this.dps.includes(dp)){
            if (dp > this.highestDPCompleted){
                // at interestingDp and dp > highestCompleted, then show prev DP
                this.dpToRender = dp - 1;
            }
            else {
                // at interestingDp and that dp <= highestCompleted, then show given DP
                this.dpToRender = dp;
            }
        }
        else {
            if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestComplete, then given DP
                this.dpToRender = dp;
            }
            else {
                // not at interestingDP and > highestComplete, then NA
                this.dpToRender = "NA";
            }
        }
    }

    tcm.showedExplanation = function(dp){
        this.highestDPWhereExplanationShown = dp;
    }
    tcm.forwardedFromExplanation = function(){
        this.highestDPCompleted = this.highestDPWhereExplanationShown;
    }
    return tcm;
}