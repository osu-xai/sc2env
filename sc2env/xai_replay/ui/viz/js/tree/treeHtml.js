
function getNodeGlyphs(data, biggestUnitCount){
    var unitValuesDict = parseActionString(data);
    if (isFriendlyActionNode(data)){
        return getFriendlyGraphString(data, unitValuesDict, biggestUnitCount);
    }
    else if (isEnemyActionNode(data)){
        return getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCount);
    }
    else{
        return getStateString(data, unitValuesDict);
    }
}

var bestQValueColorPV = "white";
var bestQValueColor = "white";
// bestQvalue is the percolated back up value from the leaf.
function getBestQValue(data){
  // var afterStateQValue = data["after state q_value"];
  var bestStateQValue = data["best q_value"];
  var name = data["name"];
  if(data['root']){
    return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
  }
  // TODO refactor because do same for state and action
  if (name.indexOf("_action") != -1){
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          // others
          return '<div style="color:' + bestQValueColor + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
  else{
      //state
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          return '<div style="color:' + bestQValueColor + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
}

function getChart(data){
    if (isFriendlyActionNode(data)){
        var chartData = data.chartData;
        if (chartData == undefined){
            alert("Chart Data undefined for friendly Action Node!");
            return "";
        }
        else {
            return '<div class="flex-row">' +
                        '<div style="height:100%;width:' + sideMarginWidth + 'px;"></div>' + 
                        getChartString(chartData) + 
                        '<div style="height:100%;width:' + sideMarginWidth + 'px;"></div>' +
                    '</div>';
        }
        
    }
    else {
        return "";
    }
}
var chartHeight = 400;
var chartWidth = 800;
function getChartString(chartData){
    console.log("===================getChartString===================");
    // make chart container div with specific dimensions that is a flex-column
    //var chartString = '<div class="flex-column" style="background-color:#F0FFF0;;height: 400px; width: 800px;padding=30px;">' + getChartContentRow(chartData) + getXAxisRow() + '</div>';
    //return '<div style="background-color:#F0FFF0;"><svg height="' + chartHeight + '" width="' + chartWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getSemiCircles(chartData) + getAxes() + '</svg></div>';
    //return '<div style="background-color:#F0FFF0;"><svg height="' + chartHeight + '" width="' + chartWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getFadedCircles(chartData) + getAxes() + '</svg></div>';
    return '<div style="background-image: linear-gradient(to top, #80E080 , #FFFFFF, #80E080);"><svg height="' + chartHeight + '" width="' + chartWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + getWinBars(chartData) + getAxes() + '</svg></div>';
}
//<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
//  <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />


function getAxes(){
    var result = ' <line x1="0" y1="' + chartHeight / 2 + '" x2="' + chartWidth + '" y2="' + chartHeight / 2 + '" style="stroke:black;stroke-width:10" />' + 
                 ' <line x1="' + chartWidth / 2 + '" y1="0" x2="' + chartWidth / 2 + '" y2="' + chartHeight + '" style="stroke:black;stroke-width:10" />';
    return result;
}

