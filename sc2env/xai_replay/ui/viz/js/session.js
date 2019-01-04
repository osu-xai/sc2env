var testingMode = false;
var replaySessionConfig;
var replayChoiceConfig;
var selectedExplanationStep = undefined;
var sessionIndexManager = undefined;
var activeStudyQuestionManager = undefined;
var stateMonitor = undefined;
var userActionMonitor = undefined;

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
		if (this.replaySequencerIndex == 0) {
			return undefined;
		}
		else {
			// from one on up, the actual replaySequencerIndex will be what we want to display 
			// as we are presenting the step sequence as starting at 1.
			return this.replaySequencerIndex;
		}
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
        //console.log('');

        if (this.decisionPointSteps.includes(index)){
            currentExplManager.captureEntitiesForDecisionPoint(index);
        }
        //console.log('replaySequencerIndex is now ' + index);
        var displayVal = this.getStepCountToDisplay();
        //console.log('display Step value : ' + displayVal);
		if (displayVal == undefined){
			$("#step-value").html('');
		}
		else {
			$("#step-value").html('step ' + displayVal + ' / ' + this.progressBarSegmentCount);
		}
		paintProgress(this.getProgressBarValue());
	}
	
	sim.getProgressBarValue = function() {
		var value = Math.floor((this.replaySequencerIndex / this.replaySequencerMaxIndex ) * 100);
		//console.log('progress value to paint: ' + value);
		return value;
	}
	
	sim.getPercentIntoGameForStep = function(step){
		var value = Math.floor((step / this.replaySequencerMaxIndex ) * 100);
		return value;
	}
	sim.getCurrentIndex = function() {
		return this.replaySequencerIndex;
    }
    
	sim.getMaxIndex = function() {
		return this.replaySequencerMaxIndex;
	}

	sim.incrementReplaySequencerIndex = function() {
		if (Number(Number(this.replaySequencerIndex) + Number(1)) <= this.replaySequencerMaxIndex) {
			this.setReplaySequencerIndex(this.replaySequencerIndex + 1);
		}
	}
	sim.isAtEndOfGame = function(){
		if (this.replaySequencerIndex == this.replaySequencerMaxIndex) {
			return true;
		} 
		return false;
	}
	return sim;
}

var treatmentID = undefined;

// Since studyMode is controlled at front end, backend is unaware which mode and will always send 
// questions if it finds them.  So, we need to check userStudyMode here.
function handleStudyQuestions(studyQuestions){
    if (!userStudyMode) {
        return;
    }
    var questions = studyQuestions.getStudyQuestionsList();
    var userId = studyQuestions.getUserId();
    treatmentID = studyQuestions.getTreatmentId();
    currentExplManager.setUserStudyMode(true);
    currentExplManager.setUserStudyTreatment("T" + treatmentID);
    //var answerFilename = studyQuestions.getAnswerFilename();
    var answerFilename = "answers_" + userId + "_" + treatmentID + ".txt";
    if (questions.length == 0) {
        return;
    }
    if (tabManager.currentTabHasQuestionManager()){
        activeStudyQuestionManager = tabManager.getStudyQuestionManagerForCurrentTab();
    }
    else {
        activeStudyQuestionManager = getStudyQuestionManager(questions, userId, treatmentID);
        tabManager.setStudyQuestionManagerForCurrentTab(activeStudyQuestionManager);
    }

    if (userActionMonitor == undefined) {  userActionMonitor = getUserActionMonitor(); }
    if (stateMonitor == undefined)      {  stateMonitor =      getStateMonitor();      }
	
	console.log(treatmentID);
    console.log(answerFilename);
    stateMonitor.currentReplayFileName = chosenFile;
    stateMonitor.logFileName = answerFilename;
    // make div to hold the winning action name
    var winningActionLabel = document.createElement("div");
	winningActionLabel.setAttribute("style", "margin-top:8px;margin-left:30px;font-family:Arial;font-weight:bold;font-size:14px;");
	winningActionLabel.setAttribute("id", "winning-action-label");
    winningActionLabel.innerHTML = "";
    $("#reward-values-panel").append(winningActionLabel);
    // re-render this sowe can change names to ??? if need to for waitForPredictionClick questions
    renderDecisionPointLegend();
}
function handleReplayControl(replayControl) {
	var command = replayControl.getCommandList();
	if (command.length == 2) {
		if (command[0] == 'set_step_position') {
			//console.log('___set_step_position updating step from handleReplayControl to ' + command[1] + ' which should be one prior to what the first viz packet arriving will set it to');
			sessionIndexManager.setReplaySequencerIndex(parseInt(command[1]));
            updateButtonsAfterJump();
            if (userStudyMode){
                activeStudyQuestionManager.accessManager.express();
            }
		}
	}
}

function promoteTutorialFileIfPresent(replayNames) {
    var setAside = undefined;
    var result = [];
    for (var i in replayNames) {
        var name = replayNames[i];
        if (name.startsWith("tutorial")) {
            setAside = name;
        }
        else {
            result.push(name);
        }
    }
    if (setAside != undefined) {
        result.unshift(setAside);
    }
    return result;
}

var userStudyMode = false;
var rewardDivMap = {};
function handleReplayChoiceConfig(config){
    var replayNames = config.getReplayFilenamesList();
     // studyQuestionMode not yet set to check, just always check - unlikely to be a problem
    // make tutorial file the default
    replayNames = promoteTutorialFileIfPresent(replayNames);
	for (var i in replayNames) {
        var name = replayNames[i];
		$("#replay-file-selector").append($('<option>', {
			value: i,
			text: name
		}));
    }
    userStudyMode = config.getUserStudyMode();
    if (userStudyMode) {
        removeFileSelectorEtc();
        tabManager = getTabManager();
        tabManager.openFirstTab();
    }
    else {
        loadSelectedReplayFile();
    }
}

function isTutorial() {
    return chosenFile.startsWith("tutorial");
}
var chosenFile;

function loadSelectedReplayFile() {
    var filename = $( "#replay-file-selector option:selected" ).text();
    loadReplayFile(filename);
}

function loadReplayFile(filename) {
    $("#cue-arrow-div").remove();
    if (userActionMonitor != undefined) {
        userActionMonitor.clickListener = undefined;
    }
    clearStudyQuestionMode();
	controlsManager.startLoadReplayFile();
	chosenFile = filename;
	//console.log("    file selected: " + chosenFile);
	var args = [chosenFile];
	var userCommand = new proto.scaii.common.UserCommand;
	userCommand.setCommandType(proto.scaii.common.UserCommand.UserCommandType.SELECT_FILE);
	userCommand.setArgsList(args);
    stageUserCommand(userCommand);
    clearUIElementsForNewFile();
	drawExplanationTimeline();
	clearGameBoards();
    cleanExplanationUI();
    currentExplManager = getExplanationsV2Manager();
    currentExplManager.setFilename(filename);
    currentExplManager.setUserStudyMode(false);
    // start fresh with entities
    cleanEntities();
}

function clearUIElementsForNewFile(){
    $("#action-list").empty();
    $("#why-button").remove();
    $("#explanation-control-panel").empty();

    $("#cumulative-rewards").empty();
    rewardsDivMap = {};
}
function handleReplaySessionConfig(rsc, selectedStep) {
	if (!rsc.hasStepCount()) {
		dialog('Error no stepCount carried by ReplaySessionConfig');
    }
    if (rsc.getSuppressInteractivity()) {
        liveModeInputBlocked = true;
    }
	var timelineWidth = expl_ctrl_canvas.width - 2*timelineMargin;
	sessionIndexManager = getSessionIndexManager(rsc.getStepCount(), rsc.getExplanationStepsList(), timelineWidth);
    sessionIndexManager.setReplaySequencerIndex(0);
    currentExplManager.stepsWithExplanations = replaySessionConfig.getExplanationStepsList();
}


function handleVizInit(vizInit) {
	$("#connectButton").remove();
	if (vizInit.hasTestMode()) {
		if (vizInit.getTestMode()) {
			testingMode = true;
		}
    }
	// ignoring gameboard width and height, assume 40 x 40
}

function handleViz(vizData) {
	entitiesList = vizData.getEntitiesList();
	cumulativeRewardsMap = vizData.getCumulativeRewardsMap();
	handleCumulativeRewards(cumulativeRewardsMap);
    handleEntities(entitiesList);
    var qm = activeStudyQuestionManager;
	if (!jumpInProgress) {
        sessionIndexManager.incrementReplaySequencerIndex();
        if (userStudyMode) {
            // will ask for first DP
            qm.configureForCurrentStep();
        }
    }
    if (userStudyMode) {
        if (tabManager.hasShownUserId()){
        }
        if (qm.accessManager.isAtEndOfRange(sessionIndexManager.getCurrentIndex())){
            if (qm.allQuestionsAtDecisionPointAnswered) {
                qm.allQuestionsAtDecisionPointAnswered = false;
                // we're ready to move forward to next Decision Point
                if (qm.hasMoreQuestions()){
                    //will ask for later DPs
                    qm.poseNextQuestion();
                }
                controlsManager.expressResumeButton();
                //chooseNextQuestionAfterStep(sessionIndexManager.getCurrentIndex());
            }
            else {
                pauseGame();
		        controlsManager.disablePauseResume();
            }
        }
        currentExplManager.setWhyButtonAccessibility();
    }
    
	if (sessionIndexManager.isAtEndOfGame()) {
		controlsManager.reachedEndOfGame();
	}
}
var totalsString = "total score";
function handleCumulativeRewards(crm) {
	var entryList = crm.getEntryList();
	var total = 0;
	//compute totals
	for (var i in entryList ){
    	var entry = entryList[i];
		var val = entry[1];
		total = Number(total) + Number(val);
	}
	var valId = getRewardValueId(totalsString);
    var idOfExistingTotalLabel = rewardsDivMap[valId];
	if (idOfExistingTotalLabel == undefined) {
		addCumRewardPair(0, totalsString, total);
	}
	else {
		$("#" + valId).html(total);
	}  
    // add individual values
    if (userStudyMode) {
        return;
    }
  	for (var i in entryList ){
    	var entry = entryList[i];
    	var key = entry[0];
		var val = entry[1];
		var valId = getRewardValueId(key);
		var idOfExistingValueLabel = rewardsDivMap[valId];
		if (idOfExistingValueLabel == undefined) {
			var indexInt = Number(i+1);
			addCumRewardPair(indexInt, key, val);
		}
		else {
			$("#" + valId).html(val);
		}
  	}
}

function getRewardValueId(val) {
	var legalIdVal = convertNameToLegalId(val);
	return 'reward'+legalIdVal;
}

function addCumRewardPair(index, key, val){
	var rewardKeyDiv = document.createElement("DIV");
	rewardKeyDiv.setAttribute("class", "r" + index +"c0");
	if (key == totalsString){
		rewardKeyDiv.setAttribute("style", "height:15px;font-family:Arial;font-size:14px;font-weight:bold;");
	}
	else {
		rewardKeyDiv.setAttribute("style", "height:15px;font-family:Arial;font-size:14px;");
	}
	
	rewardKeyDiv.innerHTML = key;
	var logLineLabel = templateMap["touchCumRewardLabel"];
	logLineLabel = logLineLabel.replace("<CUM_LBL>", key);
    rewardKeyDiv.onclick = function(e) {targetClickHandler(e, logLineLabel);};
	$("#cumulative-rewards").append(rewardKeyDiv);

	var rewardValDiv = document.createElement("DIV");
	// give the value div an id constructed with key so can find it later to update
	var id = getRewardValueId(key);
	rewardsDivMap[id] = rewardValDiv;
	rewardValDiv.setAttribute("id", id);
	rewardValDiv.setAttribute("class", "r" + index +"c1");
	if (key == totalsString){
		rewardValDiv.setAttribute("style", "margin-left: 20px;height:15px;font-family:Arial;font-size:14px;font-weight:bold");
	}
	else {
		rewardValDiv.setAttribute("style", "margin-left: 20px;height:15px;font-family:Arial;font-size:14px;");
	}
	
	rewardValDiv.innerHTML = val;
	var logLineValue = templateMap["touchCumRewardValueFor"];
	logLineValue = logLineValue.replace("<CUM_VAL>", key);
    rewardValDiv.onclick = function(e) {targetClickHandler(e, logLineValue);};
    $("#cumulative-rewards").append(rewardValDiv);
}
//
//  INITIAL ORDER OF ARRIVAL OF PACKETS
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. ReplaySessionConfig
//  3. StudyQuestions (optional)
//  4. VizInit
//  5. Viz
//  6. SelectFileComplete
//
//  Game start  (userStudyMode)
//  7. VizInit
//  8. Viz
//  9. Viz
//  10. JumpCompleted
//
function handleScaiiPacket(sPacket) {
	var result = undefined;
	if (sPacket.hasReplayChoiceConfig()) {
		var config = sPacket.getReplayChoiceConfig();
		replayChoiceConfig = config;
		handleReplayChoiceConfig(config);
	}
	else if (sPacket.hasReplaySessionConfig()) {
		//console.log("-----got replaySessionConfig");
		var config = sPacket.getReplaySessionConfig();
		replaySessionConfig = config;
		//var selectedStep = undefined;
		handleReplaySessionConfig(config,undefined);
	}
	else if (sPacket.hasVizInit()) {
		//console.log("-----got vizInit");
		var vizInit = sPacket.getVizInit();
		handleVizInit(vizInit);
		controlsManager.gameStarted();
	}
	else if (sPacket.hasViz()) {
		//console.log("-----got Viz");
		var viz = sPacket.getViz();
		handleViz(viz);
		// we're moving forward so rewind should be enabled
		controlsManager.gameSteppingForward();
		if (testingMode) {
			result = buildReturnMultiMessageFromState(masterEntities);
		}
		else {
			result = new proto.scaii.common.MultiMessage;
		}
	}
	else if (sPacket.hasExplDetails()) {
		//console.log('has expl details');
		var explDetails = sPacket.getExplDetails();
        handleExplanationDetails(explDetails);
	}
	else if (sPacket.hasReplayControl()) {
		//console.log("-----got replayCOntrol");
		var replayControl = sPacket.getReplayControl();
		handleReplayControl(replayControl);
    }
    else if(sPacket.hasStudyQuestions()) {
        handleStudyQuestions(sPacket.getStudyQuestions());
    }
	else if (sPacket.hasErr()) {
		console.log("-----got errorPkt");
		console.log(sPacket.getErr().getDescription())
	}
	else if (sPacket.hasUserCommand()) {
		var userCommand = sPacket.getUserCommand();
		var commandType = userCommand.getCommandType();
		if (commandType == proto.scaii.common.UserCommand.UserCommandType.POLL_FOR_COMMANDS) {
            if (userInfoScaiiPackets.length > 0){
                result = buildResponseToReplay(userInfoScaiiPackets);
                userInfoScaiiPackets = [];
            }
			//console.log("-----got pollForCommands");
			else if (userCommandScaiiPackets.length > 0) {
				result = buildResponseToReplay(userCommandScaiiPackets);
                controlsManager.userCommandSent();
                userCommandScaiiPackets = [];
			}
			else {
				result = new proto.scaii.common.MultiMessage;
			}
		}
		else if (commandType == proto.scaii.common.UserCommand.UserCommandType.JUMP_COMPLETED) {
			//console.log("-----got jump completed message");
            controlsManager.jumpCompleted();
            if (userStudyMode) {
                tabManager.finalStepsForChangeToTab();
            }
            currentExplManager.setCurrentStepAfterJump(sessionIndexManager.getCurrentIndex());
		}
		else if (commandType == proto.scaii.common.UserCommand.UserCommandType.SELECT_FILE_COMPLETE){
            controlsManager.doneLoadReplayFile();
            if (userStudyMode){
                if (!hasShownWelcomeScreen){
                    // can't be tab hop, must be first screen shown
					clearLoadingScreen();
					var logLine = stateMonitor.getWaitForResearcherStart()
                    stateMonitor.setUserAction(logLine);	
                    showUserIdScreen();
                }
                else {
                    tabManager.jumpToDesiredStepIfTabChangeInProgress();
                    activeStudyQuestionManager.accessManager.express();
                    clearLoadingScreen();
                }
                
            }
		}
	}
	else {
		console.log(sPacket.toString())
		console.log('unexpected message from system!');
	}
	return result;
}
function epochIsChanging() {
	if (currentExplManager != undefined) {
		currentExplManager.removeOverlaysAndOutlines();
	}
}