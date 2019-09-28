function createLegendForTreeChart(){
    
    // append legend div in explanationRewards so will be right of chartCanvas
    var legendDiv = document.createElement("DIV");
    //legendDiv.setAttribute("height", canvasHeight);
    legendDiv.setAttribute("id", "legend-div");
    legendDiv.setAttribute("class", "flex-column");
    legendDiv.setAttribute("style", "background-color:" + this.backgroundColor + ";height:" + canvasHeight + "px;");
    $("#explanations-rewards").append(legendDiv);

    // create legend area where names and boxes will exist
    var legendRewards = document.createElement("DIV");
    legendRewards.setAttribute("id", "legend-rewards");
    legendRewards.setAttribute("class", "grid");
    legendRewards.setAttribute("style", "background-color:" + this.backgroundColor + ";padding:6px");
    $("#legend-div").append(legendRewards);

    // append legend title to legend area
    var legendTitle = document.createElement("DIV");
    legendTitle.setAttribute("id", "legend-title");
    legendTitle.setAttribute("class", "r0c0_1");
    legendTitle.setAttribute("style", "height:20px;padding:5px");
    $("#legend-rewards").append(legendTitle);

    // append desc, legend names, and boxes to legend area
    for (var i in chartData.rewardNames) {
        var iPlusOne = Number(i) + 1;
        if (iPlusOne % 2 == 0) {
            var rewardDesc = document.createElement('DIV');
            rewardDesc.setAttribute("id", "legend-desc-" + i);
            rewardDesc.setAttribute("class", "r" + iPlusOne + "c0");
            rewardDesc.setAttribute("style", "height:20px;width:100px;position:relative;left:15px;padding-top:3px;padding-right:5px;padding-bottom:10px");
            $("#legend-rewards").append(rewardDesc);

            var rewardBox = document.createElement("DIV");
            rewardBox.setAttribute("id", "legend-box-" + i);
            rewardBox.setAttribute("class", "r" + iPlusOne + "c1");
            rewardBox.setAttribute("style", "background-color:" + chartData.colors[i] + ";height:17px;width:17px;position:relative;top:2px;");
            $("#legend-rewards").append(rewardBox);

            var rewardInfo = document.createElement("DIV");
            rewardInfo.setAttribute("id", "legend-name-" + i);
            rewardInfo.setAttribute("class", "r" + iPlusOne + "c2");
            rewardInfo.setAttribute("style", "height:20px;padding-top:3px;padding-left:3px;padding-bottom:10px");
            $("#legend-rewards").append(rewardInfo);

        } else {
            var rewardDesc = document.createElement('DIV');
            rewardDesc.setAttribute("id", "legend-desc-" + i);
            rewardDesc.setAttribute("class", "r" + iPlusOne + "c0");
            rewardDesc.setAttribute("style", "height:20px;width:100px;position:relative;left:15px;padding-top:3px;padding-right:5px");
            $("#legend-rewards").append(rewardDesc);

            var rewardBox = document.createElement("DIV");
            rewardBox.setAttribute("id", "legend-box-" + i);
            rewardBox.setAttribute("class", "r" + iPlusOne + "c1");
            rewardBox.setAttribute("style", "background-color:" + chartData.colors[i] + ";height:17px;width:17px;position:relative;top:2px;");
            $("#legend-rewards").append(rewardBox);

            var rewardInfo = document.createElement("DIV");
            rewardInfo.setAttribute("id", "legend-name-" + i);
            rewardInfo.setAttribute("class", "r" + iPlusOne + "c2");
            rewardInfo.setAttribute("style", "height:20px;padding-top:3px;padding-left:3px");
            $("#legend-rewards").append(rewardInfo);
        }

    }
    // append legend total name and box to legend area
    var rewardLegendTotalBox = document.createElement("DIV");
    rewardLegendTotalBox.setAttribute("id", "legend-box-" + i);
    rewardLegendTotalBox.setAttribute("class", "r" + Number(chartData.rewardNames.length + 1) + "c1");
    rewardLegendTotalBox.setAttribute("style", "background-color:" + chartData.actions[0].color + ";height:17px;width:17px;position:relative;top:4px;");
    $("#legend-rewards").append(rewardLegendTotalBox);
    var rewardLegendTotal = document.createElement("DIV");
    rewardLegendTotal.setAttribute("id", "legend-total-name");
    rewardLegendTotal.setAttribute("class", "r" + Number(chartData.rewardNames.length + 1) + "c2");
    rewardLegendTotal.setAttribute("style", "height:20px;padding-top:3px;padding-left:3px");
    $("#legend-rewards").append(rewardLegendTotal);

}


function renderLegendTitle() {
    var titleElement = document.getElementById("legend-title");
    var titleContent = document.createTextNode("Game Outcome Predictions");
    titleElement.appendChild(titleContent);
}