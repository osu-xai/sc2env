function runChartDataColorTests(failureChecker) {
    // color assignment tests
    //rd.colors = ['#1B2D4B','#E1974C',  '#30481E','#D7E400', '#372541', '#9AE004',  '#CCC210',  '#000044'];
    var fc = failureChecker;
    fc.setTestName("chartDataColorTests");
    var ch = addUtilityFunctions(buildDummyChart(3));

    ch = addColorToBars(ch);

    fc.setCase("color test");
    //assign bars colors????

    fc.assert(ch.actionRewardForNameMap["action_0.reward_0"].color, "#1B2D4B", "color 0.0");
    fc.assert(ch.actionRewardForNameMap["action_0.reward_1"].color, "#E1974C", "color 0.1");
    fc.assert(ch.actionRewardForNameMap["action_0.reward_2"].color, "#30481E", "color 0.2");

    fc.assert(ch.actionRewardForNameMap["action_1.reward_0"].color, "#1B2D4B", "color 1.0");

    fc.assert(ch.actionRewardForNameMap["action_2.reward_1"].color, "#E1974C", "color 2.1");

    fc.assert(ch.actionRewardForNameMap["action_3.reward_2"].color, "#30481E", "color 3.2");

}