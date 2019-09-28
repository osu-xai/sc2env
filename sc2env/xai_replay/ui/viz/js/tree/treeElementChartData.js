function createChartData(valueList){
    var cd = [];
    // load up the raw data into our chartData structure, reordering for proper grouping
    for (var targetIndex in destinationIndexSource){
        var sourceIndex = destinationIndexSource[targetIndex];
        var value = valueList[sourceIndex];
        var barName = winTypeNames[sourceIndex];
        var bar = {};
        bar["value"] = value;
        bar["name"] = barName;
        cd.push(bar);
    }
    return cd;
}




// Xian called the win types this:
// 0: Self top lane Nexus destroy 
// 1: Self bottom lane Nexus destroy
// 2: Enemy top lane Nexus destroy
// 3: Enemy bottom lane Nexus destroy
// 4: Self top lane Nexus has lowest HP when the wave reach 40
// 5: Self bottom lane Nexus has lowest HP when the wave reach 40
// 6: Enemy top lane Nexus has lowest HP when the wave reach 40
// 7: Enemy bottom lane Nexus has lowest HP when the wave reach 40

// these are the new names in the order that they are arriving in the json file
var winTypeNames = {};
winTypeNames[0] = "Enemy destroys Agent's top lane Nexus";
winTypeNames[1] = "Enemy destroys Agent's bottom lane Nexus";
winTypeNames[2] = "Agent destroys Enemy's top lane Nexus";
winTypeNames[3] = "Agent destroys Enemy's bottom lane Nexus";
winTypeNames[4] = "Enemy has top lane advantage at end of game";
winTypeNames[5] = "Enemy has bottom lane advantage at end of game";
winTypeNames[6] = "Agent has top lane advantage at end of game";
winTypeNames[7] = "Agent has bottom lane advantage at end of game";

// this is how we want to reorder the information so that all agent's win bars are grouped together
var destinationIndexSource = {};
destinationIndexSource[0] = 2;
destinationIndexSource[1] = 3;
destinationIndexSource[2] = 6;
destinationIndexSource[3] = 7;
destinationIndexSource[4] = 0;
destinationIndexSource[5] = 1;
destinationIndexSource[6] = 4;
destinationIndexSource[7] = 5;

