
function getNodeHtml(data, biggestUnitCount){
    var unitValuesDict = parseActionString(data);
    if (isFriendlyActionNode(data)){
        return getNodeHtmlUsingFunction(getFriendlyActionHtml, "friendlyAction", data, unitValuesDict, biggestUnitCount, actionNodeWidth, friendlyActionNodeHeight);
    }
    else if (isEnemyActionNode(data)){
        return getNodeHtmlUsingFunction(getEnemyActionHtml, "enemyAction", data, unitValuesDict["Enemy"], biggestUnitCount, actionNodeWidth, enemyActionNodeHeight);
    }
    else {
        return getNodeHtmlUsingFunction(getStateHtml, "state", data, unitValuesDict, "NA", stateNodeWidth, stateNodeHeight );
    }
}

// wraps each node type in a div that is properly dimensioned
function getNodeHtmlUsingFunction(htmlGenerationFunction, nodeType, data, unitValuesDict, biggestUnitCount, width, height){
    var portionedWidth = width * portionOfNodeToUseHorizontally;
    var portionedHeight = height * portionOfNodeToUseVertically[nodeType];
    var result = '<div style="width:' + portionedWidth + 'px;height:' + portionedHeight + 'px;">' +
                    htmlGenerationFunction(data, unitValuesDict, biggestUnitCount) +
                '</div>';
    return result;
}

// function getNodeGlyphs(data, biggestUnitCount){
//     var unitValuesDict = parseActionString(data);
//     if (isFriendlyActionNode(data)){
//         return getFriendlyGraphString(data, unitValuesDict, biggestUnitCount);
//     }
//     else if (isEnemyActionNode(data)){
//         return getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCount);
//     }
//     else{
//         return getStateString(data, unitValuesDict);
//     }
// }

function getQStyling(pWidth, pHeight) {
    return 'font-size:200px;width:' + pWidth + '%;height:' + pHeight + '%;padding-bottom:' + qPaddingBottom + 'px;padding-top:' + qPaddingTop + 'px;text-align:center;';
}
// bestQvalue is the percolated back up value from the leaf.
function getBestQValue(pWidth, pHeight, data){
  // var afterStateQValue = data["after state q_value"];
  var bestStateQValue = data["best q_value"];
  var name = data["name"];
  if(data['root']){
    return '<div style="color:' + bestQValueColorPV + ';' + getQStyling(pWidth, pHeight) + '">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
  }
  // TODO refactor because do same for state and action
  if (name.indexOf("_action") != -1){
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';' + getQStyling(pWidth, pHeight) + '">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          // others
          return '<div style="color:' + bestQValueColor + ';' + getQStyling(pWidth, pHeight) + '">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
  else{
      //state
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';' + getQStyling(pWidth, pHeight) + '">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          return '<div style="color:' + bestQValueColor + ';' + getQStyling(pWidth, pHeight) + '">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
}

function getChart(pWidth, pHeight, data){
    if (isFriendlyActionNode(data)){
        var chartData = data.chartData;
        if (chartData == undefined){
            alert("Chart Data undefined for friendly Action Node!");
            return "";
        }
        else {
            return getChartString(pWidth, pHeight, chartData);
        }
        
    }
    else {
        return "";
    }
}
function getChartString(pWidth, pHeight, chartData){
    // make chart container div with specific dimensions that is a flex-column
    //var chartString = '<div class="flex-column" style="background-color:#F0FFF0;;height: 400px; width: 800px;padding=30px;">' + getChartContentRow(chartData) + getXAxisRow() + '</div>';
    //return '<div style="background-color:#F0FFF0;"><svg height="' + chartHeight + '" width="' + chartWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getSemiCircles(chartData) + getAxes() + '</svg></div>';
    //return '<div style="background-color:#F0FFF0;"><svg height="' + chartHeight + '" width="' + chartWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getFadedCircles(chartData) + getAxes() + '</svg></div>';
    var result = '<div class="flex-row" style="background-color:white;height:' + pHeight + '%; width:' + pWidth + '%">' +
              '<div style="width:' + pWidthChartMargin + '%;height:100%";></div>' +
              '<svg style="width:' + pWidthChartContent + '%;height:100%;" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getWinBars(chartData) + getAxes() + '</svg>' + 
              '<div style="width:' + pWidthChartMargin + '%;height:100%";></div>' +
            '</div>';
    return result;
}
//<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
//  <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />


function getAxes(){
    var result = ' <line x1="0" y1="' + chartHeight / 2 + '" x2="' + chartWidth + '" y2="' + chartHeight / 2 + '" style="stroke:black;stroke-width:10" />' + 
                 ' <line x1="' + chartWidth / 2 + '" y1="0" x2="' + chartWidth / 2 + '" y2="' + chartHeight + '" style="stroke:black;stroke-width:10" />';
    return result;
}

