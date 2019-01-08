
function addGeometryFunctions(rawChartData) {
    var rd = rawChartData;

    //added variables here
    rd.canvasHeight                 = undefined;
    rd.canvasWidth                  = undefined;
    rd.scalingFactor                = undefined;
    rd.widthAvailableForGroup       = undefined;
    rd.groupWidthMargin             = undefined;
    rd.widthAvailableForRewardBars  = undefined;
    rd.widthAvailableForRewardBar   = undefined;
    rd.rewardSpacerWidth            = undefined;
    rd.rewardBarWidth               = undefined;
    rd.xAxisOriginX                 = undefined;
    rd.xAxisOriginY                 = undefined;
    rd.xAxisLength                  = undefined;
    rd.yAxisOriginX                 = undefined;
    rd.yAxisOriginY                 = undefined;
    rd.yAxisLength                  = undefined;
    rd.actionLinesOriginX           = [];
    rd.actionLinesOriginY           = undefined;
    rd.actionLineLength             = undefined;
    rd.positiveLineOriginY          = [];
    rd.positiveLineLength           = undefined;
    rd.positiveLineOriginX          = undefined;
    rd.positiveMarkerValues         = [];
    rd.positiveMarkerYPixelsFromXAxis   = [];
    for (var i in rd.actions) {
        rd.actions[i].actionLabelOriginX    = undefined;
    }

    rd.initChartDimensions = function (canvasHeight, canvasWidth, groupWidthMarginFactor, rewardSpacerWidth) {
        this.rewardSpacerWidth = rewardSpacerWidth;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.widthAvailableForGroup = Math.floor(this.canvasWidth / this.actions.length);
        this.groupWidthMargin = Math.floor((this.widthAvailableForGroup * groupWidthMarginFactor) / 2);
        this.widthAvailableForRewardBars = Math.floor(this.widthAvailableForGroup - 2 * this.groupWidthMargin);
        this.widthAvailableForRewardBar = Math.floor(this.widthAvailableForRewardBars / this.rewardNames.length);
        this.rewardBarWidth = Math.floor(this.widthAvailableForRewardBar - 2 * rewardSpacerWidth);
        this.scalingFactor = ((canvasHeight / 2) * 0.75 / this.getMaxAbsRewardOrActionValue()).toFixed(2);
    }

    rd.positionActionSeparatorLines = function() {
        // acitonLinesLength = maxAbsRewardValue * 2 * scalingFactor + aBitMore
        // actionLinesOriginX
        // actionLinesOriginY = (canvasHeight - yAxisLength) / 2
        this.actionLinesLength = Math.floor(this.getMaxAbsRewardOrActionValue() * 2 * this.scalingFactor + 10);
        var actionLineBasedOffYAxis = this.getMaxAbsRewardOrActionValue() * 2 * this.scalingFactor + 10;
        this.actionLinesOriginY = (this.canvasHeight - actionLineBasedOffYAxis) / 2;
        for (var i = 1; i < this.actions.length; i++) {
            this.actionLinesOriginX.push(this.widthAvailableForGroup * i);
        }
    }

    rd.positionXAxisLine = function(){
        // xAxisLength = width - 2 * groupWidthMargin
        // xAxisOriginX = groupWidthMargin;
        // xAxisOriginY = height / 2
        this.xAxisLength = this.canvasWidth - 2 * this.groupWidthMargin;
        this.xAxisOriginY = this.canvasHeight / 2;
        this.xAxisOriginX = this.groupWidthMargin;
    }

    rd.positionYAxisLine = function(){
        // yAxisLength = maxAbsRewardValue * 2 * scalingFactor + aBitMore
        // yAxisOriginX = groupWidthMargin;
        // yAxisOriginY = (canvasHeight - yAxisLength) / 2
        this.yAxisLength = this.getMaxAbsRewardOrActionValue() * 2 * this.scalingFactor + 10;
        this.yAxisOriginY = (this.canvasHeight - this.yAxisLength) / 2;
        this.yAxisOriginX = this.groupWidthMargin;
    }

    rd.positionRewardBar = function (rewardBar, actionIndex, rewardIndex) {
        //what is passed: ch.actionRewardForNameMap["action_0.reward_0"] & action number
        //204 widthAvailableForGroup == canvasWidth / actionCount 
        //groupWidthMargin = (widthAvailableForGroup * .2) / 2
        //bar.originX = i*widthAvailableForGroup + groupWidthMargin + j *(rewardBarWidth)
        //bar.originY = canvasHeight/2 ==> constant 320.0
        rewardBar.originX = Math.floor(actionIndex * this.widthAvailableForGroup + this.groupWidthMargin + rewardIndex * this.rewardBarWidth);
        rewardBar.originY = this.canvasHeight / 2;
    }

    rd.dimensionRewardBar = function (rewardBar) {
        //ch.actionRewardForNameMap["action_0.reward_0"]
        //widthAvailableForRewardBars = widthAvailableForGroup - 2 * groupWidthMargin
        //widthAvailableForRewardBar = widthAvailableForRewardBars / rewardBarCount
        rewardBar.height = Math.abs(rewardBar.value * this.scalingFactor);
        rewardBar.width = this.rewardBarWidth;
    }

    rd.positionActionBar = function (actionBar, action) {
        //ch.actionForNameMap["action_0"]
    	// x coord == groupWidthmargin + i * (widthAvailableForGroup)
    	// y coord == the axis location == canvas_height / 2
        actionBar.originX = this.groupWidthMargin + action * this.widthAvailableForGroup;
        actionBar.originY = this.canvasHeight / 2;
    }


    rd.dimensionActionBar = function (actionBar) {
        //ch.actionForNameMap["action_0"]
        var total = 0;
        for (var i in actionBar.bars) {
            total += actionBar.bars[i].value;
        }
        actionBar.height = Math.abs(total * this.scalingFactor);
        actionBar.width = this.widthAvailableForRewardBars;
        actionBar.value = total;
    }

    rd.positionActionLabels = function(minDistanceFromBarOrAxis) {
        var maxAbsValNegReward = this.getMaxAbsValNegativeReward();
        var maxAbsValNegativeAction = this.getMaxAbsValNegativeAction();
        var maxAbsValNegBar = Math.max(maxAbsValNegReward, maxAbsValNegativeAction);
        var actionLabelY = undefined;
        if (maxAbsValNegBar == undefined){
            actionLabelY = this.canvasHeight / 2 + minDistanceFromBarOrAxis;
        }
        else if (maxAbsValNegBar < minDistanceFromBarOrAxis){
            actionLabelY = this.canvasHeight / 2 + minDistanceFromBarOrAxis;
        }
        else {
            actionLabelY = this.canvasHeight / 2 + maxAbsValNegBar * this.scalingFactor + minDistanceFromBarOrAxis;
        }
        for (var i in this.actions){
            var action = this.actions[i];
            //groupWidthMargin + i * widthAvailableForGroup +  widthAvailableForRewardBars / 2
            action.actionLabelOriginX = this.groupWidthMargin + Number(i)* this.widthAvailableForGroup + this.widthAvailableForRewardBars / 2;
            action.actionLabelOriginY = actionLabelY;
        }
    }

    rd.positionValueMarkers = function (numberOfLines) {
        this.positiveMarkerValues = [numberOfLines];
        this.positiveMarkerYPixelsFromXAxis = [numberOfLines];
        var valueMarkers = Math.floor(this.getMaxAbsRewardOrActionValue() / numberOfLines);
        var setValue = valueMarkers;
        for (var i=0; i < numberOfLines; i++) {
            this.positiveMarkerValues[i] = setValue;
            this.positiveMarkerYPixelsFromXAxis[i] = (setValue * this.scalingFactor).toFixed(2);
            setValue += valueMarkers;
        }
    }

    rd.positionValueLines = function (numberOfLines) {
        var length = this.canvasWidth - this.groupWidthMargin * 2;
        this.positiveLine = [numberOfLines];
        var lineSpacing = Math.floor(this.getMaxAbsRewardOrActionValue() / numberOfLines * this.scalingFactor);
        this.positiveLineLength = this.canvasWidth - 2 * this.groupWidthMargin;
        this.positiveLineOriginX = this.groupWidthMargin;
        for (var i = 0; i < numberOfLines; i++) {
            this.positiveLine[i] = {};
            this.positiveLineOriginY[i] = ((this.canvasHeight / 2) + (1 + Number(i)) * lineSpacing).toFixed(2);
        }
    }
    rd.positionTooltips = function(){
        for (var i in this.actionRewardNames) {
            var actionRewardName = this.actionRewardNames[i];
            var rewardBar = this.actionRewardForNameMap[actionRewardName];
            //originX + rewardBarWidth

            rewardBar.tooltipOriginX = rewardBar.originX + this.rewardBarWidth;
            // (canvasHeight / 2) - ((ch.rewardBar[i].bars[j].value * scalingFactor) * 0.75)
            rewardBar.tooltipOriginY = this.canvasHeight/2 - rewardBar.value * this.scalingFactor * 0.75; 
        }
    }
    rd.positionValueTooltips = function() {
        for (var i in this.actionRewardNames) {
            var actionRewardName = this.actionRewardNames[i];
            var rewardBar = this.actionRewardForNameMap[actionRewardName];


            rewardBar.tooltipOriginX = rewardBar.originX - Number(this.rewardBarWidth / 2);
            // (canvasHeight / 2) - ((ch.rewardBar[i].bars[j].value * scalingFactor) * 0.75)
            if (rewardBar.value >= 0) {
                rewardBar.tooltipOriginY = this.canvasHeight/2 - (rewardBar.value + 30) * this.scalingFactor; 
            } else {
                rewardBar.tooltipOriginY = this.canvasHeight/2 - (rewardBar.value) * this.scalingFactor; 
            }
        }
    }
    rd.getActionBarNameForCoordinates = function(x,y) {
        for (var i in this.actionRewardNames){
            var barName = this.actionRewardNames[i];
            var bar = this.actionRewardForNameMap[barName];
            var isHeightNegative = true;
            if (bar.value > 0){
                isHeightNegative = false;
            }
            if (this.isPointInsideBox(x, y, bar.originX, bar.originY, bar.width, bar.height, isHeightNegative)){
                return bar.fullName;
            }
        }
        return "None";
    }
    rd.isPointInsideBox = function(x, y, originX, originY, width, height, isHeightNegative){
        if (x < originX || x > originX + width){
            return false;
        }
        if (isHeightNegative){
            // height is negative which means maxY is > originY
            if (height < 5) {
                if (y > (originY - 8) || y < (originY + height + 8)) {
                    return true;
                }
            } else if (y < originY || y > (originY + height)) {
                return false; // its outside a negative bar
            }
        }
        else {
            // height is positive which means maxY is < originY
            if (height < 5) {
                if (y < (originY + 8) || y > (originY - height - 8)) {
                    return true;
                }
            } else if (y > originY || y < (originY - height)) {
                return false;  // it's outside a positive bar
            }
        }
        return true;
    }
    return rd;
}