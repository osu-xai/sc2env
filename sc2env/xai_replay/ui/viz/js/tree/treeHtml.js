

function getFriendlyGraphString(data, unitValuesDict, biggestUnitCount){
    return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto auto; height: 800; width: 800;">' +
              '<style>' + 
                '#' + data.id + '_nexus_graph_container ' + '{' +
                  'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:start;' +
                  'background-color: ivory; height:700px;width:100px; margin-top:140%;' +
                '}' +
              '</style>' +
              '<div id="' + data.id + '_nexus_graph_container">' +
                drawNexusHealth(data["state"][27]) +
                '<div style="background-color:black;"></div>' +
                drawNexusHealth(data["state"][28]) +
              '</div>' +
              '<style>' + 
                '#' + data.id + '_unit_graph_container ' + '{' +
                  'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
                  'background-color: ivory; height:700px;width:700px; margin-top:20%;' +
                '}' +
              '</style>' +
              '<div id="' + data.id + '_unit_graph_container">' +
                drawUnitDiv(unitValuesDict["TOP Marines"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCount) +
                drawUnitDiv(unitValuesDict["TOP Banelings"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCount) +
                drawUnitDiv(unitValuesDict["TOP Immortals"], 'blue') + drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCount) +
                '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
                drawUnitDiv(unitValuesDict["BOT Marines"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCount) +
                drawUnitDiv(unitValuesDict["BOT Banelings"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCount) +
                drawUnitDiv(unitValuesDict["BOT Immortals"], 'blue') + drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCount) +
              '</div>' +
              '<div></div>' +
              '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto; height: 70px;">' + 
                drawPylons(unitValuesDict["Pylons"]) + drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + 
              '</div>' +
            '</div>';
  }

  
  
function getEnemyGraphString(data, unitValuesDict, biggestUnitCount){
    return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto 70px; height: 800; width: 800;" onload="finishInit()">' +
              '<style>' + 
              '#' + data.id + '_unit_graph_container ' + '{' +
                'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
                'background-color: ivory; height:700px;width:700px;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_unit_graph_container">' +
              drawPlaceHolderDivs(unitValuesDict["TOP Marines"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Marines"], 'darkGrey') + 
              drawPlaceHolderDivs(unitValuesDict["TOP Banelings"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Banelings"]) + 
              drawPlaceHolderDivs(unitValuesDict["TOP Immortals"], biggestUnitCount) + drawUnitDiv(unitValuesDict["TOP Immortals"]) + 
              '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
              drawPlaceHolderDivs(unitValuesDict["BOT Marines"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Marines"], 'darkGrey') + 
              drawPlaceHolderDivs(unitValuesDict["BOT Banelings"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Banelings"], 'darkOrange') + 
              drawPlaceHolderDivs(unitValuesDict["BOT Immortals"], biggestUnitCount) + drawUnitDiv(unitValuesDict["BOT Immortals"], 'blue') + 
            '</div>' +
            '<style>' + 
              '#' + data.id + '_nexus_graph_container ' + '{' +
                'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:end;' +
                'background-color: ivory; height:700px;width:100px;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_nexus_graph_container">' +
              drawNexusHealth(data["state"][29]) +
              '<div style="background-color:black;grid-row-end:span 1;"></div>' +
              drawNexusHealth(data["state"][30]) +
            '</div>' +
            '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto;">' + 
              drawPylonPlaceHolderDivs(unitValuesDict["Pylons"]) + drawPylons(unitValuesDict["Pylons"]) + 
            '</div>' +
            '<div></div>' +
          '</div>';
}


function getNodeGlyphs(data, biggestUnitCountTuple){
    var unitValuesDict = parseActionString(data);
    if (data.id.indexOf("action_max") != -1){
        return getFriendlyGraphString(data, unitValuesDict, biggestUnitCountTuple[1]);
    }
    else if (data.id.indexOf("action_min") != -1){
        return getEnemyGraphString(data, unitValuesDict, biggestUnitCountTuple[1]);
    }
    else{
        return '<div style="display:grid;grid-gap:50px;grid-template-columns:auto auto;">' + '<div style="color:ivory;font-size:80px;font-weight:bold;position:absolute;top:3%;left:15%;">FRIENDLY</div>' + getFriendlyGraphString(data, unitValuesDict, biggestUnitCountTuple[0]) + '<div style="color:ivory;font-size:80px;font-weight:bold;position:absolute;top:3%;left:67%;">ENEMY</div>' + getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCountTuple[0]) + '</div>';
    }
}
    
function drawNexusHealth(nexusHealth){
    var nexusHealthPercent = (1-(nexusHealth/2000)) * 100;
    return '<div style="bottom:0%;background-color:green;margin:10px;width:50px;"><div style="background-color:ivory;margin:2.5px;position:relative;width:45px;height:' + nexusHealthPercent + '%;"></div></div>';
}

function drawPylons(pylonCount){
    var pylonString = "";
    var maxPylons = 3;
    for (var i = 0; i < pylonCount; i++){
        pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
    }
    return pylonString;
}

function drawPylonPlaceHolderDivs(pylonCount){
    var pylonString = "";
    var maxPylons = 3;
    for(var i = 0; i < (maxPylons-pylonCount); i++){
        pylonString += '<div style="border: 4px solid yellow;background-color:rgba(255,255,0,.30);height:25px;margin:15px;"></div>'
    }
    return pylonString;
}
    

function drawUnitDiv(unitCount, color){
    var unitDivString = "";
    for(var i = 0; i < unitCount; i++){
        unitDivString += '<div style="text-align:center;background-color:' + color + ';"></div>'
    }
    return unitDivString;
}
    
function drawPlaceHolderDivs(unitCount, colCount){
    var placeholder = "";
    for(var i = 0; i < (colCount-unitCount); i++){
        placeholder += '<div style="background-color:rgba(0,0,0,0);"></div>'
    }
    return placeholder
}
    
function getColumnStylingString(biggestUnitCount){
    var columsString = "";
    for (var i = 0; i < biggestUnitCount; i++){
        columsString += " auto";
    }
    return columsString
}


// bestQvalue is the percolated back up value from the leaf.
function getBestQValue(data){
    // var afterStateQValue = data["after state q_value"];
    var bestStateQValue = data["best q_value"];
    var name = data["name"];
    if(data['root']){
      return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
    }
    // TODO refactor because do same for state and action
    if (name.indexOf("_action") != -1){
        if (name.indexOf("best") != -1){
            // principle variation
            return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
        }
        else{
            // others
            return '<div style="color:Turquoise;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
        }
    }
    else{
        //state
        if (name.indexOf("best") != -1){
            // principle variation
            return '<div style="color:rgba(255,140,26,1);font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
        }
        else{
            return '<div style="color:Turquoise;font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
        }
    }
}