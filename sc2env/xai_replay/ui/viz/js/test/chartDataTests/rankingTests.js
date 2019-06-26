function runRankingTests(failureChecker) {
    var fc = failureChecker;
    fc.setTestName("rankingTests");
    //cm.newVar = cm.rankThings(cm.actionRewardForNameMap)
    fc.setCase("rank tests pos and neg values")
    var thing1= {};
    var thing2= {};
    var thing3= {};
    var thing4= {};
    var thing5= {};
    thing1["value"] = 2.0;
    thing2["value"] = 1.0;
    thing3["value"] = 0.0;
    thing4["value"] = -1.0;
    thing5["value"] = -3.0;
    var things = [thing2, thing1, thing5, thing4, thing3];
    var maxValue = getMaxValue(things);
    fc.assert(maxValue, 2.0, "max value a");
    var maxAbsValue = getMaxAbsoluteValue(things);
    fc.assert(maxAbsValue, 3.0, "max abs value a");
    var minValue = getMinValue(things);
    fc.assert(minValue, -3.0, "min value a");

    var rankedThings = rankThings(things, getThingWithMaxValue);
    fc.assert(rankedThings[0], thing1, "rankTest 0a");
    fc.assert(rankedThings[1], thing2, "rankTest 1a");
    fc.assert(rankedThings[2], thing3, "rankTest 2a");
    fc.assert(rankedThings[3], thing4, "rankTest 3a");
    fc.assert(rankedThings[4], thing5, "rankTest 4a");


    fc.setCase("rank tests pos values only")
    var thing1= {};
    var thing2= {};
    var thing3= {};
    var thing4= {};
    var thing5= {};
    thing1["value"] = 10.0;
    thing2["value"] = 8.0;
    thing3["value"] = 6.0;
    thing4["value"] = 4.0;
    thing5["value"] = 2.0;
    var things = [thing2, thing1, thing5, thing4, thing3];
    var maxValue = getMaxValue(things);
    fc.assert(maxValue, 10.0, "max value a");
    var maxAbsValue = getMaxAbsoluteValue(things);
    fc.assert(maxAbsValue, 10.0, "max abs value a");
    var minValue = getMinValue(things);
    fc.assert(minValue, 2.0, "min value a");

    var rankedThings = rankThings(things, getThingWithMaxValue);
    fc.assert(rankedThings[0], thing1, "rankTest 0b");
    fc.assert(rankedThings[1], thing2, "rankTest 1b");
    fc.assert(rankedThings[2], thing3, "rankTest 2b");
    fc.assert(rankedThings[3], thing4, "rankTest 3b");
    fc.assert(rankedThings[4], thing5, "rankTest 4b");

    
    fc.setCase("rank tests neg values only")
    var thing1= {};
    var thing2= {};
    var thing3= {};
    var thing4= {};
    var thing5= {};
    thing1["value"] = -2.0;
    thing2["value"] = -4.0;
    thing3["value"] = -6.0;
    thing4["value"] = -8.0;
    thing5["value"] = -10.0;
    var things = [thing2, thing1, thing5, thing4, thing3];
    var maxValue = getMaxValue(things);
    fc.assert(maxValue, -2.0, "max value a");
    var maxAbsValue = getMaxAbsoluteValue(things);
    fc.assert(maxAbsValue, 10.0, "max abs value a");
    var minValue = getMinValue(things);
    fc.assert(minValue, -10.0, "min value a");

    var rankedThings = rankThings(things, getThingWithMaxValue);
    fc.assert(rankedThings[0], thing1, "rankTest 0c");
    fc.assert(rankedThings[1], thing2, "rankTest 1c");
    fc.assert(rankedThings[2], thing3, "rankTest 2c");
    fc.assert(rankedThings[3], thing4, "rankTest 3c");
    fc.assert(rankedThings[4], thing5, "rankTest 4c");
}

