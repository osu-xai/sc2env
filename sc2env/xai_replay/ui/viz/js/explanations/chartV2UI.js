function getChartV2UI() {
    var ui = {};

    var chartCanvas = undefined;
    ui.whyButtonInfo = undefined;
    ui.rewardBarTooltipManager = undefined;
    ui.backgroundColor = "#eeeeee";
    ui.renderChartDetailed = function(chartData, treatment){
        //specify dimensions
        var canvasHeight = 500;
        var canvasWidth = 700;
        createRewardChartContainer(canvasHeight);
        chartData.initChartDimensions(canvasHeight, canvasWidth, 0.5, 0.0);

        // create canvas
        chartCanvas = document.createElement("canvas");
        chartCanvas.setAttribute("width", canvasWidth);
        chartCanvas.setAttribute("height", canvasHeight);
		chartCanvas.setAttribute("id", "chartV2-canvas");
        chartCanvas.onclick = function(e){
            var x = e.offsetX;
		    var y = e.offsetY;
            var rewardBarName = chartData.getActionBarNameForCoordinates(x, y);
            currentExplManager.chartUI.processRewardBarClick(rewardBarName, chartData, e, treatment);
        }
        // create chartCanvasContainer because some layout issues dealing with canvas directly
        var chartCanvasContainer = document.createElement("div");
        chartCanvasContainer.setAttribute("width", canvasWidth);
        chartCanvasContainer.setAttribute("height", canvasHeight);
        chartCanvasContainer.setAttribute("id", "chartV2-canvas-container");
        
        $("#explanations-rewards").append(chartCanvasContainer);
        $("#chartV2-canvas-container").append(chartCanvas);

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

        var ctx = chartCanvas.getContext("2d");
        $("#chartV2-canvas").css("background-color", this.backgroundColor);
        

        this.renderActionSeparatorLines(chartCanvas, chartData);
        this.renderChartValueLabels(chartCanvas, chartData, 4);
        this.renderChartValueLines(chartCanvas, chartData, 4);
        this.renderZeroValueLabel(chartCanvas, chartData);
        
        this.renderActionBars(chartCanvas, chartData);
        this.renderBars(chartCanvas,chartData, treatment);
        this.renderXAxis(chartCanvas, chartData);
		this.renderYAxis(chartCanvas, chartData);

		this.renderActionNames(chartCanvas, chartData);
		this.renderLegend(chartData);
		this.renderLegendTitle(chartCanvas, chartData);
        this.renderTitle(chartCanvas, chartData);
        this.rewardBarTooltipManager = getRewardBarTooltipManager(chartCanvas,chartData);
	}

    ui.processRewardBarClick = function(rewardBarName, chartData, e, treatment){
        if (userStudyMode){
            if (isSaliencyMapSwitchBlockedByQuestion(treatment)){
                return;
            }
        }
        var logLine = templateMap["selectedRewardBar"];
        logLine = logLine.replace("<SLCT_RWRD_BAR>", rewardBarName);
        chartTargetClickHandler("rewardBar", logLine);
        if (rewardBarName != "None") {
            chartData.clearRewardBarSelections();
            chartData.selectSingleRewardBar(rewardBarName);
            if (treatment == "T3" || treatment== "NA") {
                chartData.clearHighlightSelections();
                var trueRewardBarName = rewardBarName.split(".")[1];
                chartData.highlightSimilarRewardBars(trueRewardBarName);
            }
            this.renderBars(chartCanvas, chartData, treatment);
            var bar = chartData.actionRewardForNameMap[rewardBarName];
            chartData.showSalienciesForRewardName(bar.name);
            currentExplManager.saliencyVisible = true;
            currentExplManager.saliencyCombined = false;
            currentExplManager.render("live");
        }
    }

    ui.renderTitle = function (canvas, chartData) {
		// NOTE: There are no tests for rendering the title
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.fillStyle = "black";
		ctx.font = "bold 20px Arial";
		ctx.fillText(" ", chartData.canvasWidth / 2 - chartData.groupWidthMargin, chartData.canvasHeight * .07);
		ctx.restore();
	}
    ui.renderLegendTitle = function (canvas, chartData) {
		var titleElement = document.getElementById("legend-title");
		var titleContent = document.createTextNode("The agent predicts that, by the end of the game, it will get:");
		titleElement.appendChild(titleContent);
	}
	ui.renderLegend = function (chartData) {
		// NOTE: There are no tests for rendering the legend
		for (var i in chartData.rewardNames) {
			var desc = document.getElementById("legend-desc-" + i);
			var damagedOrDestroyed = chartData.rewardNames[i].split(" ");
			var type;
			if (damagedOrDestroyed[1] == "Damaged") {
				type = "score";
			} else if (damagedOrDestroyed[1] == "Destroyed") {
				if (damagedOrDestroyed[0] == "Enemy") {
					type = "bonus";
				} else {
					type = "penalty";
				}
			}
			var descContent = document.createTextNode("This " + type);
			desc.append(descContent);

			var name = document.getElementById("legend-name-" + i);
			//font stuff in here for css
			var content = document.createTextNode("for " + chartData.rewardNames[i] + " on all future maps");
			/**********************************************************************************************
			 * Author: Andrew Anderson
			 * Purpose: Changing Friend Damaged to "Friendly Fort Damaged" without trying to break things
			 * Date made: 9/4/2018
			 * Date mod:  9/4/2018
			 **********************************************************************************************/
			if ( chartData.rewardNames[i] == "Friend Damaged" ){
				var content = document.createTextNode( "for Friendly Fort Damaged on all future maps" );
			}
			if ( chartData.rewardNames[i] == "Friend Destroyed" ){
				var content = document.createTextNode( "for Friendly Fort Destroyed on all future maps" );
			}
			if ( chartData.rewardNames[i] == "Enemy Damaged" ){
				var content = document.createTextNode( "for Enemy Fort Damaged on all future maps" );
			}
			if ( chartData.rewardNames[i] == "Enemy Destroyed" ){
				var content = document.createTextNode( "for Enemy Fort Destroyed on all future maps" );
			}
			/**********************************************************************************************
			 * 									END OF RENAMING
			 *********************************************************************************************/
			name.appendChild(content);
		}	
		var totalName = document.getElementById("legend-total-name");
		var totalContent = document.createTextNode("Sum of above rewards");
		totalName.appendChild(totalContent);
	}

	ui.renderActionBars = function (canvas, chartData){
		var ctx = canvas.getContext("2d");
		for (var i in chartData.actions) {
			var bar = chartData.actions[i];
			chartData.positionActionBar(bar, i);
			chartData.dimensionActionBar(bar);
			this.renderBar(ctx, bar, "normal");
		}
	}


	ui.renderActionNames = function (canvas, chartData) {
		chartData.positionActionLabels(30);
		var ctx = canvas.getContext("2d");
		for (var i = 0; i < chartData.actions.length; i++) {
            ctx.save();
            ctx.fillStyle = "black";
			ctx.font = "bold 15px Arial";
			ctx.fillText(chartData.actionNames[i], chartData.actions[i].actionLabelOriginX - chartData.groupWidthMargin, chartData.actions[i].actionLabelOriginY)
            ctx.restore();
		}
	}
	
	ui.renderZeroValueLabel = function (canvas, chartData) {
		// NOTE: there is no test for the zero value label
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.fillStyle = "black";
		ctx.font = "bold 10px Arial";
		ctx.fillText(0, chartData.groupWidthMargin - 25, chartData.canvasHeight / 2);
		ctx.restore();
	}

	ui.renderChartValueLabels = function (canvas, chartData, numberOfLines) {
		chartData.positionValueMarkers(numberOfLines);
		var ctx = canvas.getContext("2d");
		for (var i = 0; i < numberOfLines; i++) {
            ctx.save();
            ctx.fillStyle = "black";
            ctx.font = "bold 10px Arial";
			ctx.fillText(chartData.positiveMarkerValues[i], chartData.groupWidthMargin - 25, chartData.canvasHeight / 2 - Number(chartData.positiveMarkerYPixelsFromXAxis[i]));
			ctx.fillText(-chartData.positiveMarkerValues[i], chartData.groupWidthMargin - 25, chartData.canvasHeight / 2 + Number(chartData.positiveMarkerYPixelsFromXAxis[i]));
            ctx.restore();
		}
	}


	ui.renderChartValueLines = function (canvas, chartData, numberOfLines) {
		chartData.positionValueLines(numberOfLines);
		var ctx = canvas.getContext("2d");
		for (var i = 0; i < numberOfLines; i++) {
			ctx.save();
			ctx.strokeStyle = "grey";
			ctx.beginPath();
			ctx.moveTo(chartData.positiveLineOriginX, chartData.positiveLineOriginY[i]);
			ctx.lineTo(Number(chartData.positiveLineOriginX) + Number(chartData.positiveLineLength), chartData.positiveLineOriginY[i]);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.moveTo(chartData.positiveLineOriginX, chartData.canvasHeight / 2 - chartData.positiveMarkerYPixelsFromXAxis[i]);
			ctx.lineTo(Number(chartData.positiveLineOriginX) + Number(chartData.positiveLineLength), chartData.canvasHeight / 2 - chartData.positiveMarkerYPixelsFromXAxis[i]);
			ctx.stroke()
			ctx.closePath();
			ctx.restore();
		}
	}

	ui.renderActionSeparatorLines = function (canvas, chartData) {
		chartData.positionActionSeparatorLines();
		var ctx = canvas.getContext("2d");
		for (var i = 0; i < chartData.actions.length - 1; i++) {
			ctx.save();
			ctx.strokeStyle = "red";
			ctx.beginPath();
			ctx.setLineDash([5, 15]);
			ctx.moveTo(chartData.actionLinesOriginX[i], chartData.actionLinesOriginY);
			ctx.lineTo(chartData.actionLinesOriginX[i], Number(chartData.actionLinesOriginY) + Number(chartData.actionLinesLength));
			ctx.stroke();
			ctx.restore();
		}
	}

	ui.renderXAxis = function (canvas, chartData) {
		chartData.positionXAxisLine();
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(chartData.xAxisOriginX, chartData.xAxisOriginY);
		ctx.lineTo(Number(chartData.xAxisOriginX) + Number(chartData.xAxisLength), chartData.xAxisOriginY);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}

	ui.renderYAxis = function (canvas, chartData) {
		chartData.positionYAxisLine();
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(chartData.yAxisOriginX, chartData.yAxisOriginY);
		ctx.lineTo(chartData.yAxisOriginX, Number(chartData.yAxisOriginY) + Number(chartData.yAxisLength));
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}	
	ui.renderPattern = function (color) {
		var p = document.createElement("canvas")
		p.width=32;
		p.height=16;
		var pctx=p.getContext('2d');
		
		var x0=36;
		var x1=-4;
		var y0=-2;
		var y1=18;
		var offset=32;
	
		pctx.imageSmoothingEnabled = true;
		pctx.strokeStyle = color;
		pctx.lineWidth=4;
		pctx.beginPath();
		pctx.moveTo(x0,y0);
		pctx.lineTo(x1,y1);
		pctx.moveTo(x0-(offset / 2),y0);
		pctx.lineTo(x1-(offset / 2),y1);
		pctx.moveTo(x0-offset,y0);
		pctx.lineTo(x1-offset,y1);
		pctx.moveTo(x0+(offset / 2),y0);
		pctx.lineTo(x1+(offset / 2),y1);
		pctx.moveTo(x0+offset,y0);
		pctx.lineTo(x1+offset,y1);
		pctx.stroke();	

		return p;
	}
	ui.renderBars = function (canvas, chartData, treatment) {
		var ctx = canvas.getContext("2d");
		for (var i=0; i<chartData.actions.length; i++) {
			var action = chartData.actions[i];
			for (var j=0; j<chartData.rewardNames.length; j++) {
				var bar = action.bars[j];
				chartData.positionRewardBar(bar, i, j);
				chartData.dimensionRewardBar(bar);
				if (bar.selected == true) {
					var saveSelected = bar;
				} else if (bar.highlight == true) {
					this.renderBar(ctx, bar, "gradient");
				} else {
					this.renderBar(ctx, bar, "normal");
				}	
			}
		}
		if (saveSelected != undefined) {
			if (treatment == "T3") {
				this.renderBar(ctx, saveSelected, "outlineT3");
            }
            else if (treatment == "NA") {
                this.renderBar(ctx, saveSelected, "outlineBlue");
            }
			else {
				this.renderBar(ctx, saveSelected, "outline");
			}
		}
	}	
	ui.renderBar = function (ctx, bar, mode) {
		// originY is always on the x axis
		ctx.save();
		var x0 = bar.originX;
		var y0 = bar.originY;

		var upperLeftOriginX = x0;
		var upperLeftOriginY = undefined;
		if (bar.value > 0) {
			upperLeftOriginY = y0 - bar.height;
		}
		else {
			upperLeftOriginY = y0;
		}	
		ctx.beginPath();

		if (mode == "outlineT3") {
			ctx.clearRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
			ctx.lineWidth = shape_outline_width;
			ctx.strokeStyle = "white";
			ctx.strokeRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			var rgbaBarColor = hexToRgbA(bar.color);
			ctx.fillStyle = rgbaBarColor + " 0.7)";
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			var pattern = this.renderPattern(bar.color);
			ctx.fillStyle = ctx.createPattern(pattern, 'repeat');
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
	
		} else if (mode == "outlineBlue") {
            var adjustedBarHeight = 0;
            if (bar.value > 0) {
                upperLeftOriginOutline = upperLeftOriginY - 3;
                heightOutline = bar.height + 3;
            }
            else {
                upperLeftOriginOutline = upperLeftOriginY;
                heightOutline = bar.height + 3;
            }	
			ctx.clearRect(upperLeftOriginX - 3, upperLeftOriginOutline, bar.width + 6, heightOutline);
            ctx.strokeStyle = "blue";
			ctx.strokeRect(upperLeftOriginX - 3, upperLeftOriginOutline, bar.width + 6, heightOutline);

			var rgbaBarColor = hexToRgbA(bar.color);
			ctx.fillStyle = rgbaBarColor + " 0.7)";
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			var pattern = this.renderPattern(bar.color);
			ctx.fillStyle = ctx.createPattern(pattern, 'repeat');
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
	
        } else if (mode == "outline") {
			ctx.clearRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
			ctx.lineWidth = shape_outline_width;
			ctx.strokeStyle = "white";
			ctx.strokeRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
		
			ctx.fillStyle = bar.color;
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
		} else if (mode == "gradient") {
			ctx.clearRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
			ctx.lineWidth = shape_outline_width;
			ctx.strokeStyle = bar.color;

			ctx.strokeRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			var rgbaBarColor = hexToRgbA(bar.color);
			ctx.fillStyle = rgbaBarColor + " 0.7)";
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			var pattern = this.renderPattern(bar.color);
			ctx.fillStyle = ctx.createPattern(pattern, 'repeat');
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
		} else {
			ctx.lineWidth = shape_outline_width;
			ctx.strokeStyle = bar.color;

			ctx.strokeRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);

			ctx.fillStyle = bar.color;
			ctx.fillRect(upperLeftOriginX, upperLeftOriginY, bar.width, bar.height);
		}
		ctx.restore();
	}
	return ui;
}


var selectedDecisionStep = undefined;

function processWhyClick(step) {
    var explanationStep = sessionIndexManager.getStepThatStartsEpochForStep(step);
	if (selectedDecisionStep == explanationStep && currentExplManager.chartVisible == true) {
        currentExplManager.chartVisible = false;
        currentExplManager.saliencyVisible = false;
		selectedDecisionStep = undefined;
		currentExplManager.render("live");
		// engage selection color for supporting areas
		//$("#why-questions").toggleClass('active');
		//$("#why-label").toggleClass('active');
	}	
	else {
		currentExplManager.chartVisible = true;
		// show explanation info for new step
        selectedDecisionStep = explanationStep;
        currentExplManager.render("live");
	}
}

function cleanExplanationUI() {
	$("#explanations-rewards").empty();
	$("#action-name-label").html(" ");
	clearQuestionControls();
	if ($("#rewards-titled-container").length) {
		$("#rewards-titled-container").remove();
    }
    if (currentExplManager != undefined) {
        currentExplManager.applyFunctionToEachCachedDataset(detachChannelItem, "titledMapDiv");	// so they don't get tossed
    }
	$("#saliency-div").remove();
}


function createRewardChartContainer(canvasHeight) {
	var rewardTitleContainer = document.createElement("DIV");
	rewardTitleContainer.setAttribute("id", "rewards-titled-container");
	rewardTitleContainer.setAttribute("class", "flex-column titled-container rewards-bg");
	//rewardTitleContainer.setAttribute("class", "flex-column titled-container r0c1 rewards-bg");
	rewardTitleContainer.setAttribute("style", "float:left;white-space:nowrap;width:auto;");
	$("#game-chart-container").append(rewardTitleContainer);	

	var whyQuestionsDiv = document.createElement("DIV");
	whyQuestionsDiv.setAttribute("id", "why-questions-div");
	whyQuestionsDiv.setAttribute("class", "rewards-bg flex-row");
	whyQuestionsDiv.setAttribute("style", "margin:auto;font-family:Arial;padding:10px;");
	//$("#rewards-titled-container").append(whyQuestionsDiv);

	var whyActionLabel = document.createElement("DIV");
	whyActionLabel.setAttribute("id", "why-action-label");
	whyActionLabel.setAttribute("class", "rewards-bg");
	whyActionLabel.setAttribute("style", "font-family:Arial;font-size:14px;");
	//$("#why-questions-div").append(whyActionLabel);

	var whyLabel = document.createElement("DIV");
	whyLabel.setAttribute("id", "why-label");
	whyLabel.setAttribute("class", "rewards-bg");
	whyLabel.setAttribute("style", "font-family:Arial;");
	//$("#why-questions-div").append(whyLabel);


	var whyRadios = document.createElement("DIV");
	whyRadios.setAttribute("id", "why-radios");
	whyRadios.setAttribute("class", "rewards-bg flex-row");
	whyRadios.setAttribute("style", "margin:auto;font-family:Arial;padding:10px;font-size:14px;");
	//$("#rewards-titled-container").append(whyRadios);

    var explanationRewards = document.createElement("DIV");
    explanationRewards.setAttribute("height", canvasHeight + "px");
	explanationRewards.setAttribute("id", "explanations-rewards");
	explanationRewards.setAttribute("class", "rewards-bg flex-row");
	explanationRewards.setAttribute("style", "margin-left:20px; margin-right: 20px; margin-top: 20px; margin-bottom:0px; font-family:Arial;");
	$("#rewards-titled-container").append(explanationRewards);

	var whatDiv = document.createElement("DIV");
	whatDiv.setAttribute("id", "what-div");
	whatDiv.setAttribute("class", "flex-row rewards-bg");
	whatDiv.setAttribute("style", "font-family:Arial;padding:10px;height:60px");
	$("#rewards-titled-container").append(whatDiv);

	var whatButtonDiv = document.createElement("DIV");
	whatButtonDiv.setAttribute("id", "what-button-div");
	whatButtonDiv.setAttribute("class", "rewards-bg");
	whatButtonDiv.setAttribute("style", "margin-left: 200px;align-self:center;");
	$("#what-div").append(whatButtonDiv);

	var whatRadios = document.createElement("DIV");
	whatRadios.setAttribute("id", "what-radios");
	whatRadios.setAttribute("class", "flex-row rewards-bg");
	whatRadios.setAttribute("style", "align-items:center;");
	$("#what-div").append(whatRadios);

    if (userStudyMode){
        $("#rewards-titled-container").on("click", regionClickHandlerRewards);
    }
	
	var whatSpacerDiv = document.createElement("DIV");
	whatSpacerDiv.setAttribute("id", "what-spacer-div");
	whatSpacerDiv.setAttribute("class", "rewards-bg");
	whatSpacerDiv.setAttribute("style", "margin:auto;");
	$("#rewards-titled-container").append(whatSpacerDiv);
}



function populateRewardQuestionSelector() {
	//$("#why-radios").empty();

	// REWARDS SECTION

	// NEW_CHART showing or not
	// NEW_CHART user study yes/no
	var radioDetailedRewards = document.createElement("input");
	radioDetailedRewards.setAttribute("type", "radio");
	radioDetailedRewards.setAttribute("id", "radio-detailed-rewards");
	radioDetailedRewards.setAttribute("name", "rewardView");
	radioDetailedRewards.setAttribute("value", "rewardDetailed");
	radioDetailedRewards.setAttribute("style", "margin-left:20px; ");
	radioDetailedRewards.setAttribute("checked", "true");
	// radioDetailedRewards.onclick = function(e) {
	// 	var logLine = templateMap["setRewardView"];
	// 	logLine = logLine.replace("<SET_RWRD_VIEW>", "detailedRewards");
	//     targetClickHandler(e, logLine);
	//     if (userStudyMode) {
	//         stateMonitor.showedDetailedRewards();
	//     }
	// 	//showRewards("rewards.detailed");
	// };

	var detailedRewardsLabel = document.createElement("div");
	detailedRewardsLabel.setAttribute("style", "margin-left:10px;font-family:Arial;font-size:14px;");
	detailedRewardsLabel.innerHTML = "detailed rewards";

	//$("#why-radios").append(radioDetailedRewards);
	//$("#why-radios").append(detailedRewardsLabel);
}



function addWhatButton() {
	$("#what-button-div").empty();
	var whatButton = document.createElement("BUTTON");
	var buttonId = "what-button";
	whatButton.setAttribute("id", buttonId);
	var what = document.createTextNode("what was relevant?");
	whatButton.appendChild(what);
	whatButton.setAttribute("style", "padding:6px;margin-right:30px;font-family:Arial;");

	$("#what-button-div").append(whatButton);
	$("#" + buttonId).click(function (e) {
		if (currentExplManager.saliencyVisible) {
			var logLine = templateMap["hideSaliency"];
			logLine = logLine.replace("<HIDE_SALNCY>", "NA");
			targetClickHandler(e, logLine);
			//targetClickHandler(e,"hideSaliency:NA");
		}
		else {
			var logLine = templateMap["showSaliency"];
			logLine = logLine.replace("<SHW_SALNCY>", "NA");
			targetClickHandler(e, logLine);
			//targetClickHandler(e,"showSaliency:NA");
		}
		e.preventDefault();
		processWhatClick();
	})
}

// with T3's question design, once the user selects a rewardbar, we want to ensure that
// they don't change the saliency map (by clicking on another bar) before answering the 
// saliency map question - otherwise non-relevant maps might be in play.
function isSaliencyMapSwitchBlockedByQuestion(treatment){
    if (treatment != "T3"){
        return false;
    }
    // we know it's T3
    var isSaliencyMapClickQuestion = activeStudyQuestionManager.isCurrentQuestionWaitForClickOnSaliencyMap();
    var isSaliencyMapRelatedQuestion = activeStudyQuestionManager.isPlainQuestionFocusedOnPriorChosenSaliencyMap();
    if (isSaliencyMapClickQuestion || isSaliencyMapRelatedQuestion) {
        return true;
    }
    return false;
}