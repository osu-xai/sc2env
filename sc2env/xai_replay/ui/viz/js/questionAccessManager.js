function getQuestionAccessManager(decisionPointSteps, maxStep) {
    var qam = {};

    qam.questionStep = undefined;
    qam.maxStep = maxStep;
    qam.activeRange = undefined;
    qam.questionState = undefined;
    qam.isPriorToLastDecisionPoint = undefined;
    qam.blockRenderState = undefined;
    qam.playButtonRenderState = undefined;

    qam.windowRangeForStep = getRanges(decisionPointSteps, maxStep);

    qam.isAtEndOfRange = function(step) {
        if (this.activeRange != undefined){
            var endOfRange = this.activeRange[1];
            // stop one prior to the true end to avoid showing the blank gameboard
            //if (step >= endOfRange) { 
            if (step >= endOfRange - 1) { 
                return true;
            }
        }
        return false;
    }
    
    qam.isBeyondCurrentRange = function(step) {
        if (this.activeRange != undefined){
            var endOfRange = this.activeRange[1];
            // stop one prior to the true end to avoid showing the blank gameboard
            //if (step >= endOfRange) { 
            if (step >endOfRange) { 
                return true;
            }
        }
        return false;
    }
    // qam.doneWaitingForPredictionClick = function() {
    //     this.sessionState = "doneWaitingForPredictionClick";
    // }

    qam.setQuestionState = function(state) {
        // posed, answered
        this.questionState = state;
        this.setBlockRenderState();
        this.setPlayButtonRenderState();
    }
    qam.setQuestionType= function(type) {
        // plain / waitForClick / waitForPredictionClick
        this.questionType = type;
        this.setBlockRenderState();
        this.setPlayButtonRenderState();
    }
    qam.setQuestionStep = function(step){
        this.questionStep = step;
        var rangePair = this.windowRangeForStep[step];
        this.activeRange = rangePair;
        this.setBlockRenderState();
        this.setPlayButtonRenderState();
    }
    qam.setRelationToFinalDecisionPoint = function(relation) {
        // before / finalDpRange / finalStep
        this.relationToFinalDecisionPoint = relation;
        this.setBlockRenderState();
        this.setPlayButtonRenderState();
    }
    qam.blockRenderStateMap = {};
    qam.blockRenderStateMap["plain.posed.before"] = "blockPastRange";
    qam.blockRenderStateMap["plain.posed.finalDpRange"] = "blockFinalStep";
    qam.blockRenderStateMap["plain.posed.finalStep"] = "noBlock";
    qam.blockRenderStateMap["plain.answered.before"] = "blockPastRange";
    qam.blockRenderStateMap["plain.answered.finalDpRange"] = "blockFinalStep";
    qam.blockRenderStateMap["plain.answered.finalStep"] = "noBlock";
    
    qam.blockRenderStateMap["waitForClick.posed.before"] = "blockPastRange";
    qam.blockRenderStateMap["waitForClick.posed.finalDpRange"] = "blockFinalStep";
    qam.blockRenderStateMap["waitForClick.posed.finalStep"] = "noBlock";
    qam.blockRenderStateMap["waitForClick.answered.before"] = "blockPastRange";
    qam.blockRenderStateMap["waitForClick.answered.finalDpRange"] = "blockFinalStep";
    qam.blockRenderStateMap["waitForClick.answered.finalStep"] = "noBlock";
    
    qam.blockRenderStateMap["waitForPredictionClick.posed.before"] = "blockPastStep";
    qam.blockRenderStateMap["waitForPredictionClick.posed.finalDpRange"] = "blockPastStep";
    qam.blockRenderStateMap["waitForPredictionClick.posed.finalStep"] = "noBlock";
    qam.blockRenderStateMap["waitForPredictionClick.answered.before"] = "blockPastRange";
    qam.blockRenderStateMap["waitForPredictionClick.answered.finalDpRange"] = "blockFinalStep";
    qam.blockRenderStateMap["waitForPredictionClick.answered.finalStep"] = "noBlock";

    qam.setBlockRenderState = function(){
        if (this.questionStep != undefined &&
            this.questionType != undefined && 
            this.relationToFinalDecisionPoint != undefined) {
                this.blockRenderState = this.getBlockRenderState();
            }
    }
    qam.getBlockRenderState = function() {
        // blockPastRange, blockPastStep, noBlock 
        var stateIndex = this.getBlockStateIndex();
        return this.blockRenderStateMap[stateIndex];
    }

    qam.getBlockStateIndex = function() {
        return this.questionType + "." + this.questionState + "." + this.relationToFinalDecisionPoint;
    }
    qam.getBlockRange = function() {
        var state = this.getBlockRenderState();
        if (state == "blockPastStep"){
            return [Number(this.questionStep) + 1, this.maxStep];
        }
        else if (state == "blockPastRange"){
            return [Number(this.activeRange[1]) + 1, this.maxStep];
        }
        else if (state == "blockFinalStep") {
            return [Number(this.maxStep - 1), this.maxStep];
        }
        else {
            // noBlock
            return ["NA", "NA"];
        }
    }

    qam.playButtonRenderMap = {};
    qam.playButtonRenderMap["plain.posed"]                     = "enabled";
    qam.playButtonRenderMap["plain.answered"]                  = "enabled";
    qam.playButtonRenderMap["waitForClick.posed"]              = "enabled";
    qam.playButtonRenderMap["waitForClick.answered"]           = "enabled";

    qam.playButtonRenderMap["waitForPredictionClick.posed"]    = "disabled";
    qam.playButtonRenderMap["waitForPredictionClick.answered"] = "enabled";


    qam.setPlayButtonRenderState = function() {
        if (this.questionStep != undefined &&
            this.questionType != undefined) {
            var stateIndex = this.getPlayButtonStateIndex();
            this.playButtonRenderState = this.playButtonRenderMap[stateIndex];
        }
    }

    qam.getPlayButtonStateIndex = function(){
        return this.questionType + "." + this.questionState;
    }
    qam.getPlayButtonState = function() {
        var stateIndex = this.getPlayButtonStateIndex();
        return this.playButtonRenderMap[stateIndex];
    }

    qam.express = function() {
        this.clearTimelineBlock();
        //blockPastRange, blockPastStep, noBlock 
        if (this.blockRenderState == "blockPastRange"){
            this.blockRange(this.getBlockRange());
        }
        else if (this.blockRenderState == "blockPastStep"){
            this.blockPastStep(this.getBlockRange());
        }
        else if (this.blockRenderState == "blockFinalStep") {
            this.blockFinalStep(this.getBlockRange());
        }
        else {
            this.clearTimelineBlock();
        }
        // adjust play button
        if (this.playButtonRenderState == "disabled"){
            controlsManager.disablePauseResume();
        }
        else {
            controlsManager.enablePauseResume();
        }
    }
    qam.clearTimelineBlock = function() { 
        $("#right-block-div").remove();
    }
    
    qam.blockRange = function(rangePair) {
        var widthOfTimeline = expl_ctrl_canvas.width - 2*timelineMargin;
        // get offset of explanation-control-panel relative to document
        var ecpOffset = $("#explanation-control-panel").offset();
       
        // calculate right window edge position
        var rightValueOnTimeline = Math.floor((Number(rangePair[0])/ this.maxStep ) * 100);
        var x3 = ecpOffset.left + timelineMargin + (rightValueOnTimeline / 100) * widthOfTimeline;
        // shift x3 to the left to fully cover the starting DecisionPoint of the blocked range
        x3 = x3 - explanationPointSmallDiamondHalfWidth;
        var x4 = expl_ctrl_canvas.width;
        
        var y = ecpOffset.top;
        var width2 = x4 - x3 + 3;
        var height = $("#explanation-control-panel").height();
        var gradientBars = "repeating-linear-gradient(135deg,rgba(100, 100, 100, 0.1),rgba(100, 100, 100, 0.3) 20px,rgba(100, 100, 100, 0.6) 20px,rgba(100, 100, 100, 0.7) 20px)";

        // make blocking div from leftXofRightBlock -> expl_ctrl_canvas.width
        var rightBlockDiv = document.createElement("DIV");
        rightBlockDiv.setAttribute("id", "right-block-div");
        rightBlockDiv.setAttribute("style", "position:absolute;left:" + x3 + "px;top:" + y + "px;z-index:" + zIndexMap["clickBlockerRectangle"] + ";background:" + gradientBars + ";width:" + width2 + "px;height:" + height + "px;");
        rightBlockDiv.onclick = function(e) {
            if (userStudyMode){
                var logLine = templateMap["right-block-div"];
                logLine = logLine.replace("<TIME_LINE_BLCKR>", "NA");
                targetClickHandler(e, logLine);
                regionClickHandlerGameArea(e);
                userActionMonitor.globalClick(e.clientX, e.clientY);
            }
        }
        $("body").append(rightBlockDiv);
    }

    qam.blockPastStep = function(rangePair) {
        
        // calculate left window edge position
        var x2 = getXOriginOfDecisionPointAtStep(Number(rangePair[0]));
        // shift x2 to the left to fully expose the current DecisionPoint;
        var currentIndex = sessionIndexManager.getCurrentIndex();
        if (currentIndex + 1 == rangePair[0]) {
            x2 = x2 + explanationPointBigDiamondHalfWidth - 3;
        }
        else {
            x2 = x2 + explanationPointSmallDiamondHalfWidth - 3;
        }
        // shift x3 to the left to fully cover the next DecisionPoint
        var x4 = expl_ctrl_canvas.width;
        
        // get offset of explanation-control-panel relative to document
        var ecpOffset = $("#explanation-control-panel").offset();
        var y = ecpOffset.top;
        var width2 = x4 - x2 + 3;
        var height = $("#explanation-control-panel").height();
        // make blocking div from 0 -> rightXofLeftBlock
        var gradientBars = "repeating-linear-gradient(135deg,rgba(100, 100, 100, 0.1),rgba(100, 100, 100, 0.3) 20px,rgba(100, 100, 100, 0.6) 20px,rgba(100, 100, 100, 0.7) 20px)";
      
        // make blocking div from leftXofRightBlock -> expl_ctrl_canvas.width
        var rightBlockDiv = document.createElement("DIV");
        rightBlockDiv.setAttribute("id", "right-block-div");
        rightBlockDiv.setAttribute("style", "position:absolute;left:" + x2 + "px;top:" + y + "px;z-index:" + zIndexMap["clickBlockerRectangle"] 
                                          + ";background:" + gradientBars + ";width:" + width2 + "px;height:" + height + "px;");
        rightBlockDiv.onclick = function(e) {
            if (userStudyMode){
                var logLine = templateMap["right-block-div"];
                logLine = logLine.replace("<TIME_LINE_BLCKR>", "NA");
                targetClickHandler(e, logLine);
                regionClickHandlerGameArea(e);
                userActionMonitor.globalClick(e.clientX, e.clientY);
            }
        }
        $("body").append(rightBlockDiv);
    }
    qam.blockFinalStep = function(rangePair) {
        // calculate left window edge position
        var x2 = getXOriginOfDecisionPointAtStep(Number(rangePair[0]));

        var x4 = expl_ctrl_canvas.width;
        
        // get offset of explanation-control-panel relative to document
        var ecpOffset = $("#explanation-control-panel").offset();
        var y = ecpOffset.top;
        var width2 = x4 - x2;
        var height = $("#explanation-control-panel").height();
        // make blocking div from 0 -> rightXofLeftBlock
        var gradientBars = "repeating-linear-gradient(135deg,rgba(100, 100, 100, 0.1),rgba(100, 100, 100, 0.3) 20px,rgba(100, 100, 100, 0.6) 20px,rgba(100, 100, 100, 0.7) 20px)";
      
        // make blocking div from leftXofRightBlock -> expl_ctrl_canvas.width
        var rightBlockDiv = document.createElement("DIV");
        rightBlockDiv.setAttribute("id", "right-block-div");
        rightBlockDiv.setAttribute("style", "position:absolute;left:" + x2 + "px;top:" + y + "px;z-index:" + zIndexMap["clickBlockerRectangle"] 
                                          + ";background:" + gradientBars + ";width:" + width2 + "px;height:" + height + "px;");
        rightBlockDiv.onclick = function(e) {
            if (userStudyMode){
                var logLine = templateMap["right-block-div"];
                logLine = logLine.replace("<TIME_LINE_BLCKR>", "NA");
                targetClickHandler(e, logLine);
                regionClickHandlerGameArea(e);
                userActionMonitor.globalClick(e.clientX, e.clientY);
            }
        }
        $("body").append(rightBlockDiv);
    }

    return qam;
}

function getRanges(decisionPointSteps, maxIndex) {
    var stepRangePairs = {};
    for (var i = 0; i < decisionPointSteps.length; i++) {
        if (i == decisionPointSteps.length - 1) {
            // looking at the final entry - pair this one with the max index
            var range_pair = [ Number(decisionPointSteps[i]), Number(maxIndex) ];
            stepRangePairs[decisionPointSteps[i]] = range_pair;
        }
        else {
            // prior to last one, we make a pair with the step prior to the next question's step
            var range_pair = [ Number(decisionPointSteps[i]), Number(decisionPointSteps[i+1]) - 1 ];
            stepRangePairs[decisionPointSteps[i]] = range_pair;
        }
    }
    stepRangePairs["summary"] = ["NA", "NA"];
    console.log(stepRangePairs)
    return stepRangePairs;
}