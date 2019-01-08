function runQuestionAccessManagerTests(failureChecker) {

    var fc = failureChecker;
    fc.setTestName("questionAccessmanagerTests");
    // 1 plain
    // 4 waitForClick
    // 7 waitForPredictionClick
    var qam = getQuestionAccessManager([ 1, 4, 7, 10], 14);
    // plain/waitForClick/waitForPredictionClick
    fc.setCase("1 plain posed");
    qam.setQuestionStep(1); 
    qam.setQuestionType("plain");
    qam.setQuestionState("posed");
    qam.setRelationToFinalDecisionPoint("before");
    fc.assert(qam.getBlockRenderState(), "blockPastRange", "blockRender");
    fc.assert(qam.getBlockRange()[0], 4, "block range 0");
    fc.assert(qam.getBlockRange()[1], 14, "block range 1");
    fc.assert(qam.getPlayButtonState(), "enabled");

    fc.setCase("1 plain answered");
    qam.setQuestionState("answered");
    fc.assert(qam.getBlockRenderState(), "blockPastRange", "blockRender");
    fc.assert(qam.getBlockRange()[0], 4, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");
    

    fc.setCase("4 waitForClick posed");
    qam.setQuestionStep(4);
    qam.setQuestionType("waitForClick");
    qam.setQuestionState("posed");
    fc.assert(qam.getBlockRenderState(), "blockPastRange", "blockRender");
    fc.assert(qam.getBlockRange()[0], 7, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blcokRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");

    fc.setCase("4 waitForClick answered");
    qam.setQuestionState("answered");
    fc.assert(qam.getBlockRenderState(), "blockPastRange", "blockRender");
    fc.assert(qam.getBlockRange()[0], 7, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");


    fc.setCase("7 waitForPredictionClick posed");
    qam.setQuestionStep(7);
    qam.setQuestionType("waitForPredictionClick");
    qam.setQuestionState("posed");
    fc.assert(qam.getBlockRenderState(), "blockPastStep", "blockRender");
    fc.assert(qam.getBlockRange()[0], 8, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "disabled", "playButtonState");
    
    fc.setCase("7 waitForPredictionClick answered");
    qam.setQuestionState("answered");
    fc.assert(qam.getBlockRenderState(), "blockPastRange", "blockRender");
    fc.assert(qam.getBlockRange()[0], 10, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");
    


    fc.setCase("10 finalDpRange waitForPredictionClick posed");
    qam.setQuestionStep(10);
    qam.setRelationToFinalDecisionPoint("finalDpRange");
    qam.setQuestionType("waitForPredictionClick");
    qam.setQuestionState("posed");
    fc.assert(qam.getBlockRenderState(), "blockPastStep", "blockRender");
    fc.assert(qam.getBlockRange()[0], 11, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "disabled", "playButtonState");
    
    fc.setCase("10 finalDpRange waitForPredictionClick answered");
    qam.setQuestionState("answered");
    fc.assert(qam.getBlockRenderState(), "blockFinalStep", "blockRender");
    fc.assert(qam.getBlockRange()[0], 13, "blockRange 0");
    fc.assert(qam.getBlockRange()[1], 14, "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");



    fc.setCase("summary finalStep posed plain");
    qam.setQuestionStep("summary");
    qam.setRelationToFinalDecisionPoint("finalStep");
    qam.setQuestionState("posed");
    qam.setQuestionType("plain");
    fc.assert(qam.getBlockRenderState(), "noBlock", "blockRender");
    fc.assert(qam.getBlockRange()[0], "NA", "blockRange 0");
    fc.assert(qam.getBlockRange()[1], "NA", "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");
    
    fc.setCase("summary finalStep answered plain");
    qam.setQuestionState("answered");
    qam.setQuestionType("plain");
    fc.assert(qam.getBlockRenderState(), "noBlock", "blockRender");
    fc.assert(qam.getBlockRange()[0], "NA", "blockRange 0");
    fc.assert(qam.getBlockRange()[1], "NA", "blockRange 1");
    fc.assert(qam.getPlayButtonState(), "enabled", "playButtonState");
}