function getExplanationAccessManagerDev(pauseAndExplainDPs){
    var eam = {};

    eam.showUnlockControls = false;
    eam.showExplButtonEnabled = false;


    eam.pauseAtDP = function(dp){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = true;
    }

    eam.hopToDP = function(dp){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = true;
    }

    eam.pauseAfterDP = function(dp){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = true;
    }

    eam.hopToAfterDP = function(dp){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = true;    
    }

    eam.unlocked = function(dp){
        // NA
    }
   
    eam.resume = function(){
        this.showUnlockControls = false;
        this.showExplButtonEnabled = false;
    }

    return eam;
}