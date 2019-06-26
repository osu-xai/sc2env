function addRankingFunctions(chart) {
    var ch = chart;

    ch.getMaxAbsValueReward = function() {
        return getMaxAbsoluteValue(this.actionRewardForNameMap);
    }
    ch.getMaxReward = function(){
        return getMaxValue(this.actionRewardForNameMap);
    }
    ch.getMinReward = function(){
        return getMinValue(this.actionRewardForNameMap);
    }
    return ch;
}

function getMaxValue(things) {
    var maxValue = undefined;
    for (var i in things){
        var value = things[i].value;
        if (maxValue == undefined) {
            maxValue = value;
        }
        else {
            maxValue = Math.max(maxValue, value);
        }
    }
    return maxValue;
}

function getMaxAbsoluteValue(things) {
    var maxAbsValue = undefined;
    for (var i in things){
        var absValue = Math.abs(things[i].value);
        if (maxAbsValue == undefined) {
            maxAbsValue = absValue;
        }
        else {
            maxAbsValue = Math.max(maxAbsValue, absValue);
        }
    }
    return maxAbsValue;
}

function getMinValue(things) {
    var minValue = undefined;
    for (var i in things){
        var value = things[i].value; 
        if (minValue == undefined) {
            minValue = value;
        }
        else {
            minValue = Math.min(minValue, value);
        }
    }
    return minValue;
}



function getThingWithMaxValue(things) {
    var maxValue = undefined;
    var maxValueThing = undefined;
    for (var i in things){
        var value = things[i].value;
        if (maxValue == undefined) {
            maxValue = value;
            maxValueThing = things[i];
        }
        else if (value > maxValue){
            maxValue = value;
            maxValueThing = things[i];
        }
        
    }
    return maxValueThing;
}

function rankThings(things, maxFunction) {
    var result = [];
    while (things.length > 0) {
        var maxThing = maxFunction(things);
        result.push(maxThing);
        var fewerThings = [];
        for (var i in things) {
            var thing = things[i];
            if (thing != maxThing) {
                fewerThings.push(thing);
            }
        }
        things = fewerThings;
    }
    return result;
}
