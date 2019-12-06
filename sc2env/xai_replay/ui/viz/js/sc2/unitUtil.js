
var totalsString = "total score";

function getUnitLane(basicUnitYPos){
    var lane = "bottom"
    if (basicUnitYPos > 32){
        lane = "top"
    }
    return lane
}

function getMineralHealth(frameInfo){
    var recorderUnitId = 45
    for (var i in frameInfo.units){
        var unit = frameInfo.units[i]
        if (unit.unit_type == recorderUnitId){
            var recorderUnit = unit
            var mineralHealthSheildValue = 4
            if (recorderUnit.shield == mineralHealthSheildValue){
                currentFriendlyMineralHealth = recorderUnit.health - 1
             }
        }
    }
    return currentFriendlyMineralHealth
}


function getNexusUnits(frameInfo){
    var nexusUnit = 59;
    var nexusUnits = []
    for (var unitIndex in frameInfo.units){
        var unit = frameInfo.units[unitIndex]
        if (unit["unit_type"] == nexusUnit){
            nexusUnits.push(unit)
        }
    }
    return nexusUnits
}

function getNexusHealthForUnit(alliance, lane, nexusUnits){
    for (var unitIndex in nexusUnits){
        var unit = nexusUnits[unitIndex];
        curLane = getUnitLane(unit.y);
        curAlliance = unit.alliance;
        if (alliance == curAlliance && curLane == lane){
            return unit.health;
        }
    }
    return 0;
}



function getWave(frameInfo){
    var units = frameInfo["units"]
    for (unitIndex in units){
        var unit = units[unitIndex]
        if (unit["unit_type"] == 45){
            if (unit["shield"] == 42){
                var waveNumber = unit["health"]
                return waveNumber;
            }
        }
    }
}

var htmlTextForKey = {};
htmlTextForKey["friendly.marineBuilding.top"] = "Marines: ";
htmlTextForKey["friendly.banelingBuilding.top"] = "Banelings: ";
htmlTextForKey["friendly.immortalBuilding.top"] = "Immortals: ";
htmlTextForKey["friendly.marineBuilding.bottom"] = "Marines: ";
htmlTextForKey["friendly.banelingBuilding.bottom"] = "Banelings: ";
htmlTextForKey["friendly.immortalBuilding.bottom"] = "Immortals: ";
htmlTextForKey["enemy.marineBuilding.top"] = "Marines: ";
htmlTextForKey["enemy.banelingBuilding.top"] = "Banelings: ";
htmlTextForKey["enemy.immortalBuilding.top"] = "Immortals: ";
htmlTextForKey["enemy.marineBuilding.bottom"] = "Marines: ";
htmlTextForKey["enemy.banelingBuilding.bottom"] = "Banelings: ";
htmlTextForKey["enemy.immortalBuilding.bottom"] = "Immortals: ";
htmlTextForKey["friendly.Pylon"] = "Pylons: ";
htmlTextForKey["enemy.Pylon"] = "Pylons: ";


var htmlAllianceTextForKey = {};
htmlAllianceTextForKey["friendly.marineBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.banelingBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.immortalBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.marineBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["friendly.banelingBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["friendly.immortalBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["enemy.marineBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.banelingBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.immortalBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.marineBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["enemy.banelingBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["enemy.immortalBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["friendly.Pylon"] = "Friendly ";
htmlAllianceTextForKey["enemy.Pylon"] = "Enemy ";



function renderUnitValues(frameInfo){
    if (isFrameFarEnoughPastDP(frameInfo)){
        var unit = frameInfo
        for (unitCount in unitInfoKeys){
            if(unit[unitInfoKeys[unitCount] + "_delta_triggered"] == 1){
                if (htmlAllianceTextForKey[ unitInfoKeys[unitCount] ] == "Friendly "){
                    document.getElementById(unitInfoKeys[unitCount] + "_delta").innerHTML = "+" + (unit[unitInfoKeys[unitCount] + "_delta"])
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML =  (unit[unitInfoKeys[unitCount] + "_count"] - unit[unitInfoKeys[unitCount] + "_delta"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
                else{
                    if(frameInfo['wave_triggered'] == 1){
                        document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                        document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                        document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                    }
                }
            }
            else{
                if (htmlAllianceTextForKey[ unitInfoKeys[unitCount] ] == "Friendly "){
                    document.getElementById(unitInfoKeys[unitCount] + "_delta").innerHTML = "" //NA
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
                else{
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
            } 
        }
    
        var nexusUnits = getNexusUnits(frameInfo);
        document.getElementById("friendly.nexusHealth.top").innerHTML = "Nexus Health: " + getNexusHealthForUnit(1,"top",nexusUnits);
        document.getElementById("friendly.nexusHealth.bottom").innerHTML = "Nexus Health: " + getNexusHealthForUnit(1,"bottom",nexusUnits);
        document.getElementById("enemy.nexusHealth.top").innerHTML = "Nexus Health: " + getNexusHealthForUnit(4,"top",nexusUnits);
        document.getElementById("enemy.nexusHealth.bottom").innerHTML = "Nexus Health: " + getNexusHealthForUnit(4,"bottom",nexusUnits);
    
    }
    
}