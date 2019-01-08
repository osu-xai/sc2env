
function getStateMonitor() {
    sm = {};

    sm.logFileName = undefined;
    sm.currentReplayFileName = undefined;
    sm.sentHeader = false;
    sm.clickListener = undefined;
    sm.mostRecentLogLine = undefined;

    sm.setClickListener = function(cl){
        this.clickListener = cl;
    }
    sm.emitLogLine = function (logLine) {
        if (this.logFileName != undefined) {
            if (!this.sentHeader) {
                var pkt = new proto.scaii.common.ScaiiPacket;
                var lfeHeader = new proto.scaii.common.LogFileEntry;
                var header = this.getHeader();
                lfeHeader.setEntry(header);
                lfeHeader.setFilename(this.logFileName);
                lfeHeader.setIsLastLine(false);
                pkt.setLogFileEntry(lfeHeader);
                userInfoScaiiPackets.push(pkt);
                this.sentHeader = true;
            }
            var pkt = new proto.scaii.common.ScaiiPacket;
            var lfe = new proto.scaii.common.LogFileEntry;
            var date = this.getDate();
            var time = this.getTime();
            var sec = this.getSecondsSince1970();

            logLine = logLine.replace("<FILE_NAME>", this.currentReplayFileName);
            logLine = logLine.replace("<DATE>", date);
            logLine = logLine.replace("<TIME>", time);
            logLine = logLine.replace("<1970_SEC>", sec);
            
            logLine = this.setState(logLine);
            lfe.setEntry(logLine);
            lfe.setFilename(this.logFileName);
            if (studyQuestionIndexManager.hasMoreQuestions()) {
                lfe.setIsLastLine(false);
            }
            else {
                lfe.setIsLastLine(true);
            }
            pkt.setLogFileEntry(lfe);
            userInfoScaiiPackets.push(pkt);
            if (this.clickListener != undefined) {
                if (logLine.includes("userClick")){
                    this.clickListener.acceptClickInfo(logLine);
                }
            }
            this.mostRecentLogLine = logLine;
            return logLine;
        }
    }
    sm.getMostRecentLogLine = function () {
        return this.mostRecentLogLine;
    }

    sm.getDate = function () {
        var dt = new Date();
        var month = dt.getMonth() + 1;
        var day = dt.getDate();
        var year = dt.getFullYear();
        return month + '-' + day + '-' + year;
    }
    sm.getTime = function () {
        var d = new Date();
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    }

    sm.getSecondsSince1970 = function () {
        var d = new Date();
        return d.getTime();
    }
    //
    // saliency
    //
    sm.combinedSaliency = false;
    sm.detailedSaliency = false;

    sm.showedCombinedSaliency = function () {
        this.combinedSaliency = true;
        this.detailedSaliency = false;
    }

    sm.showedDetailedSaliency = function () {
        this.combinedSaliency = false;
        this.detailedSaliency = true;
    }

    sm.getWaitForResearcherStart = function () {
        var logLine = templateMap["waitForResearcherStart"];
        logLine = logLine.replace("<CONTINUE_BUTTON>", "yes");
        logLine = logLine.replace("<REGION>", "waitScreen");
        logLine = logLine.replace("<TARGET>", "enter-wait-screen");
        return logLine
    }
    sm.getWaitForResearcherEnd = function () {
        var logLine = templateMap["waitForResearcherEnd"]
        logLine = logLine.replace("<CONTINUE_BUTTON>", "yes");
        logLine = logLine.replace("<REGION>", "waitScreen");
        logLine = logLine.replace("<TARGET>", "user-wait-button-continue");
        return logLine
    }

    sm.getSaliencyHeader = function () {
        return "combinedSaliency,detailedSaliency,"
    }
    sm.getSaliencyState = function () {
        return this.combinedSaliency + "," + this.detailedSaliency + ",";
    }
    sm.setSaliencyState = function (logLine) {
        logLine = logLine.replace("<CMB_SALNCY>", this.combinedSaliency);
        logLine = logLine.replace("<DTL_SALNCY>", this.detailedSaliency);
        return logLine;
    }
    //
    // rewards
    //
    sm.combinedReward = false;
    sm.detailedReward = false;
    sm.combinedAdvantage = false;
    sm.detailedAdvantage = false;

    sm.clearRewards = function () {
        this.combinedReward = false;
        this.detailedReward = false;
        this.combinedAdvantage = false;
        this.detailedAdvantage = false;
    }

    var keyToIndexMap = {};
    keyToIndexMap["rewards.combined"] = "combinedReward";
    keyToIndexMap["rewards.detailed"] = "detailedReward";
    keyToIndexMap["advantage.combined"] = "combinedAdvantage";
    keyToIndexMap["advantage.detailed"] = "detailedAdvantage";
    sm.setRewardDisplayModeByKey = function(displayModeKey){
        this.clearRewards();
        var codedIndex = keyToIndexMap[displayModeKey];
        this[codedIndex] = true;
    }
    sm.showedCombinedRewards = function () {
        this.clearRewards();
        this.combinedReward = true;
    }

    sm.showedDetailedRewards = function () {
        this.clearRewards();
        this.detailedReward = true;
    }

    sm.showedCombinedAdvantage = function () {
        this.clearRewards();
        this.combinedAdvantage = true;
    }

    sm.showedDetailedAdvantage = function () {
        this.clearRewards();
        this.detailedAdvantage = true;
    }

    sm.getRewardHeader = function () {
        return "combinedReward,detailedReward,combinedAdvantage,detailedAdvantage,"
    }
    sm.getRewardState = function () {
        return this.combinedReward + "," + this.detailedReward + "," + this.combinedAdvantage + "," + this.detailedAdvantage + ",";
    }
    sm.setRewardState = function(logLine) {
        logLine = logLine.replace("<CMB_RWRD>", this.combinedReward);
        logLine = logLine.replace("<DTL_RWRD>", this.detailedReward);
        logLine = logLine.replace("<CMB_ADV>", this.combinedAdvantage);
        logLine = logLine.replace("<DTL_ADV>", this.detailedAdvantage);
        return logLine;
    }

    //
    //  general
    //
    sm.userAction = undefined;
    sm.questionId = undefined;
    sm.decisionPoint = undefined;

    sm.setUserAction = function (logLine) {
        if (userStudyMode) {
            //this.userAction = ua;
            this.emitLogLine(logLine);
        }
    }

    sm.setQuestionId = function (qid) {
        this.questionId = qid;
    }

    sm.setDecisionPoint = function (dp) {
        this.decisionPoint = dp;
    }
    sm.getGeneralHeader = function () {
        return "date,time,secSince1970,decisionPoint,questionId,userAction,";
    }

    sm.getGeneralState = function () {
        return this.decisionPoint + "," + this.questionId + "," + this.userAction + ",";
    }
    sm.setGeneralState = function (logLine) {
        logLine = logLine.replace("<DP>", this.decisionPoint);
        logLine = logLine.replace("<Q_ID>", this.questionId);
        return logLine;
    }
    //
    // alltogether
    //

    sm.getHeader = function () {
        return this.getGeneralHeader() + this.getRewardHeader() + this.getSaliencyHeader();
    }

    sm.getState = function () {
        return this.getGeneralState() + this.getRewardState() + this.getSaliencyState();
    }
    sm.setState = function (logLine) {
        logLine = this.setGeneralState(logLine);
        logLine = this.setRewardState(logLine);
        logLine = this.setSaliencyState(logLine);
        return logLine;
    }
    sm.getStateLogEntry = function (date, time, sec) {
        return date + "," + time + ',' + sec + "," + this.getState();
    }
    return sm;
}
