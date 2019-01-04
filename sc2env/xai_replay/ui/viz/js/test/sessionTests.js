function runSessionTests(failureChecker) {
    var fc = failureChecker;

     fc.setTestName("sessionTests");
     var cm;
     { // defaults checks
         fc.setCase("DP epoch for step");
         //cm = getExplanationsV2Manager(chartData);
         sim = getSessionIndexManager(20, [1,5,14], 200);
         fc.assert(sim.getDPThatStartsEpochForStep(1), "DP1", "step1");
         fc.assert(sim.getDPThatStartsEpochForStep(2), "DP1", "step2");
         fc.assert(sim.getDPThatStartsEpochForStep(3), "DP1", "step3");
         fc.assert(sim.getDPThatStartsEpochForStep(4), "DP1", "step4");
         fc.assert(sim.getDPThatStartsEpochForStep(5), "DP2", "step5");
         fc.assert(sim.getDPThatStartsEpochForStep(6), "DP2", "step6");
         fc.assert(sim.getDPThatStartsEpochForStep(7), "DP2", "step7");
         fc.assert(sim.getDPThatStartsEpochForStep(8), "DP2", "step8");
         fc.assert(sim.getDPThatStartsEpochForStep(9), "DP2", "step9");
         fc.assert(sim.getDPThatStartsEpochForStep(10), "DP2", "step10");
         fc.assert(sim.getDPThatStartsEpochForStep(11), "DP2", "step11");
         fc.assert(sim.getDPThatStartsEpochForStep(12), "DP2", "step12");
         fc.assert(sim.getDPThatStartsEpochForStep(13), "DP2", "step13");
         fc.assert(sim.getDPThatStartsEpochForStep(14), "DP3", "step14");
         fc.assert(sim.getDPThatStartsEpochForStep(15), "DP3", "step15");
         fc.assert(sim.getDPThatStartsEpochForStep(16), "DP3", "step16");
         fc.assert(sim.getDPThatStartsEpochForStep(17), "DP3", "step17");
         fc.assert(sim.getDPThatStartsEpochForStep(18), "DP3", "step18");
         fc.assert(sim.getDPThatStartsEpochForStep(19), "DP3", "step19");
         fc.assert(sim.getDPThatStartsEpochForStep(20), "NA", "step20");// 19 is max
     }
}