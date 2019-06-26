function runMsxRankingTests (failureChecker, chartTesting) {
    //rd.colors = ['#7293CB','#E1974C',  '#84BA5B','#D35E60', '#9067A7', '#AB6857',  '#CCC210',  '#000044']
    var fc = failureChecker;
    

    if (chartTesting == "seeSaw") {
        fc.setTestName("MsxRankingTests - seesaw");
        var ch = getSeeSawChart();
    } else if (chartTesting == "allPositives") {
        fc.setTestName("MsxRankingTests - all Pos");
        var ch = getAllPositivesChart();
    } else {
        fc.setTestName("MsxRankingTests - all Neg");
        var ch = getAllNegativesChart();
    }
    ch = addUtilityFunctions(ch);

    ch = addMsxToBars(ch);

    if (chartTesting == "seeSaw") {
        fc.setCase("seeSaw rank best action");

        fc.assert(ch.actions[0].msxMaxValueAction, false, "msx Value Action 0");
        fc.assert(ch.actions[1].msxMaxValueAction, false, "msx Value Action 1");
        fc.assert(ch.actions[2].msxMaxValueAction, true, "msx Value Action 2");
        fc.assert(ch.actions[3].msxMaxValueAction, false, "msx Value Action 3");
    } else if (chartTesting == "allPositives") {
        fc.setCase("allPositives rank best action");

        fc.assert(ch.actions[0].msxMaxValueAction, false, "msx Value Action 0");
        fc.assert(ch.actions[1].msxMaxValueAction, false, "msx Value Action 1");
        fc.assert(ch.actions[2].msxMaxValueAction, false, "msx Value Action 2");
        fc.assert(ch.actions[3].msxMaxValueAction, true, "msx Value Action 3");
    } else if (chartTesting == "allNegatives") {
        fc.setCase("allNegatives rank best action");

        fc.assert(ch.actions[0].msxMaxValueAction, true, "msx Value Action 0");
        fc.assert(ch.actions[1].msxMaxValueAction, false, "msx Value Action 1");
        fc.assert(ch.actions[2].msxMaxValueAction, false, "msx Value Action 2");
        fc.assert(ch.actions[3].msxMaxValueAction, false, "msx Value Action 3");
    }


    if (chartTesting == "seeSaw") {
        fc.setCase("seeSaw rank important bars");
        fc.assert(ch.actions[0].bars[0].msxImportantBar, true, "msx important Bar 0.0");
        fc.assert(ch.actions[0].bars[1].msxImportantBar, false, "msx important Bar 0.1");
        fc.assert(ch.actions[0].bars[2].msxImportantBar, true, "msx important Bar 0.2");

        fc.assert(ch.actions[1].bars[0].msxImportantBar, false, "msx important Bar 1.0");
        fc.assert(ch.actions[1].bars[1].msxImportantBar, false, "msx important Bar 1.1");
        fc.assert(ch.actions[1].bars[2].msxImportantBar, true, "msx important Bar 1.2");

        fc.assert(ch.actions[2].bars[0].msxImportantBar, false, "msx important Bar 2.0");
        fc.assert(ch.actions[2].bars[1].msxImportantBar, false, "msx important Bar 2.1");
        fc.assert(ch.actions[2].bars[2].msxImportantBar, false, "msx important Bar 2.2");

        fc.assert(ch.actions[3].bars[0].msxImportantBar, false, "msx important Bar 3.0");
        fc.assert(ch.actions[3].bars[1].msxImportantBar, false, "msx important Bar 3.1");
        fc.assert(ch.actions[3].bars[2].msxImportantBar, true, "msx important Bar 3.2");
    } else if (chartTesting == "allPositives") {
        fc.setCase("allPositives rank important bars");

        fc.assert(ch.actions[0].bars[0].msxImportantBar, false, "msx important Bar 0.0");
        fc.assert(ch.actions[0].bars[1].msxImportantBar, false, "msx important Bar 0.1");
        fc.assert(ch.actions[0].bars[2].msxImportantBar, true, "msx important Bar 0.2");

        fc.assert(ch.actions[1].bars[0].msxImportantBar, false, "msx important Bar 1.0");
        fc.assert(ch.actions[1].bars[1].msxImportantBar, true, "msx important Bar 1.1");
        fc.assert(ch.actions[1].bars[2].msxImportantBar, false, "msx important Bar 1.2");

        fc.assert(ch.actions[2].bars[0].msxImportantBar, true, "msx important Bar 2.0");
        fc.assert(ch.actions[2].bars[1].msxImportantBar, false, "msx important Bar 2.1");
        fc.assert(ch.actions[2].bars[2].msxImportantBar, false, "msx important Bar 2.2");

        fc.assert(ch.actions[3].bars[0].msxImportantBar, false, "msx important Bar 3.0");
        fc.assert(ch.actions[3].bars[1].msxImportantBar, false, "msx important Bar 3.1");
        fc.assert(ch.actions[3].bars[2].msxImportantBar, false, "msx important Bar 3.2");
    } else if (chartTesting == "allNegatives") {
        fc.setCase("allNegatives rank importantBars");

        fc.assert(ch.actions[0].bars[0].msxImportantBar, false, "msx important Bar 0.0");
        fc.assert(ch.actions[0].bars[1].msxImportantBar, false, "msx important Bar 0.1");
        fc.assert(ch.actions[0].bars[2].msxImportantBar, false, "msx important Bar 0.2");

        fc.assert(ch.actions[1].bars[0].msxImportantBar, true, "msx important Bar 1.0");
        fc.assert(ch.actions[1].bars[1].msxImportantBar, false, "msx important Bar 1.1");
        fc.assert(ch.actions[1].bars[2].msxImportantBar, false, "msx important Bar 1.2");

        fc.assert(ch.actions[2].bars[0].msxImportantBar, true, "msx important Bar 2.0");
        fc.assert(ch.actions[2].bars[1].msxImportantBar, false, "msx important Bar 2.1");
        fc.assert(ch.actions[2].bars[2].msxImportantBar, false, "msx important Bar 2.2");

        fc.assert(ch.actions[3].bars[0].msxImportantBar, true, "msx important Bar 3.0");
        fc.assert(ch.actions[3].bars[1].msxImportantBar, false, "msx important Bar 3.1");
        fc.assert(ch.actions[3].bars[2].msxImportantBar, false, "msx important Bar 3.2");
    }
}