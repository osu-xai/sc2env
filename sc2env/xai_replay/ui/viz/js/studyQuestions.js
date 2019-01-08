function clearStudyQuestionMode() {
    if (userStudyMode){
        if (!tabManager.hopToUnfinishedQuestionInProgress){
            $('#q-and-a-div').empty();
        }
    }
    $("#left-block-div").remove();
    $("#right-block-div").remove();
    //activeStudyQuestionManager = undefined;
}
function getStudyQuestionManager(questions, userId, treatmentId) {
    var sqm = {};
    sqm.renderer = getStudyQuestionRenderer();
    sqm.userId = userId;
    sqm.treatmentId = treatmentId;
    
    sqm.questionMap = {};
    sqm.questionIds = [];
    sqm.allQuestionsAtDecisionPointAnswered = false;
    sqm.mostRecentlyPosedQuestion = undefined;
    sqm.didWeDisplayWait = [];

    for (var i in questions){
        var question = questions[i];
        var step = question.getStep();
        var questionIndexForStep = question.getQuestionIdForStep();;
        var questionId = getQuestionId(step, questionIndexForStep);
        var answers = question.getAnswersList();
        var qu = {};
        qu.step = step;
        qu.questionIndexForStep = questionIndexForStep;
        qu.questionId = questionId;
        qu.questionText= question.getQuestion();;
        qu.isClickCollectingQuestion = function() {
            return ((this.questionType == "waitForClick") || (this.questionType =="waitForPredictionClick"));
        }
        var allTypeInfo = question.getQuestionType();
        var typeParts = allTypeInfo.split(":");
        qu.questionType = typeParts[0];
        if (qu.isClickCollectingQuestion()){
            qu.regionsToAllow = typeParts[1].split("_");
            qu.clickQuestionText = typeParts[2];
        }
        qu.answers = answers;
        sqm.questionIds.push(questionId);
        sqm.questionMap[questionId] = qu;
    }
    sqm.squim = getStudyQuestionIndexManager(sqm.questionIds);
    studyQuestionIndexManager = sqm.squim;
    sqm.accessManager = getQuestionAccessManager(sqm.squim.getDecisionPointSteps(), sessionIndexManager.getMaxIndex());


    sqm.configureForCurrentStep = function() {
        var currentStep = sessionIndexManager.getCurrentIndex();
        if (this.squim.hasQuestionForStep(currentStep)) {
            this.poseCurrentQuestion();
        }
    }

    sqm.hasMoreQuestions = function() {
        return this.squim.hasMoreQuestions();
    }

    sqm.isFinalQuestionAtDecisionPoint = function(id){
        var step = getStepFromQuestionId(id);
        var index = this.questionIds.indexOf(id);
        if (index == -1) {
            // just move on - shouldn't happen
            return false;
        }
        if (step == "summary"){
            return false;
        }
        if (index == this.questionIds.length - 1){
            // it'sthe last question which is not a summary question, which should not happen, but coding for completeness
            return true;
        }
        else {
            var nextId = this.questionIds[index + 1];
            var stepFromNextId = getStepFromQuestionId(nextId);
            if (stepFromNextId == step) {
                return false;
            }
            return true;
        }
    }
    sqm.poseFirstQuestion = function() {
        var step = this.squim.getCurrentStep();
        jumpToStep(step);// FIXME comment this out first
        this.poseCurrentQuestion();
    }
    
    sqm.poseNextQuestion = function() {
        var priorStep = this.squim.getCurrentStep();
        this.squim.next();
        var newStep = this.squim.getCurrentStep();
        if (priorStep != newStep && !this.squim.isCurrentQuestionSummary()) {
            // move to next step
            // Jump because we are avoiding the final step of the epoch which is blank and we don't want to render it for long time.
            // this causes backing up to prior keyframe and moving forward 
            jumpToStep(newStep);  
        }
        this.poseCurrentQuestion();
    }
    
    sqm.getLegalInstrumentationTargetsForCurrentQuestion =function(){
        var qid = this.squim.getCurrentQuestionId();
        var qu = this.questionMap[qid];
        if (qu.questionType == 'waitForClick' || qu.questionType == 'waitForPredictionClick'){
            return qu.regionsToAllow;
        }
        else {
            return undefined;
        }
    }

    sqm.isPlainQuestionFocusedOnPriorChosenSaliencyMap = function(){
        var qid = this.squim.getCurrentQuestionId();
        var qu = this.questionMap[qid];
        if (qu.questionType == 'plain'){
            if (qu.questionText.includes("From looking at the saliency maps (below)")){
                return true;
            }
        }
        return false;
         
    }
    sqm.isCurrentQuestionWaitForClickOnSaliencyMap = function(){
        var qid = this.squim.getCurrentQuestionId();
        var qu = this.questionMap[qid];
        if (qu.questionType == 'waitForClick' || qu.questionType == 'waitForPredictionClick'){
            if (qu.regionsToAllow.length == 1 && qu.regionsToAllow[0] == "saliencyMap"){
                return true;
            }
        }
        return false;
    }
    sqm.poseCurrentQuestion = function() {
        currentExplManager.removeAndForgetOverlaysAndOutlines();

        var qid = this.squim.getCurrentQuestionId();
        if (tabManager.wasQuestionAnsweredAlready(qid)){
            return;
        }
        var shouldAskQuestion = false;
        if (this.mostRecentlyPosedQuestion == qid){
            if (tabManager.hopToUnfinishedQuestionInProgress){
                shouldAskQuestion = true;
            }
        }
        else {
            shouldAskQuestion = true;
        }
        if (shouldAskQuestion) {
            this.mostRecentlyPosedQuestion = qid;
            var logLine = templateMap["showQuestion"];
            logLine = logLine.replace("<SHOW_Q>", qid);
            stateMonitor.setUserAction(logLine);
            stateMonitor.setQuestionId(qid);
            var qu = this.questionMap[qid];
            var currentStep = this.squim.getCurrentStep();
            this.renderer.poseQuestion(qu, this.squim.getCurrentDecisionPointNumber(), currentStep);

            this.accessManager.setQuestionState("posed");
            this.accessManager.setQuestionType(qu.questionType);
            currentExplManager.setQuestionType(qu.questionType);
            this.accessManager.setQuestionStep(currentStep);
            if (this.squim.isStepPriorToLastDecisionPoint(currentStep)) {
                this.accessManager.setRelationToFinalDecisionPoint("before");
            }
            else if (currentStep == "summary") {
                if (!tabManager.hasNextTab()) {
                    var logLine = stateMonitor.getWaitForResearcherStart()
                    stateMonitor.setUserAction(logLine);
                    this.renderer.renderWaitScreen();
                }
                this.accessManager.setRelationToFinalDecisionPoint("finalStep");
            }
            else {
                this.accessManager.setRelationToFinalDecisionPoint("finalDpRange");
            }
            this.accessManager.express();
            renderDecisionPointLegend();
            // wait before show first question at DP, but not on DP1
            if (currentStep != "summary" && currentStep != 1){
                var questionIndex = qid.split(".")[1];
                var questionStep = qid.split(".")[0];
                var foundDisplayWait = false;
                if (questionIndex == 0){
                    for (var i in this.didWeDisplayWait) {
                        if (questionStep == this.didWeDisplayWait[i]) {
                            foundDisplayWait = true;
                        }
                    }
                    if (foundDisplayWait == false) {
                        this.makeUserWaitForInstructions();
                        this.didWeDisplayWait.push(questionStep);
                    }
                }
            }
        }
    }

    sqm.makeUserWaitForInstructions = function(){
        var logLine = stateMonitor.getWaitForResearcherStart()
        stateMonitor.setUserAction(logLine);
        this.renderer.renderWaitScreen();
    }
    
    sqm.isOkToDisplayActionName = function(step){
        var currentQuestionId = this.squim.getCurrentQuestionId();
        var currentStep = currentQuestionId.split(".")[0];
        if (currentStep == "summary"){
            // all can be revealed once we make it to summary question
            return true;
        }
        var currentQuestionIndex = currentQuestionId.split(".")[1];
        if (step < currentStep) {
            // any waitForPredictionClick questions in the past would have been answered
            return true;
        }
        if (step == currentStep){
            if (currentQuestionIndex != 0){
                return true;
            }
            // first question, check if its a waitForClickPrediction
            var qu = this.questionMap[currentQuestionId];
            if (qu.questionType == "waitForPredictionClick"){
                return false;
            }
            return true;
        }
        else {
            // step > currentQuestionId's step...
            // Any future waitForPredictionClick questions need to be hidden
            if (this.doesStepHaveWaitForPredictionClickQuestion(step)){
                return false;
            }
            return true;
        }
    }

    sqm.doesStepHaveWaitForPredictionClickQuestion = function(step) {
        if (step == "summary"){
            return false;
        }
        for (var i in this.questionIds){
            var qId = this.questionIds[i];
            var curStep = qId.split(".")[0];
            if (curStep == step){
                var qu = this.questionMap[qId];
                if (qu.questionType == "waitForPredictionClick"){
                    return true;
                }
            }
        }
        return false;
    }

    sqm.getExplanationTitles = function(explanationSteps, explanationTitles){
        var result = [];
        for (var i in explanationSteps){
            var step = explanationSteps[i];
            var title = explanationTitles[i];
            if (this.isOkToDisplayActionName(step)){
                result[i] = title;
            }
            else {
                result[i] = "---";
            }
        }
        return result;
    }

    return sqm;
}

function clearUserIdScreen() {
    $("#user-id-div").remove();
    tabManager.userIdHasBeenSet = true;
    activeStudyQuestionManager.poseFirstQuestion();
}

function acceptAnswer(e) {
    var asqm = activeStudyQuestionManager;
    var renderer = asqm.renderer;
    //renderer.removeMissingClickInfoMessage();
    // block if no answer specified
    if (renderer.controlsWaitingForClick.length != 0) {
        if (renderer.clickInfoFromUserActionMonitor == undefined) {
            renderer.expressMissingClickInfoMessage();
            return;
        }
    }
    var answer = renderer.getCurrentAnswer();
    
    if (answer == undefined || answer == "\"\"") {
        renderer.expressMissingQuestionInfoMessage();
        return;
    }
    // gather answer, send to backend
    var currentStep = activeStudyQuestionManager.squim.getCurrentStep();
    var questionId = activeStudyQuestionManager.squim.getCurrentQuestionId();
    tabManager.noteQuestionWasAnswered(questionId);
    var currentQuestionIndexAtStep = getQuestionIndexFromQuestionId(questionId);
    var clickInfo = renderer.collectClickInfo();
    userActionMonitor.clickListener = undefined;
    var squim = activeStudyQuestionManager.squim;
    if (clickInfo == undefined){
        clickInfo = "NA";
    }
    var followupAnswer = "NA";
    if (!(currentStep == 'summary')){
        if (!isTutorial() && asqm.isFinalQuestionAtDecisionPoint(questionId)){
            followupAnswer = renderer.getCurrentFollowupAnswer();
        }
    }
    if (followupAnswer == undefined || followupAnswer == "\"\"") {
        renderer.expressMissingQuestionInfoMessage();
        return;
    }
    renderer.removeMissingQuestionInfoMessage();

    var logLine = templateMap["button-save"];
    logLine = logLine.replace("<CLCK_STEP>", currentStep);
    logLine = logLine.replace("<Q_INDEX_STEP>", currentQuestionIndexAtStep);
    logLine = logLine.replace("<USR_TXT_Q1>", answer);
    logLine = logLine.replace("<USR_TXT_Q2>", followupAnswer);
    logLine = logLine.replace("<USR_CLCK_Q>", clickInfo);
    targetClickHandler(e, logLine);

    renderer.forgetQuestion();
    currentExplManager.noteQuestionWasAnswered();
    if (squim.hasMoreQuestionsAtThisStep()) {
        renderState(gameboard_canvas, masterEntities, gameScaleFactor, 0, 0, true);
        asqm.poseNextQuestion();
    }
    else {
        if (squim.hasMoreQuestions()){
            if (getStepFromQuestionId(asqm.mostRecentlyPosedQuestion) == "summary"){
                if (!controlsManager.isPauseButtonDisplayed()){ // don't draw arrow if playing
                    renderer.renderCueAndArrowToPlayButton();
                }
                
            }
            else {
                if (!controlsManager.isPauseButtonDisplayed()){ // don't pause or draw arrow if playing
                    if (userInputBlocked == false) {
                        pauseGame();
                    }
                    renderer.renderCueAndArrowToPlayButton();
                }
            }
            
        }
        asqm.allQuestionsAtDecisionPointAnswered = true;
        if (squim.hasMoreQuestions()){
            // wait for play button to take us to next Decision Point
            controlsManager.enablePauseResume();
        } 
        else {
            if (tabManager.hasNextTab()){
                tabManager.nextTab();
            }
            else {
                // renderer.poseThankYouScreen();
            }
        }
        asqm.accessManager.setQuestionState("answered");
    }
    asqm.accessManager.express();
    //currentExplManager.removeOverlaysAndOutlines();
}
