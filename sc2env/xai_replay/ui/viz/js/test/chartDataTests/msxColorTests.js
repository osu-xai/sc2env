function runMsxChartDataColorTests (failureChecker, chartTesting) {
    //rd.colors = ['#1B2D4B','#E1974C',  '#30481E','#D7E400', '#372541', '#9AE004',  '#CCC210',  '#000044'];
    var fc = failureChecker;
    if (chartTesting == "seeSaw") {
        fc.setTestName("MsxChartDataColorTests - seeSaw");
        var ch = getSeeSawChart();
    } else if (chartTesting == "allPositives") {
        fc.setTestName("MsxChartDataColorTests - allPos");
        var ch = getAllPositivesChart();
    } else {
        fc.setTestName("MsxChartDataColorTests - allNeg");
        var ch = getAllNegativesChart();
    }
    ch = addUtilityFunctions(ch);

    ch = addMsxToBars(ch);

    fc.setCase("MSX color test");

    if (chartTesting == "seeSaw") {
        fc.setCase("seeSaw Color");

        fc.assert(ch.actionRewardForNameMap["action_0.reward_0"].msxColor, "#1B2D4B", "color 0.0");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_1"].msxColor, "grey", "color 0.1");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_2"].msxColor, "#30481E", "color 0.2");

        fc.assert(ch.actionRewardForNameMap["action_1.reward_0"].msxColor, "grey", "color 1.0");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_1"].msxColor, "grey", "color 1.1");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_2"].msxColor, "#30481E", "color 1.2");

        fc.assert(ch.actionRewardForNameMap["action_2.reward_0"].msxColor, "grey", "color 2.0");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_1"].msxColor, "grey", "color 2.1");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_2"].msxColor, "grey", "color 2.2");

        fc.assert(ch.actionRewardForNameMap["action_3.reward_0"].msxColor, "grey", "color 3.0");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_1"].msxColor, "grey", "color 3.1");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_2"].msxColor, "#30481E", "color 3.2");

    } else if (chartTesting == "allPositives") {
        fc.setCase("allPositives Color");

        fc.assert(ch.actionRewardForNameMap["action_0.reward_0"].msxColor, "grey", "color 0.0");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_1"].msxColor, "grey", "color 0.1");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_2"].msxColor, "#30481E", "color 0.2");
    
        fc.assert(ch.actionRewardForNameMap["action_1.reward_0"].msxColor, "grey", "color 1.0");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_1"].msxColor, "#E1974C", "color 1.1");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_2"].msxColor, "grey", "color 1.2");

        fc.assert(ch.actionRewardForNameMap["action_2.reward_0"].msxColor, "#1B2D4B", "color 2.0");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_1"].msxColor, "grey", "color 2.1");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_2"].msxColor, "grey", "color 2.2");

        fc.assert(ch.actionRewardForNameMap["action_3.reward_0"].msxColor, "grey", "color 3.0");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_1"].msxColor, "grey", "color 3.1");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_2"].msxColor, "grey", "color 3.2");

    } else if (chartTesting == "allNegatives") {
        fc.setCase("allNegatives Color");

        fc.assert(ch.actionRewardForNameMap["action_0.reward_0"].msxColor, "grey", "color 0.0");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_1"].msxColor, "grey", "color 0.1");
        fc.assert(ch.actionRewardForNameMap["action_0.reward_2"].msxColor, "grey", "color 0.2");

        fc.assert(ch.actionRewardForNameMap["action_1.reward_0"].msxColor, "#1B2D4B", "color 1.0");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_1"].msxColor, "grey", "color 1.1");
        fc.assert(ch.actionRewardForNameMap["action_1.reward_2"].msxColor, "grey", "color 1.2");

        fc.assert(ch.actionRewardForNameMap["action_2.reward_0"].msxColor, "#1B2D4B", "color 2.0");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_1"].msxColor, "grey", "color 2.1");
        fc.assert(ch.actionRewardForNameMap["action_2.reward_2"].msxColor, "grey", "color 2.2");

        fc.assert(ch.actionRewardForNameMap["action_3.reward_0"].msxColor, "#1B2D4B", "color 3.0");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_1"].msxColor, "grey", "color 3.1");
        fc.assert(ch.actionRewardForNameMap["action_3.reward_2"].msxColor, "grey", "color 3.2");
    }

}