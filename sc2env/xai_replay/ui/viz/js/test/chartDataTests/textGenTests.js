function runChartDataTextTests(failureChecker) {
  // test saliency row label generation
    var ch = addUtilityFunctions(buildDummyChart(3));
    var fc = failureChecker;    
    fc.setTestName("chartDataTextTests");
    ch = addTextFunctions(ch);

    fc.setCase("test Title");
    fc.assert(ch.getTitle("detailedRewards"), "Rewards Predicted For Each Action", "title text detailedRewards");

    fc.setCase("labels for action");
    fc.assert(ch.actions[0].name, "action_0", "action label action_0");
    fc.assert(ch.actions[1].name, "action_1", "action label action_1");
    fc.assert(ch.actions[2].name, "action_2", "action label action_2");
    fc.assert(ch.actions[3].name, "action_3", "action label action_3");

    fc.setCase("legend text");
    //Do we have to check this?? why not just pull from rewardBarNames???
    fc.assert(ch.getLegendTextForRewardName("rewardX"), "rewardX", "legend names 0");
    var rewardBar = ch.actionRewardForNameMap["action_0.reward_0"];
    fc.assert(ch.getSaliencyRowLabel(rewardBar), "action_0 reward_0", "saliency row name 0");

    // test tooltip text generation
    fc.setCase("bar tooltip text");
    fc.assert(ch.getBarTooltipTextForRewardName("rewardX"), "bar tooltip for rewardX", "reward bar tooltip 0");

    fc.setCase("legend tooltip text");
    fc.assert(ch.getLegendTooltipTextForRewardName("rewardX"), "legend tooltip for rewardX", "legend tooltip 0");
}