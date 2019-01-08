chartClickProcessing = false;
rememberedGlobalChartClick = undefined;
function getUserActionMonitor() {
    uam = {};

    uam.clickRegionDetails = undefined;
    uam.clickTargetDetails = undefined;
    uam.userActionSemantics = undefined;
    uam.pendingLogLine = undefined;


    setHandlers();
    deleteUnwantedControls();

    
    uam.setUserActionSemantics = function(info) {
        // only accept the first one in this click event bubbling epoch.
        // this lets us keep the most specific click info
        if (this.userActionSemantics == undefined) {
            this.userActionSemantics = info;
        }
    }
    
    uam.setUserActionHoverSemantics = function(info) {
        // always accept the most recent one
        this.userActionSemantics = info;
    }

    uam.regionClick = function(info) {
        if (this.clickRegionDetails == undefined) {
            this.clickRegionDetails = info;
        }
        if (this.pendingLogLine == undefined) {
            this.pendingLogLine = templateMap["userClick"];
            this.pendingLogLine = this.pendingLogLine.replace("<TARGET>", "NA");
            this.pendingLogLine = this.pendingLogLine.replace("<TARGET_DTL>", "NA");
        }
        this.pendingLogLine = this.pendingLogLine.replace("<REGION>", info);
    }
    
    uam.targetClick = function(info) {
        if (this.clickTargetDetails == undefined) {
            this.clickTargetDetails = info;
        }
        this.pendingLogLine = templateMap[info];
        this.pendingLogLine = this.pendingLogLine.replace("<TARGET>", info);
    }
    
    uam.targetHover = function(info) {
        this.clickTargetDetails = info;
    }

    uam.globalClick = function(x,y) {
        if (chartClickProcessing) {
            rememberedGlobalChartClick = [x,y];
            finishChartClickProcessing(x,y);
            return;
        }
        if (this.pendingLogLine == undefined) {
            this.pendingLogLine = templateMap["userClick"];
            this.pendingLogLine = this.pendingLogLine.replace("<TARGET>", "NA");
            this.pendingLogLine = this.pendingLogLine.replace("<TARGET_DTL>", "NA");
        }
        var logLine = this.pendingLogLine.replace("<COORD_X>", x);
        logLine = logLine.replace("<COORD_Y>", y);
        if (logLine.indexOf("<REGION>") != -1 && (x > 602 || y > 798))  {
            logLine = logLine.replace("<REGION>", "scaii-interface");
        }
        logLine = stateMonitor.emitLogLine(logLine);
        this.clear();
    }
    uam.clear = function() {
        this.clickRegionDetails = undefined;
        this.clickTargetDetails = undefined;
        this.userActionSemantics = undefined;
        this.pendingLogLine = undefined;
        rememberedGlobalChartClick = undefined;
    }
    uam.compileChartClickEvent = function(){
        if (rememberedGlobalChartClick == undefined) {
            // this can happend because we can get here without clicking due to the way the chart had to be instrumented
            return;
        }
        var logLine = this.pendingLogLine.replace("<COORD_X>", rememberedGlobalChartClick[0]);
        logLine = logLine.replace("<COORD_Y>", rememberedGlobalChartClick[1]);
        
        if (this.clickListener != undefined) {
            this.clickListener.acceptClickInfo(this.pendingLogLine);
        }
        stateMonitor.setUserAction(logLine);
        this.clear();
    }

    uam.appendClickRegionDetails = function(s) {
        if (this.clickRegionDetails != undefined) {
            s = s + this.clickRegionDetails + ";";
            clickReqionDetails = undefined;
        }
        else {
            var logLine = this.pendingLogLine.replace("<REGION>", "NA");
            s = s + "NA;";
        }
        return logLine; //was: s
    }
    uam.appendClickTargetDetails = function(s) {
        if (this.clickTargetDetails != undefined) {
            s = s + this.clickTargetDetails + ";";
            clickTargetDetails = undefined;
        }
        else {
            var logLine = this.pendingLogLine.replace("<TARGET>", "NA");
            s = s + "NA;";
        }
        return logLine; //was: s
    }

    uam.appendUserActionSemantics = function(s) {
        if (this.userActionSemantics != undefined) {
            s = s + this.userActionSemantics;
            userActionSemantics = undefined;
        }
        else {
            var logLine = this.pendingLogLine.replace("<TARGET_DTL>", "NA");
            s = s + "NA";
        }
        return logLine; //was: s
    }
    uam.forwardHoverEvent = function() {
        var hoverText = "";
        if (this.userActionSemantics != undefined) {
            hoverText = hoverText + this.userActionSemantics;
            userActionSemantics = undefined;
        }
        else {
            hoverText = hoverText + "NA";
        }
        console.log("hoverText... " + hoverText);
        stateMonitor.setUserAction(hoverText);
        
        this.clickRegionDetails = undefined;
        this.clickTargetDetails = undefined;
        this.userActionSemantics = undefined;
    } 

    uam.stepToDecisionPoint = function(dp) {
        var logLine = templateMap["stepIntoDecisionPoint"];
        logLine = logLine.replace("<DP_NUM>", dp)
        stateMonitor.setUserAction(logLine);
    }

    uam.extractClickCoordinatesFromClickEvent =function(logLine){
        if (logLine == undefined){
            return undefined;
        }
        // see templateMap["gameboard"]
        if (logLine.indexOf('clickEntity') != -1){
            // it's an entity click
            var fields = logLine.split(',');
            for (var i in fields){
                var field = fields[i];
                if (field.includes('userClick')){
                    var subFields = field.split(';');
                    for (var j in subFields){
                        var subField = subFields[j];
                        if (subField.startsWith('clickEntity')){
                            // coordinates are in second subSubField
                            var clickEntityValueParts = subField.split(':')[1];
                            var valueArgs = clickEntityValueParts.split('_');
                            return [valueArgs[2], valueArgs[3]];
                        }
                    }
                }
            }
        }
        return undefined;
    }
    return uam;
}

function globalClickHandler(e) {
    userActionMonitor.globalClick(e.clientX, e.clientY);
}

function regionClickHandlerSaliency(e) { 
    userActionMonitor.regionClick("saliency");
}
function regionClickHandlerRewards(e)  { userActionMonitor.regionClick("rewards");}
function regionClickHandlerGameArea(e) { userActionMonitor.regionClick("gameArea");}
function regionClickHandlerQnAArea(e)  { userActionMonitor.regionClick("QnA");}

function targetClickHandler(e, logLine) {
    if (userStudyMode){
        var targetId = undefined;
        if (e.currentTarget != undefined) {
            targetId = e.currentTarget.getAttribute("id");
        }
        else {
            targetId = e.target.getAttribute("id");
        }
        logLine = logLine.replace("<TARGET>", targetId);
        userActionMonitor.pendingLogLine = logLine;
    }
}

function specifiedTargetClickHandler(targetName, logLine) {
    if (userStudyMode){
        logLine = logLine.replace("<TARGET>", targetName);
        userActionMonitor.pendingLogLine = logLine;
    }
}

function chartTargetClickHandler(targetName , logLine) {
    if (userStudyMode){
        logLine = logLine.replace("<TARGET>", targetName);
        userActionMonitor.pendingLogLine = logLine;
        userActionMonitor.compileChartClickEvent();
    }
}

function targetHoverHandler(e, logLine) {
    if (userStudyMode){
        if (userActionMonitor != undefined) {
            var targetId = e.currentTarget.getAttribute("id");
            logLine = logLine.replace("<TARGET>", targetId);
            var mostRecentLogLine = stateMonitor.getMostRecentLogLine();
            if (mostRecentLogLine != undefined){
                if(mostRecentLogLine.search != undefined && mostRecentLogLine.includes("hideEntityTooltips") && logLine.includes("hideEntityTooltips")) {
                    userActionMonitor.mostRecentLogLine = undefined;
                    userActionMonitor.clear();
                } else {
                    userActionMonitor.pendingLogLine = logLine;
                    stateMonitor.setUserAction(logLine);
                    userActionMonitor.clear();
                }
            }
        }
    }
}

function deleteUnwantedControls(){
    //$("#action-list").empty();
   // $("#action-list").css("height","20px");
}
function setHandlers() {
    $("#scaii-interface")         .on("click",globalClickHandler);
    $("#game-titled-container")   .on("click",regionClickHandlerGameArea);
    $('#q-and-a-div')             .on("click",regionClickHandlerQnAArea);
    $("#scaii-acronym")           .on("click",function(e) {
        var logLine = templateMap["scaii-acronym"];
        logLine = logLine.replace("<TCH_ACRONYM>", "NA");
        targetClickHandler(e, logLine);
    });
    $("#game-replay-label")       .on("click",function(e) {
        var logLine = templateMap["game-replay-label"];
        logLine = logLine.replace("<RPL_GAME_FILE>", "NA");
        targetClickHandler(e, logLine);
    });
    $("#replay-file-selector")    .on("click",function(e) {
        var logLine = templateMap["game-replay-label-selector"];
        logLine = logLine.replace("<RPL_GAME_SLCTR>", "NA"); 
        targetClickHandler(e, logLine);
    });
    $("#step-value")              .on("click",function(e) {
        var logLine = templateMap["touch-step-progress-label"];
        logLine = logLine.replace("<RPL_GAME_PRGSS>", "NA");
        targetClickHandler(e, logLine);
    });
   
}
function finishChartClickProcessing(x,y) {
    var div = document.getElementById("explanations-rewards");
    if (div == undefined) { return;}
    var rect = div.getBoundingClientRect();
    if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
        chartClickProcessing = true;
        if (rememberedGlobalChartClick != undefined) {
            userActionMonitor.regionClick("rewards");
            userActionMonitor.compileChartClickEvent();
        }
    }
    else {
        chartClickProcessing = false;
    }
}

function getShapeLogString(isFriend, type,hitPoints, maxHitPoints){
    var result;
    if (isFriend){
        result = "friendly-";
    }
    else {
        result = "enemy-";
    }
    //result = result + type + "-" + hitPoints + "-" + maxHitPoints;
    result = result + type;
    return result;
}