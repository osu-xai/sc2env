function getExplanationAccessManagerStudy(pauseAndExplainDPs){
    var eam = {};

    eam.dps = [];
    // clone the list
    for (var i in pauseAndExplainDPs){
        var dp = pauseAndExplainDPs[i];
        eam.dps.push(dp);
    }
    eam.showUnlockControls = false;
    eam.showExplButtonEnabled = false;

    eam.highestDPUnlocked = -1;
    eam.currentDP = undefined;
    eam.highestDPCompleted = -1;
    eam.arriveAtDP = function(dp){
        this.currentDP = dp;
        //this.highestDPPaused = dp;
        if (this.dps.includes(dp)){
            if (dp > this.highestDPUnlocked){
                // at interestingDp and dp > highestUnlocked
                this.showUnlockControls = true;
                this.showExplButtonEnabled = false;
            }
            else {
                // at interestingDp and that dp <= highestUnlocked
                this.showUnlockControls = false;
                this.showExplButtonEnabled = true;
            }
        }
        else {
            if (this.highestDPCompleted == -1){
                // shouldn't show any explanations yet
                this.showUnlockControls = false;
                this.showExplButtonEnabled = false;
            }
            else if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestUnlocked
                this.showUnlockControls = false;
                this.showExplButtonEnabled = true;
            }
            else {
                // not at interestingDP and > highestDPCompleted
                this.showUnlockControls = false;
                this.showExplButtonEnabled = false;
            }
        }
    }

    eam.pauseAtDP = function(dp){
        this.arriveAtDP(dp);
    }

    eam.hopToDP = function(dp){
        this.arriveAtDP(dp);
    }

    eam.arriveAfterDP = function(dp){
        this.currentDP = undefined;
        if (this.dps.includes(dp)){
            if (dp >= this.highestDPUnlocked){
                // at interestingDp and dp > highestUnlocked
                this.showUnlockControls = false;
                this.showExplButtonEnabled = false;
            }
            else {
                // at interestingDp and that dp <= highestUnlocked
                this.showUnlockControls = false;
                this.showExplButtonEnabled = true;
            }
        }
        else {
            if (this.highestDPCompleted == -1){
                // shouldn't show any explanations yet
                this.showUnlockControls = false;
                this.showExplButtonEnabled = false;
            }
            else if (dp <= this.highestDPCompleted){
                // not at interestingDP and <= highestUnlocked
                this.showUnlockControls = false;
                this.showExplButtonEnabled = true;
            }
            else {
                // not at interestingDP and > highestDPCompleted
                this.showUnlockControls = false;
                this.showExplButtonEnabled = false;
            }
        }
    }

    eam.pauseAfterDP = function(dp){
        this.arriveAfterDP(dp);
    }

    eam.hopToAfterDP = function(dp){
        this.arriveAfterDP(dp);
    }

    eam.unlocked = function(dp){
        this.highestDPUnlocked = dp;
        this.showUnlockControls = false;
        this.showExplButtonEnabled = true;
    }
   
    eam.resume = function(){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = false;
        if (this.currentDP != undefined){
            if (this.dps.includes(this.currentDP)){
                this.highestDPCompleted = this.currentDP;
                this.currentDP = undefined;
            }
        }
    }

    return eam;
}