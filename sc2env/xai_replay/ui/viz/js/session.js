var testingMode = false;
var replaySessionConfig;
var replayChoiceConfig;
var selectedExplanationStep = undefined;
var sessionIndexManager = undefined;
var activeStudyQuestionManager = undefined;
var stateMonitor = undefined;
var userActionMonitor = undefined;

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
//
// SC2_CHANGE - this info will be sent in the json blob so it will become extractReplaySessionConfig(json_string)
//
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

//
// SC2_CHANGE - no Viz packet comes in, but timing loop will trigger portion of this to be renamed handleSC2Data(frame_info)
//
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
//
// SC2_CHANGE rework to handle java object for the reward info,
// adding up reward info as we go forward and subtracting as we go backward
//
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

//
// SC2_CHANGE fewer packets arrive.   New protocol will bew as follows:
//

//  INITIAL ORDER OF ARRIVAL OF PACKETS
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. SC2ReplaySessionConfig
//  3. StudyQuestions (optional)


//
// SC2_CHANGE remove deadcode, tweak for adjusted code
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
	else if (sPacket.hasExplDetails()) {
		//console.log('has expl details');
		var explDetails = sPacket.getExplDetails();
        handleExplanationDetails(explDetails);
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
		if (commandType == proto.scaii.common.UserCommand.UserCommandType.JUMP_COMPLETED) {
			//console.log("-----got jump completed message");
            controlsManager.jumpCompleted();
            if (userStudyMode) {
                tabManager.finalStepsForChangeToTab();
			}
			//
			//  SC2_CHANGE  we need the following line somewhere else
			//
            currentExplManager.setCurrentStepAfterJump(sessionIndexManager.getCurrentIndex());
		}
		else if (commandType == proto.scaii.common.UserCommand.UserCommandType.SELECT_FILE_COMPLETE){

			//
			//  SC2_CHANGE  we need the following code blocks somewhere else
			//
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