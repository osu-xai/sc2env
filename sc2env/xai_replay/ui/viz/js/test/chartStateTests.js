///Jed and Evan agree that render state at each DP should be retained and revived if revisit.
// so replay state remembers cm for each DP


//___which bars/actions to show? show everything, allow remove stuff.
//___pin tooltips so can hover over text and show another layer
//___reward bars - at display time, add the current score to the total so far
//___total bar - semi-transparent across other bars

function runChartManagerTests(failureChecker) {
    var fc = failureChecker;

    //var chartData = getChartData();
    fc.setTestName("chartManagerTest");
    var cm;
    { // defaults checks
        fc.setCase("normal mode defaults check");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(false);
        fc.assert(cm.treatmentID, "NA", "treatmentID");
        
        fc.assert(cm.chartVisible, false, "chartVisible");
        
        fc.assert(cm.showSaliencyAccessButton, true, "showSaliencyAccessButton");
        fc.assert(cm.saliencyVisible, false, "saliencyVisible");
        fc.assert(cm.saliencyCombined, false, "saliencyCombined");
        cm.render("trace");
        fc.assert(cm.renderLog.length, 0,"renderLog.length");
    
        //
        fc.setCase("user study mode T0 defaults check");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T0");
        
        fc.assert(cm.chartVisible, false, "chartVisible");
        
        fc.assert(cm.showSaliencyAccessButton, false, "showSaliencyAccessButton");
        fc.assert(cm.saliencyVisible, false, "saliencyVisible");
        fc.assert(cm.saliencyCombined, false, "saliencyCombined");
        cm.render("trace");
        fc.assert(cm.renderLog.length, 0,"renderLog.length");

        //
        fc.setCase("user study mode T1 defaults check");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T1");
        
        fc.assert(cm.chartVisible, false, "chartVisible");
        fc.assert(cm.showSaliencyAccessButton, false, "showSaliencyAccessButton");
        fc.assert(cm.saliencyVisible, true, "saliencyVisible");
        fc.assert(cm.saliencyCombined, false, "saliencyCombined");
        cm.render("trace");
        fc.assert(cm.renderLog.length, 1,"renderLog.length"); 
        fc.assert(cm.renderLog[0], "renderSaliencyDetailed", "renderLog[0]");

        //
        fc.setCase("user study mode T2 defaults check");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T2");
        
        fc.assert(cm.chartVisible, true, "chartVisible");
        fc.assert(cm.showSaliencyAccessButton, false, "showSaliencyAccessButton");
        fc.assert(cm.saliencyVisible, false, "saliencyVisible");
        fc.assert(cm.saliencyCombined, false, "saliencyCombined");
        cm.render("trace");
        fc.assert(cm.renderLog.length, 1,"renderLog.length"); 

        //
        fc.setCase("user study mode T3 defaults check");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T3");
        
        fc.assert(cm.chartVisible, true, "chartVisible");
        
        fc.assert(cm.showSaliencyAccessButton, false, "showSaliencyAccessButton");
        fc.assert(cm.saliencyVisible, true, "saliencyVisible");
        fc.assert(cm.saliencyCombined, false, "saliencyCombined");
        cm.render("trace");
        fc.assert(cm.renderLog.length, 2,"renderLog.length"); 
    }

    { // non user study mode
        fc.setCase("non user study mode");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(false);
        fc.assert(cm.showLosingActionSmaller,false,"losing actions saliency map size");
        cm.filename = "foo.scr"; 
        
        cm.chartVisible = true;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 2,"renderLog.length.a"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]a");
        fc.assert(cm.renderLog[1], "renderSaliencyAccessButton", "renderLog[2]a");

        cm.saliencyVisible = true;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 3,"renderLog.length.c"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]c");
        fc.assert(cm.renderLog[1], "renderSaliencyAccessButton", "renderLog[2]c");
        fc.assert(cm.renderLog[2], "renderSaliencyDetailed", "renderLog[3]c");

        cm.saliencyCombined = false;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 3,"renderLog.length.d"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]d");
        fc.assert(cm.renderLog[1], "renderSaliencyAccessButton", "renderLog[2]d");
        fc.assert(cm.renderLog[2], "renderSaliencyDetailed", "renderLog[3]d");

        fc.assert(cm.showHoverScores, true, "saliency hover scores");
    }

    { // T1
        fc.setCase("T1");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T1");

        cm.setFilename("tutorial.scr"); 
        fc.assert(cm.saliencyRandomized, true, "saliency randomization");
        cm.setFilename("MainTask.scr"); 
        fc.assert(cm.saliencyRandomized, false, "saliency randomization");
        fc.assert(cm.showLosingActionSmaller,true,"losing actions saliency map size");
        fc.assert(cm.showHoverScores, false, "saliency hover scores");
    }
    
    { // T2
        fc.setCase("T2");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T2");
        fc.assert(cm.showLosingActionSmaller,true,"losing actions saliency map size");

        cm.chartVisible = true;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 1,"renderLog.length.a"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]a");
    }

    { // T3
        fc.setCase("T3");
        //cm = getExplanationsV2Manager(chartData);
        cm = getExplanationsV2Manager();
        cm.setChartData(buildDummyChart(3));
        cm.setUserStudyMode(true);
        cm.setUserStudyTreatment("T3");
        fc.assert(cm.showLosingActionSmaller,true,"losing actions saliency map size");

        fc.assert(cm.showHoverScores, false, "saliency hover scores");
        cm.chartVisible = true;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 2,"renderLog.length.a"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]a");
        fc.assert(cm.renderLog[1], "renderSaliencyDetailed", "renderLog[2]a");

        cm.saliencyVisible = true;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 2,"renderLog.length.c"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]c");
        fc.assert(cm.renderLog[1], "renderSaliencyDetailed", "renderLog[2]c");

        cm.saliencyCombined = false;
        cm.render("trace");
        fc.assert(cm.renderLog.length, 2,"renderLog.length.d"); 
        fc.assert(cm.renderLog[0], "renderChartDetailed", "renderLog[1]d");
        fc.assert(cm.renderLog[1], "renderSaliencyDetailed", "renderLog[2]d");
    }
}