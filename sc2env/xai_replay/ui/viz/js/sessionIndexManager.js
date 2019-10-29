
// ToDo - when strat jump- turn off incrementing index until receive set position.  Unblock incrementing on jump complete
// then it will be apparent if we need to correct for ReplaySequencer's index pointing to next-packet-to-send rather than 
// current packet in hand
function getSessionIndexManager(stepSizeAsKnownInReplaySequencer, decisionPointSteps, progressWidth) {
	var sim = {};
	sim.replaySequencerIndex  = 0;
	sim.replaySequencerMaxIndex = stepSizeAsKnownInReplaySequencer - 1;
    sim.progressWidth = progressWidth;
    sim.decisionPointSteps = decisionPointSteps;
    
    sim.isAtDecisionPoint = function() {
        return this.decisionPointSteps.includes(this.getCurrentIndex());
    }
    sim.getDPThatStartsEpochForStep = function(step) {
        if (Number(step) > Number(this.replaySequencerMaxIndex)){
            return "NA";
        }
        var result = "DP1";
        for (var i in this.decisionPointSteps){
            var dpStep = this.decisionPointSteps[i];
            if (Number(dpStep) <= Number(step)) {
                var indexPlusOne = Number(i) + Number(1);
                result = "DP" + indexPlusOne; 
            }
            else {
                return result;
            } 
        }
        return result;
    }

    sim.getStepThatStartsEpochForStep = function(step){
        if (Number(step) > Number(this.replaySequencerMaxIndex)){
            alert("step number higher than max!  Returning step 1");
            return 1;
        }
        for (var i in this.decisionPointSteps){
            var dpStep = this.decisionPointSteps[i];
            if (Number(dpStep) <= Number(step)) {
                return dpStep;
            }
        }
        alert("step number less than 1!  Returning step 1");
        return 1;
    }
	// progress bar is divided up in stepSizeAsKnownInReplaySequencer - 1 pieces
	// because the first chunk of that we want to correspond to ReplaySequencer.scaii_pkts[1]
	// since ReplaySequencer.scaii_pkts[0] corresponds to the initial state (prior to first "step")
	var progressBarSegmentCount = stepSizeAsKnownInReplaySequencer - 1;
	sim.progressBarSegmentCount = progressBarSegmentCount
	sim.getStepCountToDisplay = function(){
		return this.replaySequencerIndex;
	}
	
	sim.isAtGameStart = function() {
		return (this.replaySequencerIndex == 0);
	}
	
	sim.isAtTimelineStepOne = function() {
		return (this.replaySequenceIndex == 1);
	}
	sim.getReplaySequencerIndexForClick = function(xIndexOfClick){
		var percent = xIndexOfClick/this.progressWidth;
		// example, click 65% -> 6.5 -> 6  -> add one for UI render -> 7  so clicking on segment 7 of 10
		var replaySequenceTargetStep = Math.floor(this.progressBarSegmentCount * percent) + 1;
		if (replaySequenceTargetStep > this.replaySequencerMaxIndex) {
			replaySequenceTargetStep = this.replaySequencerMaxIndex;
		}
		//console.log('calculated replaySequenceTargetStep as ' + replaySequenceTargetStep);
		return replaySequenceTargetStep;
	}
	
	sim.setReplaySequencerIndex = function(index) {
        var currentDP = sessionIndexManager.getDPThatStartsEpochForStep(this.replaySequencerIndex);
        var nextDP = sessionIndexManager.getDPThatStartsEpochForStep(index);
        if (currentDP != nextDP){
            epochIsChanging();
        }
		//$("#why-button").remove();
		this.replaySequencerIndex = index;
        // console.log('sessionIndex ' + index);

        //SC2_TODO_SALif (this.decisionPointSteps.includes(index)){
        //SC2_TODO_SAL    currentExplManager.captureEntitiesForDecisionPoint(index);
        //SC2_TODO_SAL}
        //console.log('replaySequencerIndex is now ' + index);
		// var displayVal = this.getStepCountToDisplay();
		var displayVal = decisionPointsFullCopy.length - laterDPFrames.length;

        //console.log('display Step value : ' + displayVal);
		if (displayVal == undefined){
			$("#step-value").html('');
		}
		else {
			// $("#step-value").html('step ' + displayVal + ' / ' + this.progressBarSegmentCount);
			$("#step-value").html('DP ' + displayVal + ' / ' + decisionPointsFullCopy.length);

		}
		paintProgress(this.getProgressBarValue());
	}
	
	sim.getProgressBarValue = function() {
		var value = ((this.replaySequencerIndex / this.replaySequencerMaxIndex ) * 100);
		//console.log('progress value to paint: ' + value);
		return value;
	}
	
	sim.getPercentIntoGameForStep = function(step){
		var value = (step / this.replaySequencerMaxIndex ) * 100;
		return value;
	}
	sim.getCurrentIndex = function() {
		return this.replaySequencerIndex;
    }
    
	sim.getMaxIndex = function() {
		return this.replaySequencerMaxIndex;
	}

	// sim.incrementReplaySequencerIndex = function() {
	// 	if (Number(Number(this.replaySequencerIndex) + Number(1)) <= this.replaySequencerMaxIndex) {
	// 		this.setReplaySequencerIndex(this.replaySequencerIndex + 1);
	// 	}
	// }
	sim.isAtEndOfGame = function(){
		if (this.replaySequencerIndex == this.replaySequencerMaxIndex) {
			return true;
		} 
		return false;
	}
	return sim;
}
