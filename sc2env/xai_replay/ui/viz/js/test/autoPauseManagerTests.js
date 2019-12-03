function runAutoPauseManagerTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("autoPauseManagerTests");
    {
        fc.setCase("straight forward");
        var pauseAndPredictList = [6,7,11,17,20,26,36];
        var pauseAndExplainList = [7,8,12,18,21,27,37];
        var apm = getAutoPauseManagerStudy(pauseAndPredictList,pauseAndExplainList);
        // 6/7/8  (6/7 and 7/8  overlap in that they share dp 7)
        // before entry in pauseAndPredictList for first time - don't pause
        fc.assert(apm.affirmAutoPause(5,"NA"), undefined,"a1");
        // case at entry in pauseAndPredictList for first time - pause
        fc.assert(apm.affirmAutoPause(6,"NA"), 6,"a2"); 
        // case at entry in pauseAndPredictList for second time - don't pause
        fc.assert(apm.affirmAutoPause(6,"NA"), undefined,"a3");
        // case at corresponding entry in pauseAndExplainList for first time - pause
        fc.assert(apm.affirmAutoPause(7,"NA"), 7,"a4");
        // case at entry in pauseAndExplainList for second time before completing - keep pausing
        fc.assert(apm.affirmAutoPause(7,"NA"), 7,"a5");
        // case at entry in pauseAndExplainList for nth time after completing - don't pause
        fc.assert(apm.affirmAutoPause(7,7), undefined,"a6");
        // case at next entry in pauseAndExplainList (1 ahead) first time - pause
        fc.assert(apm.affirmAutoPause(8,7), 8,"a7");
        // case at next entry in pauseAndExplainList (1 ahead) second time before completing - keep pausing
        fc.assert(apm.affirmAutoPause(8,7), 8,"a8");
        // case at next entry in pauseAndExplainList (1 ahead) nth time after completing
        fc.assert(apm.affirmAutoPause(8,8), undefined,"a9");
        // case after entry in pauseAndExplainList and before next entry in pauseAndPredictList
        fc.assert(apm.affirmAutoPause(9,8), undefined,"a10");

        // 11/12
         // before entry in pauseAndPredictList for first time - don't pause
         fc.assert(apm.affirmAutoPause(10,8), undefined,"b1");
         // case at entry in pauseAndPredictList for first time - pause
         fc.assert(apm.affirmAutoPause(11,8), 11,"b2"); 
         // case at entry in pauseAndPredictList for second time - don't pause
         fc.assert(apm.affirmAutoPause(11,8), undefined,"b3");
         // case at corresponding entry in pauseAndExplainList for first time - pause
         fc.assert(apm.affirmAutoPause(12,8), 12,"b4");
         // case at entry in pauseAndExplainList for second time before completing - keep pausing
         fc.assert(apm.affirmAutoPause(12,8), 12,"b5");
         // case at entry in pauseAndExplainList for nth time after completing - don't pause
         fc.assert(apm.affirmAutoPause(12,12), undefined,"b6");
         // case after entry in pauseAndExplainList and before next entry in pauseAndPredictList
         fc.assert(apm.affirmAutoPause(13,12), undefined,"b7");


        // 36/37
        // before entry in pauseAndPredictList for first time - don't pause
        fc.assert(apm.affirmAutoPause(35,27), undefined,"c1");
        // case at entry in pauseAndPredictList for first time - pause
        fc.assert(apm.affirmAutoPause(36,27), 36,"c2"); 
        // case at entry in pauseAndPredictList for second time - don't pause
        fc.assert(apm.affirmAutoPause(36,27), undefined,"c3");
        // case at corresponding entry in pauseAndExplainList for first time - pause
        fc.assert(apm.affirmAutoPause(37,27), 37,"c4");
        // case at entry in pauseAndExplainList for second time before completing - keep pausing
        fc.assert(apm.affirmAutoPause(37,27), 37,"c5");
        // case at entry in pauseAndExplainList for nth time after completing - don't pause
        fc.assert(apm.affirmAutoPause(37,37), undefined,"c6");
        // case after entry in pauseAndExplainList and before next entry in pauseAndPredictList
        fc.assert(apm.affirmAutoPause(38,37), undefined,"c7");
  

    }
    // HOPPING ALWAYS PAUSES SO NO NEED TO TEST THAT SITUATION FOR AUTOPAUSE - THIS IS ONLY RELEVANT FOR WHEN PLAYING
}