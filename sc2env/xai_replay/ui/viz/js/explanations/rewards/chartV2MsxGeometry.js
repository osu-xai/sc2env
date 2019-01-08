function addMsxGeometryFunctions(rawChartData) {
    var rd = rawChartData

    rd.initMsxChartDimensions = function (canvasHeight, canvasWidth, groupWidthMarginFactor, rewardSpacerWidth) {
            rd.canvasHeight = canvasHeight;
            rd.canvasWidth = canvasWidth;
            rd.widthAvailableForGroup = Math.floor(rd.canvasWidth / 2);
            rd.groupWidthMargin = Math.floor((rd.widthAvailableForGroup * groupWidthMarginFactor) / 2);
            rd.widthAvailableForRewardBars = Math.floor(rd.widthAvailableForGroup - (3 * rd.groupWidthMargin));
            rd.widthAvailableForRewardBar = Math.floor(rd.widthAvailableForRewardBars / rd.rewardNames.length);
            rd.rewardBarWidth = Math.floor(rd.widthAvailableForRewardBar - (rewardSpacerWidth));
            //biggest bar should take up .75 of canvasHeight/2  (120 * scalingFactor == 3/4 * canvasHeight/2) (we assumed scalingFactor == 2)
            rd.scalingFactor = ( ((rd.canvasHeight / 2) * 0.75) / rd.getMaxAbsoluteValueReward() ).toFixed(2);
    }

    rd.positionMsxRewardBar = function (maxValueAction, rewardBar, actionIndex, rewardIndex) {
            //bar.originX = i*widthAvailableForGroup + ((groupWidthMargin*2) * (i+1)) + j *(rewardBarWidth)
            //bar.originY = canvasHeight/2 ==> constant 320.0

            if (maxValueAction == true) {
                rewardBar.originX = Math.floor((rd.groupWidthMargin * 2) + (rewardIndex * rd.rewardBarWidth));
            } else {
                rewardBar.originX = Math.floor(rd.widthAvailableForGroup + rd.groupWidthMargin + (rewardIndex * rd.rewardBarWidth));
            }
            rewardBar.originY = rd.canvasHeight / 2;

        }

    return rd;
}