

function getChartContentRow(chartData){
    // add flex-row that has  padding-left, then vertical line (y-axis), then spacer, then first four bar divs, then spacer, then next four divs, then padding-right
    var content = '<div class="flex-row" style="height: 80%; padding-left:20px; padding-top:20px; padding-right:20px;">' +
                getYAxis() + 
                getChartSpacer() +
                getBarDiv(chartData, 0) + 
                getBarDiv(chartData, 1) + 
                getBarDiv(chartData, 2) + 
                getBarDiv(chartData, 3) +
                getChartSpacer() +
                getBarDiv(chartData, 4) + 
                getBarDiv(chartData, 5) + 
                getBarDiv(chartData, 6) + 
                getBarDiv(chartData, 7) + 
                getChartSpacer() +
            '</div>';
    return content;
}
function getBarDiv(chartData, index){
    var bar = chartData[index];
    var value = bar["value"];
    var barPercent = value * 100;
    var spacerPercent = (1 - value) * 100;
    var barDiv = '<div class="flex-column" style="width:80px;height:100%;">' + getBarSpacer(spacerPercent) + getBar(barPercent, index) + '</div>'
    //var barDiv = '<div style="width:80px;height:100%;margin-top:' + spacerPercent + '%; background-color:'+ barColors[index] + '"></div>'
    return barDiv;
}

function getBar(percent, index){
    var bar = '<div class=' + barClass[index] + ' style="width:80px;height:' + percent + '%;"></div>';
    return bar;
}

function getBarSpacer(percent){
    var barSpacer = '<div style="width:80px;height:' + percent + '%;"></div>';
    return barSpacer;
}

function getChartSpacer() {
    var spacer = '<div style="width:80px;height:100%;"></div>'
    return spacer;
}
function getXAxisRow() {
    // add horizontal line (x axid)
    var xAxis = '<div style="width:100%;height:1px;background-color:black;"></div>'
    return xAxis;
}

function getYAxis() {
// add horizontal line (x axid)
    var yAxis = '<div style="width:1px;height:100%;background-color:black;"></div>'
    return yAxis;
}
 var barClass = {};
 barClass[0] = "agent-destroys-top";
 barClass[1] = "agent-destroys-bottom";
 barClass[2] = "enemy-lowest-nexus-top";
 barClass[3] = "enemy-lowest-nexus-bottom";
 barClass[4] = "enemy-destroys-top";
 barClass[5] = "enemy-destroys-bottom";
 barClass[6] = "agent-lowest-nexus-top";
 barClass[7] = "agent-lowest-nexus-bottom";

