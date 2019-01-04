function addMsxToBars(rawChartData) {
    var rd = rawChartData;
    for (var i in rd.actions) {
        var action = rd.actions[i];
        action.msxMaxValueAction = false;
        for (var j in rd.actions[i].bars) {
            var bar = rd.actions[i].bars[j];
            bar.msxColor = "grey";
            bar.msxImportantBar = false;
        }
    }
    rd = sortMsxBars(rd);
    return rd;
}

function sortMsxBars(rawChartData) {
    var rd = rawChartData;
    //TODO: Automate grabbing the colors for the graph
    rd.colors = ['#1B2D4B','#E1974C',  '#30481E','#D7E400', '#372541', '#9AE004',  '#CCC210',  '#000044'];
    var maxBarGroup = rd.getMaxValueAction();
    for (var i in rd.actions) {
        var action = rd.actions[i];
        if (action.name != maxBarGroup.name) {
            var importantNames = getMinBarAdvantagesRowNBarsPerAction(rd.actions[i], maxBarGroup);
            console.log(importantNames);
            for (var j in action.bars) {
                var bar = action.bars[j];
                for (var k in importantNames) {
                    var check = importantNames[k];
                    if (bar.fullName == check) {
                        bar.msxImportantBar = true;
                        bar.msxColor = rd.colors[j];
                    }
                }
                
            }
        } else {
            action.msxMaxValueAction = true;
        }
    }
    return rd;
}
function getMinBarAdvantagesRowNBarsPerAction(action, maxBarGroup) {
    var typeDiff = 0, totalNegDiff = 0, totalPos = 0;
    var posDiff = [];
    var namePosDiff = [];
    for(var i in action.bars) {
        var bar = action.bars[i];
        var maxBar = maxBarGroup.bars[i];
        typeDiff = maxBar.value - bar.value;
        if(typeDiff >= 0) {
            posDiff.push(typeDiff);
            totalPos++;
            namePosDiff.push(bar.fullName);
        } else {
            totalNegDiff += Math.abs(typeDiff);
        }
    }
    var finalReturn = (getMinSufficientBarNames(posDiff, totalPos, namePosDiff, totalNegDiff));
    console.log("-------------------------------");
    return finalReturn;
}
function getMinSufficientBarNames(posDiff, totalPos, namePosDiff, totalNegDiff) {
    var temp, swap;
    var importantNames = [];
    for(var i = 0; i < totalPos-1; i++) {
        swap = 0;
        for(var j = 0; j < totalPos - i - 1; j++) {
            if(posDiff[j] < posDiff[j + 1]) {
                temp = posDiff[j];
                posDiff[j] = posDiff[j + 1];
                posDiff[j + 1] = temp;
                nameTemp = namePosDiff[j];
                namePosDiff[j] = namePosDiff[j + 1];
                namePosDiff[j + 1] = nameTemp;
                swap = 1;
            }
        }
        if (swap == 0) { break; }
    }
    var minPos=0;
    for(var i in posDiff) {
        minPos += posDiff[i];
        importantNames.push(namePosDiff[i]);
        if(minPos > totalNegDiff) {
            break;
        }
    }
    if(minPos <= totalNegDiff) {
        console.log("Error: No positive reward minimum to explain total negative rewards");
    }
    console.log("The min needed is: " + minPos);
    return importantNames;
}