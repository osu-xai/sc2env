function getStudyQuestionRenderer(questions) {
    var sqr = {};
    //sqr.bg = "#f4f4f4";
    sqr.bg = "#ffffff";
    sqr.marginTop = "6px";
    sqr.fontSize = "16px";
    //sqr.clickQuestionFontSize = "18px";
    sqr.questionFormat = undefined;
    sqr.currentRadioName = undefined;
    sqr.currentTextBox = undefined;
    sqr.currentFollowupTextBox = undefined;
    sqr.clickInfoFromUserActionMonitor = undefined;
    sqr.controlsWaitingForClick = [];
   
    sqr.forgetQuestion = function(){
        this.questionFormat = undefined;
        this.currentRadioName = undefined;
        this.currentTextBox = undefined;
        this.currentFollowupTextBox = undefined;
        $('#q-and-a-div').empty();
    }

    sqr.collectClickInfo = function(){
        var result = this.clickInfoFromUserActionMonitor;
        this.clickInfoFromUserActionMonitor = undefined;
        this.controlsWaitingForClick = [];
        return result;
    }
    sqr.renderTextInputBox = function(step, index) {
        this.questionFormat = 'text';
        var textBoxId = "question-text-box";
        var ta = document.createElement("textarea");
        ta.setAttribute("id", textBoxId);
        ta.setAttribute("style","font-family:Arial;font-size:" + this.fontSize + ";padding-left:10px; padding-right:10px;height:50px");
        ta.onkeyup = function() {
            activeStudyQuestionManager.renderer.saveButtonEnableCheck();
        }
        this.currentTextBox = ta;
        $("#q-and-a-div").append(ta);
    }

    sqr.saveButtonEnableCheck = function() {
        var enableTheButton = false;
        var questionText = undefined;
        var followupQuestionText = undefined;
        if ($("#question-text-box").length != 0){
            questionText = $("#question-text-box").val();
            if (questionText != ""){
                enableTheButton = true;
            }
        }
        if ($("#followup-textarea").length != 0){
            followupQuestionText = $("#followup-textarea").val();
            enableTheButton = followupQuestionText != "" && followupQuestionText != undefined &&  enableTheButton;
        }
        if (enableTheButton){
            $("#button-save").attr("disabled",false);
        }
        else {
            $("#button-save").attr("disabled",true);
        }
    }
    sqr.renderFollowupQuestion = function(prefix) {
        var fuText = document.createElement("DIV");
        fuText.setAttribute("id", "followup-text");
        fuText.setAttribute("style", "margin-left:0px;margin-top:14px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
        fuText.innerHTML =  prefix + "What, if anything, do you want to ask the AI at this point?";
        $("#q-and-a-div").append(fuText);
        var ta = document.createElement("textarea");
        ta.setAttribute("id", "followup-textarea");
        ta.setAttribute("style","font-family:Arial;font-size:" + this.fontSize + ";padding-left:10px; padding-right:10px;height:50px");
        this.currentFollowupTextBox = ta;
        ta.onkeyup = function() {
            activeStudyQuestionManager.renderer.saveButtonEnableCheck();
        }
        $("#q-and-a-div").append(ta);
    }

    sqr.getCurrentFollowupAnswer = function(){
        //var answer = '"' + this.currentFollowupTextBox.value + '"';
        var answer = '"' + $('textarea#followup-textarea').val() + '"';
        answer = escapeAnswerFileDelimetersFromTextString(answer);
        return answer;
    }

    sqr.getCurrentAnswer = function(){
        if (this.questionFormat == 'text') {
            //var answer = '"' + this.currentTextBox.value + '"';
            var answer = '"' + $('textarea#question-text-box').val() + '"';
            answer = escapeAnswerFileDelimetersFromTextString(answer);
            return answer;
        }
        else if (this.questionFormat == 'radio') {
            var radioName = this.currentRadioName;
            var answer = $('input[name=' + radioName + ']:checked').val();
            return answer;
        }
        else {
            return undefined;
        }
    }

    sqr.renderRadioButton = function(radioSetName, answerText, step, index){
        var radioRowId = "radio-button-row-" + step + "-" + index;
        var buttonRow = document.createElement("DIV");
        buttonRow.setAttribute("id", radioRowId);
        buttonRow.setAttribute("class", "flex-row");
        buttonRow.setAttribute("style", "margin-top:" + this.marginTop + ";width:100%;");
        $("#q-and-a-div").append(buttonRow);

        var radioId = "radio-"+ step + "-" + index;
        var radio = document.createElement("INPUT");
        radio.setAttribute("type", "radio");
        radio.setAttribute("id", radioId);
        radio.setAttribute("style", "margin-left:80px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
        radio.setAttribute("name", radioSetName);
        radio.setAttribute("value", answerText);
        radio.onchange = function() {
            $("#button-save").attr("disabled",false);
        }
        $("#"+radioRowId).append(radio);

        var radioLabel = document.createElement("DIV");
        radioLabel.setAttribute("style", "margin-left:8px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
        radioLabel.innerHTML = answerText;
        $("#"+radioRowId).append(radioLabel);
    }

    sqr.renderRadioButtons = function(step, answers) {
        this.questionFormat = 'radio';
        var radioSetName = "question-radio";
        for (var i in answers){
            var answer = answers[i];
            this.renderRadioButton(radioSetName, answer, step, i);
        }
        this.currentRadioName = radioSetName;
    }

    sqr.renderSaveButton = function(type, isClickCollectingQuestion){
        var saveButtonRowId = "save-button-row";
        var buttonRow = document.createElement("DIV");
        buttonRow.setAttribute("id", saveButtonRowId);
        buttonRow.setAttribute("class", "flex-row");
        buttonRow.setAttribute("style", "margin-top:10px;font-family:Arial;background-color:" + this.bg + ";width:100%;");
        $("#q-and-a-div").append(buttonRow);

        var save = document.createElement("BUTTON");
        save.disabled = true;
        save.setAttribute("id", "button-save");
        save.setAttribute("style", "margin-left:250px;font-family:Arial;font-size:" + this.fontSize + ";padding-left:10px; padding-right:10px");
        save.innerHTML = "Save";
        save.onclick = acceptAnswer;
        $("#"+ saveButtonRowId).append(save);
        if (isClickCollectingQuestion){
            this.controlsWaitingForClick.push(save);
        }
    }
    
    sqr.removeMissingClickInfoMessage = function() {
        $("#missing-click-info-message").remove();
    }
    sqr.removeMissingQuestionInfoMessage = function() {
        $("#missing-question-info-message").remove();
    }
    sqr.expressMissingClickInfoMessage  = function () {
        if ($("#missing-click-info-message").length == 0) {
            var missingClickInfoDiv = document.createElement("DIV");
            missingClickInfoDiv.setAttribute("id", "missing-click-info-message");
            missingClickInfoDiv.setAttribute("style", "margin-left:0px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
            missingClickInfoDiv.innerHTML =  "Please click on one of the designated areas";
            $("#save-button-row").append(missingClickInfoDiv);
        }
    }
    sqr.expressMissingQuestionInfoMessage = function () {
        if ($("#missing-question-info-message").length == 0) {
            var missingQuestionInfoDiv = document.createElement("DIV");
            missingQuestionInfoDiv.setAttribute("id", "missing-question-info-message");
            missingQuestionInfoDiv.setAttribute("style", "margin-left:0px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
            missingQuestionInfoDiv.innerHTML =  "Please answer all of the questions in the designated areas";
            $("#save-button-row").append(missingQuestionInfoDiv);
        }
    }
    sqr.poseQuestion = function(qu, questionNumber, step){
        questionLetterMap = {}
        questionLetterMap[1] = 'a';
        questionLetterMap[2] = 'b';
        questionLetterMap[3] = 'c';
        questionLetterMap[4] = 'd';
        questionLetterMap[5] = 'e';
        questionLetterMap[6] = 'f';
        questionLetterMap[7] = 'g';
        var questionLetterIndex = 1;
        var questionIndicator = "D" + questionNumber;
        var text = qu.questionText;
        var answers = qu.answers;
        var type = qu.questionType;
        $("#q-and-a-div").empty();
        $("#q-and-a-div").css("background-color",this.bg);
        $("#q-and-a-div").css("margin-top","20px");
        $("#q-and-a-div").css("padding","20px");
        if (qu.isClickCollectingQuestion()){
            var clickPromptDiv = document.createElement("DIV");
            clickPromptDiv.setAttribute("id", "click-prompt-div");
            clickPromptDiv.setAttribute("style", "background-color:yellow");
            clickPromptDiv.setAttribute("class", "flex-row");
            $("#q-and-a-div").append(clickPromptDiv);

            var clickPrompt = document.createElement("DIV");
            clickPrompt.setAttribute("id", "click-prompt");
            clickPrompt.setAttribute("style", "padding:10px;margin-bottom:8px;margin-left:0px;font-family:Arial;font-size:" + this.fontSize + ";");
            clickPrompt.innerHTML =  questionIndicator + "(" + questionLetterMap[questionLetterIndex] + ")" + " " + qu.clickQuestionText;
            questionLetterIndex = questionLetterIndex + 1;
            $("#click-prompt-div").append(clickPrompt);

            var updateSelection = document.createElement("DIV");
            updateSelection.setAttribute("id", "selection-update-prompt");
            updateSelection.setAttribute("style", "padding: 10px; margin-bottom:8px;font-family:Arial;font-size:" + this.fontSize + ";display:none");
            //updateSelection.innerHTML = "Please Select";
            $("#click-prompt-div").append(updateSelection);
        }
        // add a textArea for the question
        var quText = document.createElement("DIV");
        quText.setAttribute("id", "current-question");
        quText.setAttribute("style", "margin-top:8px;font-family:Arial;font-size:" + this.fontSize + ";background-color:" + this.bg + ";");
        if (questionNumber == undefined) {
            quText.innerHTML =  text;
        }
        else {
            quText.innerHTML =  questionIndicator + "(" + questionLetterMap[questionLetterIndex] + ")"  + " " + text;
            questionLetterIndex = questionLetterIndex + 1;
        }
        
        $("#q-and-a-div").append(quText);
        
        if (answers.length == 0){
            // provide area for user to type text answer
            this.renderTextInputBox();
        }
        else {
            // add a div with radio button and label for each answer
            this.renderRadioButtons(step, answers);
        }
        var asqm = activeStudyQuestionManager;
        if (!(step == 'summary')){
            if (!isTutorial()  && asqm.isFinalQuestionAtDecisionPoint(qu.questionId)){
                this.renderFollowupQuestion(questionIndicator + "(" + questionLetterMap[questionLetterIndex] + ")"  + " ");
            }
        }
        // add the ever present - follow up question, except on summary questions
        this.renderSaveButton(type, qu.isClickCollectingQuestion());
        if (qu.isClickCollectingQuestion()){
            var listener = {};
            listener.acceptClickInfo = function(clickInfo){
                var renderer = asqm.renderer;
                if (renderer.isLegalRegionToClickOn(clickInfo, qu.regionsToAllow)){
                    // don't remove the click message if this is residual click activty from prior question "save"
                    if (renderer.isClickInfoFromSaveButtonClick(clickInfo)){
                        return;
                    }
                    if (clickInfo.includes("MouseOverSaliencyMap")) {
                        return;
                    }
                    if (clickInfo.includes("clickGameQuadrant")){ 
                        // we don't want clicks "legally" in the gameboard region that are not 
                        // of type "clickEntity" to be accepted as click events for q and a
                        return;
                    }
                    renderer.clickInfoFromUserActionMonitor = clickInfo;
                    renderer.removeMissingClickInfoMessage();
                    //$("#click-prompt").html("Most recent click logged (you can click more if needed).");
                    $("#click-prompt-div").css("background-color", asqm.renderer.bg);
                    //$("#selection-update-prompt").css("background-color", asqm.renderer.bg);
                    $("#selection-update-prompt").css("background-color", "yellow");
                    $("#selection-update-prompt").css("display", "inline");
                    $("#selection-update-prompt").stop(true);
                    $("#selection-update-prompt").fadeTo(0, 1);
                    //$("#selection-update-prompt").html("Selection Logged");
                    $("#selection-update-prompt").html("Selection Updated");
                    $("#selection-update-prompt").delay(300).fadeOut(400, "linear");
                }
                // var clickAckDiv = document.createElement("DIV");
                // clickAckDiv.setAttribute("style", "margin-left:10px;font-family:Arial;font-size:" + this.fontSize + ";padding-left:10px; padding-right:10px");
                // clickAckDiv.innerHTML = "(click wasregistered)";
                // $("#save-button-row").append(clickAckDiv);
            };
            //SC2_DEFERRED stateMonitor.setClickListener(listener);
        }
    }

    sqr.isClickInfoFromSaveButtonClick = function(clickInfo){
        var matchIndex = clickInfo.indexOf("target:button-save");
        if (Number(matchIndex) == Number(-1)){
            return false;
        }
        return true;
    }
    sqr.isClickInRegion = function(clickInfo, regionIndicator) {
        var matchDetector = "target:" + regionIndicator;
        if (clickInfo.includes(matchDetector)){
            var barMatchDetector = "selectedRewardBar:None";
            if (regionIndicator == "rewardBar" && clickInfo.includes(barMatchDetector)) {
                return false;
            }
            return true;
        }
        return false;
    }
    sqr.isLegalRegionToClickOn = function(clickInfo, regionsToAllow) {
        for (var i in regionsToAllow) {
            var regionIndicator = regionsToAllow[i];
            if (this.isClickInRegion(clickInfo, regionIndicator)) {
                return true;
            }
        }
        return false;
        // target:gameboard
        // target:rewardBar
        // target:saliencyMap
    }
    /*********************************************************************************************************
     * Author: Andrew Anderson
     * Purpose: Renders the thank you screen at the end. I'll be commenting it out.
     * Date Modified: 9/6/2018
     ********************************************************************************************************/
    // sqr.poseThankYouScreen = function(){
    //     var div = document.createElement("DIV");
    //     div.setAttribute("id", "thank-you-div");
    //     div.setAttribute("class", "flex-column");
    //     var widthNeededToCoverEverything = this.getWidthNeededToHideEverything();
    //     div.setAttribute("style", "position:absolute;left:0px;top:0px;z-index:" + zIndexMap["allTheWayToFront"] + ";margin:auto;font-family:Arial;padding:10px;width:" + widthNeededToCoverEverything + "px;height:1600px;background-color:" + this.bg + ";");
    //     $('body').append(div);

    //     var row = document.createElement("DIV");
    //     row.setAttribute("id", "thank-you-row");
    //     row.setAttribute("class", "flex-row");
    //     row.setAttribute("style", "margin-top:150px;font-family:Arial;padding:10px;");
    //     $("#thank-you-div").append(row);
        
    //     var thanks = document.createElement("DIV");
    //     thanks.setAttribute("id", "thanks");
    //     thanks.setAttribute("style", "margin-left:100px;font-family:Arial;font-size:18px;padding:10px;");
    //     thanks.innerHTML = "Thank you for your participation in this study!";
    //     $("#thank-you-row").append(thanks);
    // }

    sqr.getWidthNeededToHideEverything = function(){
        return 3000;
    }
    sqr.renderWaitScreen = function() {
        var userIdDiv = document.createElement("DIV");
        userIdDiv.setAttribute("id", "user-wait-div");
        userIdDiv.setAttribute("class", "flex-column");
        var widthNeededToCoverEverything = this.getWidthNeededToHideEverything();
        userIdDiv.setAttribute("style", "position:absolute;left:0px;top:0px;z-index:" + zIndexMap["allTheWayToFront"] + ";margin:auto;font-family:Arial;padding:10px;width:" + widthNeededToCoverEverything + "px;height:1600px;background-color:" + this.bg + ";");
        $('body').append(userIdDiv);

        var questionRow = document.createElement("DIV");
        questionRow.setAttribute("id", "user-wait-question-row");
        questionRow.setAttribute("class", "flex-row");
        questionRow.setAttribute("style", "margin-top:150px;font-family:Arial;padding:10px;");
        $("#user-wait-div").append(questionRow);
        
        var question = document.createElement("DIV");
        question.setAttribute("id", "user-wait-question");
        question.setAttribute("style", "margin-left:100px;font-family:Arial;font-size:32px;padding:10px;");
        question.innerHTML = "Please wait for the researcher to tell you to continue.";

        $("#user-wait-question-row").append(question);


        var checkboxRow = document.createElement("DIV");
        checkboxRow.setAttribute("id", "user-wait-checkbox-row");
        checkboxRow.setAttribute("class", "flex-row");
        checkboxRow.setAttribute("style", "margin-left:100px;margin-top:50px;padding:10px;");
        $("#user-wait-div").append(checkboxRow);
        
        var checkbox = document.createElement("INPUT");
        checkbox.setAttribute("id", "user-wait-checkbox");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("style", "padding:10px;margin:0px;width:20px;height:20px;");
        checkbox.onclick = function(e) {
            if (e.currentTarget.checked) {
                $("#user-wait-button-continue").attr("disabled", false);
            }
            else {
                $("#user-wait-button-continue").attr("disabled", true);
            }
        };
        $("#user-wait-checkbox-row").append(checkbox);

        var checkboxLabel = document.createElement("LABEL");
        checkboxLabel.setAttribute("id", "user-wait-checkbox");
        //checkboxLabel.setAttribute("for", "user-wait-checkbox");
        checkboxLabel.setAttribute("style", "font-family:font-size:18px;Arial;padding:10px;");
        var t = document.createTextNode("The researcher has given the instruction to proceed");
		checkboxLabel.appendChild(t);
        //checkboxLabel.innerHTML = "The researcher has given the instruction to proceed";
        $("#user-wait-checkbox-row").append(checkboxLabel);


        var buttonRow = document.createElement("DIV");
        buttonRow.setAttribute("id", "user-wait-button-row");
        buttonRow.setAttribute("class", "flex-row");
        buttonRow.setAttribute("style", "margin-top:60px;font-family:Arial;padding:10px;");
        $("#user-wait-div").append(buttonRow);

        var next = document.createElement("BUTTON");
        next.setAttribute("id", "user-wait-button-continue");
        next.setAttribute("disabled", "true");
        next.setAttribute("style", "margin-left:280px;font-family:Arial;font-size:18px;padding:10px;");
        next.innerHTML = "Continue";
        next.onclick = function(e) {
            //SC2_DEFERRED var logLine = stateMonitor.getWaitForResearcherEnd()
            //SC2_DEFERRED stateMonitor.setUserAction(logLine);
            $("#user-wait-div").remove();
        }
        $("#user-wait-button-row").append(next);
        $("#user-wait-button-continue").attr("disabled", true);
    }

    sqr.renderCueToPlayButton = function(){
        var arrowText = document.createElement("DIV");
        arrowText.setAttribute("id", "arrow-text");
        arrowText.setAttribute("style", "margin:auto;font-family:Arial;font-size:18px;padding:10px;");
        arrowText.innerHTML = "Click the play button to have the game play until the next decision point.";
        $("#q-and-a-div").append(arrowText);

    }
    
    sqr.renderCueAndArrowToPlayButton = function(){
        var arrowText = document.createElement("DIV");
        arrowText.setAttribute("id", "arrow-text");
        arrowText.setAttribute("style", "margin:auto;font-family:Arial;font-size:18px;padding:10px;");
        arrowText.innerHTML = "Click the play button to have the game play until the next decision point.";
        $("#q-and-a-div").append(arrowText);

        var startCoords = getCoordForStartOfArrowText();
        var endCoords = getCoordsForPlayButton();
        drawArrow(startCoords, endCoords);
        controlsManager.expressResumeButton();
        controlsManager.enablePauseResume();
    }

    return sqr;
}
var hasShownWelcomeScreen = false;
