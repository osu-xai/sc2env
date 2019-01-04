
var decisionPointIds = {};
var winningActionForStep = {};
function renderDecisionPointLegend() {
	$("#action-list").empty();
    decisionPointIds = {};
    winningActionForStep = {};
	var legendLabel = document.createElement("LABEL");
	legendLabel.setAttribute("id", "legend-label");
	legendLabel.setAttribute("style", getGridPositionStyle(0,0) + 'margin-left:10px;margin-bottom:0px;margin-top:6px;font-family:Arial;font-size:14px;');
	legendLabel.innerHTML = "Decision Points: ";
	$("#action-list").append(legendLabel);

	var explanation_steps = replaySessionConfig.getExplanationStepsList();
    var explanation_titles = replaySessionConfig.getExplanationTitlesList();
    if (userStudyMode) {
       explanation_titles = activeStudyQuestionManager.getExplanationTitles(explanation_steps, explanation_titles);
    }
	var expl_count = explanation_steps.length;
	var index = 0;
	while (index < expl_count){
		var title = explanation_titles[index];
		var uiIndex =index + 1;
        var step = explanation_steps[index];
        winningActionForStep[step] = title;
		addLabelForAction(title, uiIndex, step);
		index = index + 1;
	}
}


function unboldThisStepInLegend(step){
	var decisionPointId = decisionPointIds[step];
	if (decisionPointId != undefined) {
		$("#" + decisionPointId).css("font-weight","normal");
	}
}

function boldThisStepInLegend(step){
	var decisionPointId = decisionPointIds[step];
	if (decisionPointId != undefined) {
		$("#" + decisionPointId).css("font-weight","bold");
	}
}

function addLabelForAction(title, index, step){
    var fullName = 'D' + index + ': ' + title;
	var actionLabel = document.createElement("div");
	var id = getDecisionPointIdForName(title, step);
	decisionPointIds[step] = id;

	actionLabel.setAttribute("id", id);

	actionLabel.addEventListener("click", function(evt) {
		if (!isUserInputBlocked()){
            if (userStudyMode){
                if (activeStudyQuestionManager.accessManager.isBeyondCurrentRange(step)){
					var logLine = templateMap["clickActionLabelDenied"];
					logLine = logLine.replace("<CLCK_ACT_D>", escapeAnswerFileDelimetersFromTextString(fullName));
					targetClickHandler(evt, logLine);
                    return;
                }
                else {
					var logLine = templateMap["clickActionLabel"];
					logLine = logLine.replace("<CLCK_ACT>", escapeAnswerFileDelimetersFromTextString(fullName));
					targetClickHandler(evt, logLine);
                }
            }
            jumpToStep(step);
		}
	});
	actionLabel.addEventListener("mouseenter", function(evt) {
        //$("#" + id).css("background-color","rgba(100,100,100,1.0);");
        if (userStudyMode){
            if (activeStudyQuestionManager.accessManager.isBeyondCurrentRange(step)){
                return;
            }
        }
		$("#" + id).css("background-color","#EEDDCC");
	});
	actionLabel.addEventListener("mouseleave", function(evt) {
		//$("#" + id).css("background-color","rgba(100,100,100,0.0)");
		$("#" + id).css("background-color","transparent");
	});

	var row = Math.floor((index - 1) / 2);
	var col = 1 + (index - 1) % 2;
	actionLabel.setAttribute("style", getGridPositionStyle(col, row) + 'padding:0px;margin-left:4px;margin-bottom:2px;margin-top:2px;margin-right:4px;font-family:Arial;font-size:14px;');
	
	actionLabel.innerHTML = fullName;
	$("#action-list").append(actionLabel);
}


function getDecisionPointIdForName(name, step){
	var nameForId = convertNameToLegalId(name);
	nameForId = "actionLabel-step-" +step + "-action-" + nameForId;
	return nameForId;
}

function convertNameToLegalId(name) {
	name = name.replace(/ /g,"");
	name = name.replace(/\./g,"");
	name = name.replace(/,/g,"");
	name = name.replace(/\(/g,"");
	name = name.replace(/\//g,"");
	var nameForId = name.replace(/\)/g,"");
	return nameForId;
}

