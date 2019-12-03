function getTreeChoiceManagerStudy(pauseAndExplainDPs){
    var tcm = {};

    tcm.dps = [];
    // clone the list
    for (var i in pauseAndExplainDPs){
        var dp = pauseAndExplainDPs[i];
        tcm.dps.push(dp);
    }
    tcm.dpToRender = undefined;
    tcm.dpParkedAtforControlledExplanation = undefined;
    tcm.highestDPWhereExplanationShown = -1;
    tcm.highestDPCompleted = -1;

    
    tcm.pauseAtDP = function(dp){
        //this.highestDPPaused = dp;
        if (this.dps.includes(dp)){
            if (dp > this.highestDPCompleted){
                // at interestingDp and dp > highestCompleted, then show prev DP
                this.dpToRender = dp - 1;
                this.dpParkedAtforControlledExplanation = dp;
            }
            else {
                // at interestingDp and that dp <= highestCompleted, then show given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
        else {
            if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestComplete, then given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
            else {
                // not at interestingDP and > highestComplete, then NA
                this.dpToRender = "NA";
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
    }

    tcm.hopToDP = function(dp){
        if (this.dps.includes(dp)){
            if (dp > this.highestDPCompleted){
                // at interestingDp and dp > highestCompleted, then show prev DP
                this.dpToRender = dp - 1;
                this.dpParkedAtforControlledExplanation = dp;
            }
            else {
                // at interestingDp and that dp <= highestCompleted, then show given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
        else {
            if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestComplete, then given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
            else {
                // not at interestingDP and > highestComplete, then NA
                this.dpToRender = "NA";
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
    }

    
    tcm.arriveAfterDP = function(dp){
        if (this.dps.includes(dp)){
            if (dp > this.highestDPCompleted){
                // at past interestingDp and dp > highestCompleted, then shouldn't have ability to see later explanations until 
                // move past next interestingDp
                this.dpToRender = "NA";
                this.dpParkedAtforControlledExplanation = undefined;
            }
            else {
                // at interestingDp and that dp <= highestCompleted, then show given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
        else {
            if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestComplete, then given DP
                this.dpToRender = dp;
                this.dpParkedAtforControlledExplanation = undefined;
            }
            else {
                // not at interestingDP and > highestComplete, then NA
                this.dpToRender = "NA";
                this.dpParkedAtforControlledExplanation = undefined;
            }
        }
    }

    tcm.pauseAfterDP = function(dp){
        this.arriveAfterDP(dp);
    }
    tcm.hopToAfterDP = function(dp){
        this.arriveAfterDP(dp);
    }

    tcm.someExplanationShown = function(){
        if (this.dpParkedAtforControlledExplanation != undefined){
            this.showedControlledExplanation(this.dpParkedAtforControlledExplanation);
        }
    }

    tcm.showedControlledExplanation = function(dp){
        this.highestDPWhereExplanationShown = dp;
    }

    tcm.resume = function(){
        if (this.dpParkedAtforControlledExplanation != undefined){
            this.highestDPCompleted = this.highestDPWhereExplanationShown;
            this.dpParkedAtforControlledExplanation = undefined;
        }
    }

    tcm.isForwardGestureBlocked = function(frame){
        // prevent user from clicking past DP that has been "completed" as part of the controlled process 
        // which means that after, at DP7, we have already explained DP6 and we have resumed, then that means
        // DP7 is "complete"
        var priorToFirstDPToExplain = false;
        if (this.highestDPCompleted == -1){
            priorToFirstDPToExplain = true;
        }
        var frameOfLatestExplainedDP = framesByDP[this.highestDPCompleted];
        if (priorToFirstDPToExplain || ((frame > frameOfLatestExplainedDP) && enableForwardTimelineBlock)){
            // pauseGame();
            if (document.getElementById('customErrMsg') == undefined){
                if (priorToFirstDPToExplain){
                    showCustomErrorMsg("Cannot skip forward until an explanation has been unlocked.");
                }
                else {
                    showCustomErrorMsg("Cannot skip forward. Only steps prior to DP" + this.highestDPCompleted + " are unlocked.");
                }
            }
            setTimeout(function() {
                var errMsg = $('#customErrMsg')
                errMsg.fadeOut('400', function (){
                    var errMsg = $('#customErrMsg')
                    errMsg.innerHTML = '';
                    errMsg.remove();
                });
            }, 3500); // <-- time in milliseconds
            return true;
        }
        else {
            return false;
        }
    }
    return tcm;
}