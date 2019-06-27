var hasShownWelcomeScreen = false;

function showUserIdScreen(){
    var userIdDiv = document.createElement("DIV");
    userIdDiv.setAttribute("id", "user-id-div");
    userIdDiv.setAttribute("class", "flex-column");
    userIdDiv.setAttribute("style", "position:absolute;left:0px;top:0px;z-index:" + zIndexMap["allTheWayToFront"] + ";margin:auto;font-family:Arial;padding:10px;width:1800px;height:1600px;background-color:white;");
    $('body').append(userIdDiv);

    var questionRow = document.createElement("DIV");
    questionRow.setAttribute("id", "user-id-question-row");
    questionRow.setAttribute("class", "flex-row");
    questionRow.setAttribute("style", "margin-top:150px;font-family:Arial;padding:10px;");
    $("#user-id-div").append(questionRow);
    
    var question = document.createElement("DIV");
    question.setAttribute("id", "user-id-question");
    question.setAttribute("style", "margin-left:100px;font-family:Arial;font-size:70px;padding:10px;");
    if (isTutorial()){
        question.innerHTML = "Welcome to the XAI User Study.<br><br>  Your participant ID is:  " + activeStudyQuestionManager.userId;
    }
    else {
        question.innerHTML = "Please wait for the researcher to signal when to begin.";
    }
    $("#user-id-question-row").append(question);

    // var userIdText = document.createElement("DIV");
    // userIdText.setAttribute("id", "user-id-answer");
    // userIdText.setAttribute("style", "margin:auto;font-family:Arial;font-size:18px;padding:10px;");
    // userIdText.innerHTML = ;
    
    // $("#user-id-question-row").append(userIdText);

    var buttonRow = document.createElement("DIV");
    buttonRow.setAttribute("id", "user-id-button-row");
    buttonRow.setAttribute("class", "flex-row");
    buttonRow.setAttribute("style", "margin-top:60px;font-family:Arial;padding:10px;");
    $("#user-id-div").append(buttonRow);

    var next = document.createElement("BUTTON");
    next.setAttribute("id", "user-id-button-next");
    next.setAttribute("style", "margin-left:280px;font-family:Arial;font-size:18px;padding:10px;");
    next.innerHTML = "Start";
    next.onclick = function() {
        clearUserIdScreen();
        //SC2_DEFERRED var logLine = stateMonitor.getWaitForResearcherEnd()
        //SC2_DEFERRED stateMonitor.setUserAction(logLine);
    }
    $("#user-id-button-row").append(next);
    hasShownWelcomeScreen = true;
}

function clearLoadingScreen(){
    $("#loading-div").remove();
}

function showLoadingScreen(loadingMessage){
    var loadingDiv = document.createElement("DIV");
    loadingDiv.setAttribute("id", "loading-div");
    loadingDiv.innerHTML = loadingMessage;
    $('body').append(loadingDiv);
    $("#loading-div").css("position","absolute");
    $("#loading-div").css("left","0px");
    $("#loading-div").css("top","0px");
    $("#loading-div").css("z-index",zIndexMap["allTheWayToFront"]);
    $("#loading-div").css("padding-left","100px");
    $("#loading-div").css("padding-top","150px");
    $("#loading-div").css("font-family","Arial");
    $("#loading-div").css("font-size","18px");
    $("#loading-div").css("width","1800px");
    $("#loading-div").css("height","1600px");
    if (false){
        $("#loading-div").css("width","200px");
        $("#loading-div").css("height","200px");
    }
    $("#loading-div").css("background-color","white");
    $("#loading-div").css("position","absolute");
}
function escapeAnswerFileDelimetersFromTextString(s) {
    s = s.replace(/,/g, "ESCAPED-COMMA");
    s = s.replace(/_/g, "ESCAPED-UNDERSCORE");
    s = s.replace(/:/g, "ESCAPED-COLON");
    s = s.replace(/;/g, "ESCAPED-SEMICOLON");
    s = s.replace(/\(/g, "ESCAPED-LEFT-PARENTH");
    s = s.replace(/\)/g, "ESCAPED-RIGHT-PARENTH");
    s = s.replace(/\n/g, "ESCAPED-NEWLINE");
    return s;
}

function getCoordForStartOfArrowText() {
    var pos = $("#arrow-text").offset();
    var result = {};
    result.x = pos.left + 200;
    result.y = pos.top;
    return result;
}

function getCoordsForPlayButton() {
    var pos = $("#pauseResumeButton").offset();
    var result = {};
    result.x = pos.left;
    result.y = pos.top + $("#pauseResumeButton").height();
    return result;
}
function drawArrow(startCoords, endCoords){
    var fromx = startCoords.x;
    var fromy = startCoords.y;
    var tox = endCoords.x;
    var toy = endCoords.y;
    var width = $("#game-titled-container").width();
    var height = $("#game-titled-container").height();
    //variables to be used when creating the arrow
    var c = document.createElement("canvas");
    c.setAttribute("id", "cue-arrow-div");
    c.setAttribute("width", width + "px");
    c.setAttribute("height", height + "px");
    c.setAttribute("style", "position:absolute;z-index:" + zIndexMap["arrow"] + ";top:0px;left:0px;pointer-events: none;");
    $("body").append(c);
    var ctx = c.getContext("2d");
    var headlen = 10;

    var angle = Math.atan2(toy-fromy,tox-fromx);

    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.strokeStyle = "#cc0000";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#cc0000";
    ctx.fill();
}
function ensureStudyControlScreenIsWideEnough(){
    var interfaceWidth = $("#scaii-interface").width();
    var saliencyWidth = $("#saliency-div").width();
    var width = Math.max(interfaceWidth, saliencyWidth);
    $("#user-id-div").css("width","" + width);
}

function clearQuestionControls(){
	//$("#why-radios").empty();
	$("#what-button-div").empty();
	$("#reward-question-selector").empty();
	$("#why-label").html(" ");
}