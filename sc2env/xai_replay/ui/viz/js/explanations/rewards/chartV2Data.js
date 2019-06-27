function addUtilityFunctions(chart) {
    var ch = chart;

    ch.positiveMarkerValues = [];

    ch.positiveMarkerYPixelsFromXAxis = [];

    ch.getActionForName = function (actionName) {
        for (var i in rd.actions) {
            if (rd.actions[i].actionBarName == actionName) {
                return rd.actions[i];
            }
        }
    }

    ch.getActionsInQuadrantOrder = function(){
        var quadrantNames = [ "Q1","Q2", "Q3", "Q4"];
        var sortedActions = [];
        for (var i in quadrantNames){
            var quadrantName = quadrantNames[i];
            for (var j in this.actions) {
                var action = this.actions[j];
                if (action.name.includes(quadrantName)){
                    sortedActions.push(action);
                }
            }
            
        }
        if (sortedActions.length < this.actions.length){
            // one or more quadrant names didn't match, don't sort - must be a test context
            return this.actions;
        }
        else {
            return sortedActions;
        }
       
    }
    
    ch.getMaxAbsRewardOrActionValue = function () {
        var maxBar = 0;
        maxBar = Math.max(this.getMaxAbsoluteValueReward(), this.getMaxActionValue());
        return maxBar;
    }
    ch.getMaxActionValue = function () {
        var max = 0;
        for (var i in ch.actions) {
            max = Math.max(max, Math.abs(ch.actions[i].value));
        }
        return max;
    }
    
    ch.getMaxValueAction = function () {
        return getMaxValuedThing(this.actions);
    }

    ch.getMaxValueBar = function(actionBars) {
        return getMaxValuedThing(actionBars);
    }
    ch.getMaxAbsoluteValueReward = function () {
        var maxValue = undefined;
        for (var i in ch.actions) {
            for (var j in ch.actions[i].bars) {
                if (maxValue == undefined) {
                    maxValue = ch.actions[i].bars[j].value;
                }
                else {
                    maxValue = Math.max(maxValue, Math.abs(ch.actions[i].bars[j].value));
                }
            }
        }
        return maxValue;
    }
    ch.getMaxPositiveReward = function () {
        var maxPosValue = undefined;
        for (var i in ch.actions) {
            for (var j in ch.actions[i].bars) {
                if (ch.actions[i].bars[j].value >= 0) {
                    if (maxPosValue == undefined) {
                        maxPosValue = ch.actions[i].bars[j].value;
                    }
                    else {
                        maxPosValue = Math.max(maxPosValue, ch.actions[i].bars[j].value);
                    }
                }
            }
        }
        return maxPosValue;
    }
    // get the negative reward with the largest absolute value
    ch.getMaxAbsValNegativeReward = function () {
        var maxNegValue = undefined;
        for (var i in ch.actions) {
            for (var j in ch.actions[i].bars) {
                if (ch.actions[i].bars[j].value <= 0) {
                    if (maxNegValue == undefined) {
                        maxNegValue = ch.actions[i].bars[j].value;
                    }
                    else {
                        maxNegValue = Math.min(maxNegValue, ch.actions[i].bars[j].value);
                    }
                }
            }
        }
        if (maxNegValue == undefined) {
            maxNegValue = 0.0;
        }
        return Math.abs(maxNegValue);
    }
    ch.getMaxAbsValNegativeAction = function() {
        var max = 0.0;
        for (var i in this.actions){
            var value = this.actions[i].value;
            if (value < 0) {
                max = Math.max(max, Math.abs(value));
            }
        }
        return Number(max);
    }
    return ch;
}

function getMaxValuedThing(things) {
    var max = 0;
    var maxThing = undefined
    for (var i in things) {
        var thing = things[i];
        var value = thing.value;
        if (maxThing == undefined) {
            maxThing = thing;
            max = value;
        }
        else {
            if (value > max){
                maxThing = thing;
                max = value;
            }
        }
    }
    return maxThing;
}

//Written by kennebec on stackOverflow:
//https://stackoverflow.com/questions/21646738/convert-hex-to-rgba/
function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',';
        //will return "(#, #, #, " so I can modify the opacity
    }
    throw new Error('Bad Hex');
}