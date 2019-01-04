function getFailureChecker() {
    var fc = {};
    fc.fails = {};
    fc.passes = {};
    fc.failText = {};
    fc.context = undefined;
    fc.currentTestName = undefined;
    fc.testNames = [];
    fc.setTestName = function(testName) {
        this.fails[testName] = 0;
        this.passes[testName] = 0;
        this.failText[testName] = [];
        this.currentTestName = testName;
        this.testNames.push(testName);
    }
    fc.setCase = function(context){
        this.context = context;
    }
    fc.assert = function(a, b, message){
        if (a == b) {
            this.passes[this.currentTestName] = Number(this.passes[this.currentTestName]) + 1;
        }
        else {
            this.fails[this.currentTestName] = Number(this.fails[this.currentTestName]) + 1;
            this.failText[this.currentTestName].push(this.context + " : " + message);
        }
    }
    return fc;
}
function runTests(){
    var fc = getFailureChecker();
    runQuestionAccessManagerTests(fc);
    runChartManagerTests(fc);
    runChartDataSelectionTests(fc);

    runChartDataTextTests(fc);
    runChartDataColorTests(fc);
    runRankingTests(fc);
    runSessionTests(fc);

    var chartTypes = [0,1,2];
    //0 - seeSawChart
    //1 - allPosChart
    //2 - allNeg
    for (var i in chartTypes){
        var type = chartTypes[i];
        var chartTesting = undefined;
        if (type == 0) {
            chartTesting = "seeSaw";
        } else if (type == 1) {
            chartTesting = "allPositives";
        } else {
            chartTesting = "allNegatives";
        }
        runChartDataGeometryTests(fc, chartTesting);
        
        runMsxChartDataColorTests(fc, chartTesting);
        runMsxRankingTests(fc, chartTesting);
        runMsxGeometryTests (fc, chartTesting);
    }
    
    var message = "";
    for (var i in fc.testNames){
        var testName = fc.testNames[i];
        var passCount = fc.passes[testName];
        var failCount = fc.fails[testName];
        message = message + "p: " + passCount + " f: " + failCount + " ... " + testName + "\n";
        if (failCount != 0) {
            for (var i in fc.failText[testName]){
                var text = fc.failText[testName][i];
                message = message + "     " + text + "\n";
            }
        }
    }
    alert(message);
}

