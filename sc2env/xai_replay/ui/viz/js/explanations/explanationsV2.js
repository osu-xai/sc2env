var currentExplManager = undefined;
var currentExplanationStep = undefined;
var saliencyLookupMap = {};

function handleExplanationDetails(explDetails){
	if (explDetails.hasExplPoint()){
        explanationPoint = explDetails.getExplPoint();
        var barChartMessage = explanationPoint.getBarChart();
        var rawChart = convertProtobufChartToJSChart(barChartMessage);
        //ignore true data for testing
        //currentExplManager.setChartData(getSeeSawChart());
        var saliency = explanationPoint.getSaliency();
        saliencyLookupMap = saliency.getSaliencyMapMap();
        var step = sessionIndexManager.getCurrentIndex();
        currentExplManager.setChartData(rawChart, step);
	}
	else {
		console.log("MISSING expl point!");
	}
}

function askBackendForExplanationRewardInfo(stepNumber) {
	var userCommand = new proto.scaii.common.UserCommand;
	userCommand.setCommandType(proto.scaii.common.UserCommand.UserCommandType.EXPLAIN);
	var args = ['' +stepNumber];
	userCommand.setArgsList(args);
	stageUserCommand(userCommand);
	currentExplanationStep = stepNumber;
	if (stepNumber == sessionIndexManager.getCurrentIndex()) {
		//console.log("no need to move - already at step with explanation");
	}
	else {
		jumpToStep(stepNumber);//FIXME - can get rid of this?
	}
}

function renderWhyButton(step, x, y){
    $("#why-button").remove();
    var whyButton = document.createElement("BUTTON");
    var buttonId = "why-button";
    whyButton.setAttribute("id", buttonId);
    var why = document.createTextNode("why?");
    whyButton.appendChild(why);          
    whyButton.setAttribute("style", 'z-index:' + zIndexMap["whyButton"] + ';position:relative;left:' + x + 'px;top:-17px;font-family:Arial;');
    $("#explanation-control-panel").append(whyButton);
    $("#" + buttonId).click(function(e) {
        if (currentExplManager.chartVisible) {
            var logLine = templateMap["hideWhy"];
            logLine = logLine.replace("<HIDE_WHY>", "NA");
            targetClickHandler(e, logLine);
        }
        else {
            var logLine = templateMap["showWhy"];
            logLine = logLine.replace("<SHW_WHY>", "NA");
            targetClickHandler(e, logLine);
        }
        
        e.preventDefault();
        processWhyClick(step);
    })
}
function addFunctionsToRawChart(rawChart){
    var ch = addColorToBars(rawChart);
    ch = addUtilityFunctions(ch);
    ch.actions = ch.getActionsInQuadrantOrder(ch.actions);
    ch = addRankingFunctions(ch);
    ch = addSelectionFunctions(ch);
    ch = addTextFunctions(ch);
    ch = addGeometryFunctions(ch);
    return ch;
}

function setDefaultSelections(chartData,treatmentID) {
    var action = chartData.getMaxValueAction();
    var bar = chartData.getMaxValueBar(action.bars);
    if (treatmentID == "T1"){
        chartData.showSalienciesForActionName(action.name);
    }
    else if (treatmentID == "T3"){
        chartData.showSalienciesForRewardName(bar.name);
    }
    else if (treatmentID == "NA"){
        chartData.selectSingleRewardBar(bar.fullName);
        chartData.showSalienciesForRewardName(bar.name);
    }
    return chartData;
}
function addConvenienceDataStructures(chartData) {
    if (chartData.actionForNameMap == undefined){
        chartData.actionForNameMap = {};
        chartData.actionNames = [];
        for(var i in chartData.actions){
            var action = chartData.actions[i];
            var actionName = action.name;
            action.fullName = actionName;
            action.type = "action";
            chartData.actionForNameMap[actionName] = action;
            chartData.actionNames.push(actionName);
        }
    }
    
    if (chartData.actionRewardForNameMap == undefined){
        chartData.actionRewardForNameMap = {};
        chartData.actionRewardNames = [];
        for(var i in chartData.actions){
            var action = chartData.actions[i];
            for (var j in action.bars){
                var bar = action.bars[j];
                if (bar.name == "Living") {
                    //Do nothing
                } else {
                    bar.fullName = action.name+ "." + bar.name;
                    bar.type = "reward";
                    bar.actionName = action.name;
                    chartData.actionRewardForNameMap[bar.fullName] = bar;
                    chartData.actionRewardNames.push(bar.fullName);
                }
            }
        }
    }
    
    if (chartData.rewardNames == undefined){
        chartData.rewardNames = [];
        for(var i in chartData.actions){
            var action = chartData.actions[i];
            for (var j in action.bars){
                var bar = action.bars[j];
                if (bar.name == "Living") {
                    //Do nothing
                }
                else if (!chartData.rewardNames.includes(bar.name)) {
                    chartData.rewardNames.push(bar.name);
                }
            }
        }
    }
    return chartData;
}

function ensureActionValuesSet(chartData) {
    for (var i in chartData.actions) {
        var action = chartData.actions[i];
        var actionTotal = 0.0;
        for (var j in action.bars){
            var bar = action.bars[j];
            actionTotal = actionTotal + bar.value;
        }
        action.value = actionTotal;
    }
    return chartData;
}
function getExplanationsV2Manager(){
    var cm = {};
    cm.data = undefined;
    cm.filename = undefined;
    cm.saliencyRandomized = false;
    cm.renderLog = [];
    cm.userStudyMode = false;
    cm.chartVisible = false;
    cm.showSaliencyAccessButton = false;
    cm.saliencyVisible = false;
    cm.saliencyCombined = false;
    cm.treatmentID = "NA";
    cm.showLosingActionSmaller = false;
    cm.showHoverScores = false;
    cm.chartUI = getChartV2UI();
    cm.saliencyUI = getSaliencyV2UI();
    cm.stepsWithExplanations = [];  // set by handleReplaySessionConfig
    cm.chartDataForStep = {};
    cm.currentQuestionType = undefined;
    cm.entityListForDP = {};
    cm.waitForClickDP = 0;
    cm.actionsRanked = [];

    cm.captureEntitiesForDecisionPoint = function(step) {
        if (this.entityListForDP[step] == undefined){
            this.entityListForDP[step] = this.cloneMasterEntitiesList();
        }
    }

    cm.removeOverlaysAndOutlines = function() {
        if (this.data != undefined) {
            this.saliencyUI.removeAllOverlaysAndOutlines(this.data);
        }
    }

    cm.removeAndForgetOverlaysAndOutlines = function () {
        if (this.data != undefined) {
            this.saliencyUI.removeAllOverlaysAndOutlines(this.data);
            this.saliencyUI.forgetAllOverlaysAndOutlines(this.data);
        }
    }

    cm.cloneMasterEntitiesList = function() {
        var clone = {};
        for (var i in masterEntities) {
            var entity = masterEntities[i];
            var entityClone = new proto.scaii.common.Entity;
            entityClone.setId(entity.getId());
            if (entity.hasPos()){
                copyPos(entity, entityClone);
            }
            var shapesList = entity.getShapesList();
            for (var j in shapesList){
                var shape = shapesList[j];
                copyShapeIntoCloneEntity(shape, entityClone);
            }
            clone[entityClone.getId()]= entityClone;
        }
        return clone;
    }
    cm.setChartData = function(rawChartData, step){
        var cachedChartData = this.chartDataForStep[step];
        if (cachedChartData == undefined) {
            this.data = addFunctionsToRawChart(rawChartData);
            this.data = ensureActionValuesSet(this.data);
            this.data = addConvenienceDataStructures(this.data);
            this.data = setDefaultSelections(this.data, this.treatmentID);
            this.chartDataForStep[step] = this.data;
            this.actionsRanked = rankThings(this.data.actions, getThingWithMaxValue);
        }
        else {
            this.data = cachedChartData;
        }
        this.render("live");
    }

    cm.switchToExplanationsForThisDecisionPoint = function(step) {
        this.data = this.chartDataForStep[step];
        this.render("live");
    }

    cm.applyFunctionToEachCachedDataset = function(f, key) {
        for (var i in this.stepsWithExplanations){
            var step = this.stepsWithExplanations[i];
            var data = this.chartDataForStep[step];
            if (data != undefined) { // in case we haven't landed on this dp yet
                f(data, key);
            }
        }
    }
    cm.hasExplDataForStep = function(step) {
        if (this.chartDataForStep[step] == undefined) {
            return false;
        }
        return true;
    }

    cm.setWhyButtonAccessibility = function() {
        if (userStudyMode) {
            // see if that step has a dp on it.  If so enable, else disable
            if (sessionIndexManager.isAtDecisionPoint()){
                $("#why-button").attr("disabled", "false");
            }
            else {
                $("#why-button").attr("disabled", "true");
            }
        }
    }

    cm.setCurrentStepAfterJump = function(step){
        // find first step less than or equal to this one
        var existingData = this.data;
        for (var i = this.stepsWithExplanations.length - 1; i >= 0; i--){
            var curStep = this.stepsWithExplanations[i];
            if (Number(curStep) <= Number(step)){
                this.data = this.chartDataForStep[curStep];
                if (existingData != this.data){
                    currentExplManager.applyFunctionToEachCachedDataset(detachChannelItem,"overlayCanvas");
                }
                this.render("live");
                
                return;
            }
        }
    }

    cm.setQuestionType = function(type) {
        this.currentQuestionType = type;
        if (type == "waitForPredictionClick"){
            this.chartVisible = false;
            this.saliencyVisible = false;
            this.render("live");
        }
    }
    cm.setExplanationVisibility = function(currentDPIndex, step) {
        if (this.waitForClickDP < currentDPIndex.length && step > currentDPIndex[this.waitForClickDP]) {
            this.waitForClickDP++;
        }
        if (this.currentQuestionType == "waitForPredictionClick" && currentDPIndex[this.waitForClickDP] == step) {
            this.chartVisible = false;
            this.saliencyVisible = false;
            this.render("live");
        } else {
            this.chartVisible = true;
            this.saliencyVisible = true;
            this.render("live");
        }
    }
    cm.setFilename = function(filename){
        this.filename = filename;
        if (filename.startsWith("tutorial")){
            this.saliencyRandomized = true;
        }
        else {
            this.saliencyRandomized = false;
        }
    }

    cm.setUserStudyMode = function(val){
        this.userStudyMode = val;
        this.showLosingActionSmaller = val;
        this.showHoverScores = !val;

        this.chartVisible = false;
        this.showSaliencyAccessButton = true;
        this.saliencyVisible = false;
        //.saliencyCombined = !val;
        // turn off combined saliency for now
        this.saliencyCombined = false;
    }

    cm.noteQuestionWasAnswered = function(){
        if (this.currentQuestionType == "waitForPredictionClick"){
            this.resetExplanationVisibility();
        }
    }
    cm.resetExplanationVisibility = function(){
        this.setUserStudyTreatment(this.treatmentID);
        this.render("live");
    }

    cm.setUserStudyTreatment = function(val) {
        if (val == "T0"){
            this.treatmentID = "T0";
            this.chartVisible = false;
            this.showSaliencyAccessButton = false;
            this.saliencyVisible = false;
            this.saliencyCombined = false;
        }
        else if (val == "T1"){
            this.treatmentID = "T1";
            this.chartVisible = false;
            this.showSaliencyAccessButton = false;
            this.saliencyVisible = true;
            this.saliencyCombined = false;

        }
        else if (val == "T2"){
            this.treatmentID = "T2";
            this.chartVisible = true;
            this.showSaliencyAccessButton = false;
            this.saliencyVisible = false;
            this.saliencyCombined = false;

        }
        else if (val == "T3"){
            this.treatmentID = "T3";
            this.chartVisible = true;
            this.showSaliencyAccessButton = false;
            this.saliencyVisible = true;
            this.saliencyCombined = false;
            
        }
        else {
            alert("unknown treatment name " +val);
        }
    }

    cm.render = function(mode){
        cleanExplanationUI();
        this.renderLog = [];
        if (this.data == undefined) {
            return;
        }
        if (this.treatmentID == "T0"){
            // no action
        } 
        else if (this.treatmentID == "T1"){
            this.renderT1(mode);
        } else if (this.treatmentID == "T2"){
            this.renderT2(mode);
        } 
        else if (this.treatmentID == "T3"){
            // normal mode falls through to here and matches T3 as desired
            this.renderT3(mode);
        } 
        else {
            this.renderNoTreatment(mode);
        }
        if (this.userStudyMode){
            ensureStudyControlScreenIsWideEnough();
        }
    }

    cm.renderT1 = function(mode){
        if (this.saliencyVisible) {
            this.renderSaliencyDetailed(mode);
        }
    }
    
    cm.renderT2 = function(mode){
        if (this.chartVisible){
            this.renderChartDetailed(mode, "T2");
        }
    }

    cm.renderT3 = function(mode){
        if (this.chartVisible){
            this.renderChartDetailed(mode, "T3");
        }
        if (this.showSaliencyAccessButton && this.chartVisible){
            this.renderSaliencyAccessButton(mode);
        }
        if (this.saliencyVisible && this.saliencyCombined){
            this.renderSaliencyCombined(mode);
        }
        if (this.saliencyVisible && !this.saliencyCombined){
            this.renderSaliencyDetailed(mode);
        }
    }

    cm.renderNoTreatment = function(mode){
        if (this.chartVisible){
            var selectedBars = this.data.getSelectedBars();
            if (selectedBars.length > 0){
                var selectedBar = selectedBars[0];
                var rewardBarName = selectedBar.fullName;
                this.data.clearHighlightSelections();
                var trueRewardBarName = rewardBarName.split(".")[1];
                this.data.highlightSimilarRewardBars(trueRewardBarName);
            }
            this.renderChartDetailed(mode, "NA");
        }
        if (this.showSaliencyAccessButton && this.chartVisible){
            this.renderSaliencyAccessButton(mode);
        }
        if (this.saliencyVisible && this.saliencyCombined){
            this.renderSaliencyCombined(mode);
        }
        if (this.saliencyVisible && !this.saliencyCombined){
            this.renderSaliencyDetailed(mode);
        }
    }

    cm.renderChartDetailed = function(mode, treatment){
        if (mode == "trace"){
            this.renderLog.push("renderChartDetailed");
            return;
        }
        else {
            this.chartUI.renderChartDetailed(this.data, treatment);
        }
    }
    
    cm.renderSaliencyAccessButton = function(mode){
        if (mode == "trace"){
            this.renderLog.push("renderSaliencyAccessButton");
            return;
        }
        else {
            this.saliencyUI.renderSaliencyAccessControls();
        }
    }
    
    cm.renderSaliencyCombined = function(mode){
        if (mode == "trace"){
            this.renderLog.push("renderSaliencyCombined");
            return;
        }
        else {
            this.saliencyUI.renderSaliencyCombined(this.data);
        }
    }
    
    cm.renderSaliencyDetailed = function(mode){
        if (mode == "trace"){
            this.renderLog.push("renderSaliencyDetailed");
            return;
        }
        else {
            this.saliencyUI.renderSaliencyDetailed(this.data);
        }
    }
    return cm;
}
