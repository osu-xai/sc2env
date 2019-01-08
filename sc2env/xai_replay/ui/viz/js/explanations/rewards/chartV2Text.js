function addTextFunctions(chart) {
    var ch = chart;

    ch.chartTitles= {};
    ch.chartTitles["detailedRewards"] = "Rewards Predicted For Each Action";

    
    ch.getTitle = function(mode) {
        return this.chartTitles[mode];
    }

    ch.getLegendTextForRewardName = function(rewardName){
        return rewardName;
    }

    ch.getBarTooltipTextForRewardName = function(rewardName){
        return "bar tooltip for " + rewardName;
    }

    ch.getLegendTooltipTextForRewardName = function(rewardName) {
        return "legend tooltip for " + rewardName;
    }
    ch.getSaliencyRowLabel = function(bar) {
        return bar.fullName.replace(".", " ");
    }
    return ch;
}