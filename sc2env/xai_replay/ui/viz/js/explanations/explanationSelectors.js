
var explanationPointBigDiamondHalfWidth = 22;
var explanationPointSmallDiamondHalfWidth = 16;
var explanationBoxMap = {};
var showingDecisionNumber;

function renderExplanationSelectors() {
	var explanation_steps = replaySessionConfig.getExplanationStepsList();
	var expl_count = explanation_steps.length;
	var index = 0;
	explanationBoxMap = {};
	while (index < expl_count){
		var step = explanation_steps[index];
		var decisionPointNumber =index + 1;
		configureExplanationSelectorDiamond(decisionPointNumber, step);
		index = index + 1;
	}
}

function configureExplanationSelectorDiamond(decisionPointNumber,step){
	var x = getXOriginOfDecisionPointAtStep(step);
	var y = explanationControlYPosition;
	var halfWidth;
	var halfHeight;
	
	var currentStep = sessionIndexManager.getCurrentIndex();
	var ctx = expl_ctrl_ctx;
	if (currentStep == step) {
		showingDecisionNumber = decisionPointNumber;
        $("#winning-action-label").html("Chosen move at D" + decisionPointNumber + ": " + winningActionForStep[step]);
		ctx.font = "16px Arial bold";
		halfWidth = explanationPointBigDiamondHalfWidth;
        halfHeight = explanationPointBigDiamondHalfWidth;
        

        var rectForExplanationControlPanel = document.getElementById("explanation-control-panel").getBoundingClientRect();
        var absoluteXExpCtrlPanel = rectForExplanationControlPanel.left;
        var absoluteYExpCtrlPanel = rectForExplanationControlPanel.top;

        var yPositionOfWhyButton = absoluteYExpCtrlPanel + 60;// relative to the next container below
        if(navigator.userAgent.indexOf("Firefox") != -1 ) {
            var xPositionOfWhyButton = absoluteXExpCtrlPanel + x - 37;
        } 
        else {
            var xPositionOfWhyButton = absoluteXExpCtrlPanel + x - 26;
        }     
        
        // why button rendering handled outside of chartV2 as chartV2 is created later upon explDetails arriving
        if (userStudyMode){
            setExplanationInfoForDPAtStep(step);
        }
        else {
            setExplanationInfoForDPAtStep(step);
            renderWhyButton(step, xPositionOfWhyButton, yPositionOfWhyButton);
        }
		
        boldThisStepInLegend(step);
        if (userStudyMode){
            userActionMonitor.stepToDecisionPoint(step);
            stateMonitor.setDecisionPoint(step);
		}
        selectedDecisionStep = step;
	}
	else {
		ctx.font = "12px Arial bold";
		halfWidth = explanationPointSmallDiamondHalfWidth;
		halfHeight = explanationPointSmallDiamondHalfWidth;
		unboldThisStepInLegend(step);
	}
	
	ctx.beginPath();
	
	ctx.fillStyle = 'black';
	
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 2;
	var leftVertexX = x - halfWidth;;
	var leftVertexY = explanationControlYPosition;
	var rightVertexX = x + halfWidth;
	var rightVertexY = explanationControlYPosition;
	var topVertexX = x ;
	var topVertexY = explanationControlYPosition - halfHeight;
	var bottomVertexX = x;
	var bottomVertexY = explanationControlYPosition + halfHeight;
	
	ctx.moveTo(leftVertexX, leftVertexY);
	ctx.lineTo(topVertexX,topVertexY);
	ctx.lineTo(rightVertexX, rightVertexY);
	ctx.lineTo(bottomVertexX, bottomVertexY);
	ctx.lineTo(leftVertexX, leftVertexY);
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = 'white';
	if (currentStep == step) {
		var textCenterX = ((rightVertexX - leftVertexX) / 2) + leftVertexX - 10;
	}
	else {
		var textCenterX = ((rightVertexX - leftVertexX) / 2) + leftVertexX - 7;
	}
	ctx.font = "Arial";
	var textCenterY = explanationControlYPosition + 5;
	ctx.fillText('D' + decisionPointNumber,textCenterX,textCenterY);

	//ctx.rect(upper_left_x, upper_left_y, rect_width, rect_height);
	var eBox = getExplanationBox(leftVertexX, rightVertexX, topVertexY, bottomVertexY, step);
    explanationBoxMap[step] = eBox;
}

function setExplanationInfoForDPAtStep(step) {
    // this is really "leaving epoch by other than jump"
    currentExplManager.applyFunctionToEachCachedDataset(detachChannelItem,"overlayCanvas");
    if (currentExplManager.hasExplDataForStep(step)){
        currentExplManager.switchToExplanationsForThisDecisionPoint(step);
    }
    else {
        askBackendForExplanationRewardInfo(step);
    }
}

function getExplanationBox(left_x,right_x, upper_y, lower_y, step){
	eBox = {};
	eBox.left_x = left_x;
	eBox.right_x = right_x;
	eBox.upper_y = upper_y;
	eBox.lower_y = lower_y;
	eBox.step = step;
	return eBox;
}



var getMatchingExplanationStep = function(ctx, x, y){
	var matchingStep = undefined;
	for (key in explanationBoxMap) {
		var eBox = explanationBoxMap[key];
		if (x > eBox.left_x && x < eBox.right_x) {
			matchingStep = eBox.step;
		}
	}
	return matchingStep;
}


function getXOriginOfDecisionPointAtStep(step){
	var widthOfTimeline = expl_ctrl_canvas.width - 2*timelineMargin;
	var value = sessionIndexManager.getPercentIntoGameForStep(step);
    var x = timelineMargin + (value / 100) * widthOfTimeline;
    return x;
}
