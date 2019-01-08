function getSaliencyV2UI() {
    var ui = {};
    ui.uimap = getSaliencyV2UIMap();

    ui.renderSaliencyAccessControls = function() {
        clearSaliencyControls();
        populateSaliencyQuestionSelector();
        if (!userStudyMode){
            addWhatButton();
        }
    }
   
    ui.getContextStringForDetailedSaliencyMapRow = function(barType){
        if (barType == "action"){
            return "Saliency maps for action";
        }
        else {
            // assume "reward"
            return "Saliency maps for reward";
        }
    }
    
    ui.getContextStringForCombinedSaliencyMapRow = function(barType){
        if (barType == "action"){
            return "Combined saliency map for action";
        }
        else {
            // assume "reward"
            return "Combined saliency map for reward";
        }
	}

    ui.getNormalizationKey = function(bar, channelName){
         // actionName   rewardName  channelName
        var actionName = "";
        var rewardName = "";
        if (bar.type == "action"){
            actionName = bar.fullName;
            rewardName = "Reward Sum Total";
        }
        else {
            actionName = bar.actionName;
            rewardName = bar.name;
        }

        return actionName + "-" + rewardName + "-" + channelName;
    }

    ui.configureBarChannel = function(bar, channel, expLayer){
		var name = expLayer.getName();
		channel.dpEntityList = bar.dpEntityList;
        channel.width = expLayer.getWidth();
        channel.height = expLayer.getHeight();
        channel.name = renameEntityInfoForIUI(name);
        //bar.channelNames.push(name);
        //channel.id = convertNameToLegalId(rowInfoString + channelName);
        channel.cells = expLayer.getCellsList();;
        channel.normalizationKey = this.getNormalizationKey(bar, channel.name);
        //console.log("the key is: " + channel.normalizationKey);
        channel.scaleFactor = 1.0;
        channel.saliencyId = bar.saliencyId;
        channel.id = convertNameToLegalId(prependDPNumber(bar.saliencyId + "--" + channel.name));
        channel.overlayActive = false;
        channel.outlineActive = false;
        this.configureIds(channel);
        this.uimap.buildExplChannel(channel);
    }

   
    ui.buildSaliencyDetailedForBar = function(bar){
        var layerMessage = saliencyLookupMap.get(bar.saliencyId);
        if (layerMessage == undefined){
            console.log("ERROR - no Layer message for saliencyID " + bar.saliencyId);
            return;
        }
        
        // configure
        var expLayers = layerMessage.getLayersList();
        if (bar.channels == undefined){
            bar.channels = {};
            for (var j in expLayers) {
                var channel = {};
                bar.channels[j] = channel;
                expLayer = expLayers[j];
                this.configureBarChannel(bar, channel, expLayer);
            }
        }
    }

	ui.renderSaliencyDetailed = function(chartData) {
        var step = sessionIndexManager.getCurrentIndex();
        step = sessionIndexManager.getStepThatStartsEpochForStep(step);
        var dpEntityList = currentExplManager.entityListForDP[step];
        currentExplManager.applyFunctionToEachCachedDataset(detachChannelItem, "titledMapDiv");
        $("#saliency-div").remove();
        createSaliencyContainers();
        var selectedBars = chartData.getBarsFlaggedForShowingSaliency();
        
        for (var i in selectedBars){
            var bar = selectedBars[i];
            if (bar.channels == undefined){
                bar.dpEntityList = dpEntityList;
                this.buildSaliencyDetailedForBar(bar);
            }
        }
		for (var i in selectedBars){
            var bar = selectedBars[i];
            //render
            var contextString = this.getContextStringForDetailedSaliencyMapRow(bar.type);
            var nameContainerDiv = getNameDivForRow(i, bar, contextString);
            $("#saliency-maps").append(nameContainerDiv);

            for (var j in bar.channels){
                var ch = bar.channels[j];
                this.uimap.renderExplChannel(Number(j) + Number(1), i, ch);
            }
        }
        this.engageActiveOverlaysAndOutlines(selectedBars);
        // when answer question remove all overlays and outlines , but don't set flags to false
	}

    ui.removeAllOverlaysAndOutlines = function(chartData) {
        for (var i in chartData.actions){
            var action = chartData.actions[i];
            this.removeAllOverlaysAndOutlinesFromBar(action);
            for (var j in action.bars){
                var bar = action.bars[j];
                this.removeAllOverlaysAndOutlinesFromBar(bar);
            }
        }
    }

    ui.removeAllOverlaysAndOutlinesFromBar = function(bar) {
        var channels = bar.channels;
        for (j in channels) {
            var channel = channels[j];
            if (channel.overlayActive){
                $("#" + channel.overlayCanvas.getAttribute("id")).detach();
            }
            if (channel.outlineActive) {
                $("#" + channel.outlineDiv.getAttribute("id")).detach();
            }
        }
    }
    
    ui.forgetAllOverlaysAndOutlines = function(chartData) {
        for (var i in chartData.actions){
            var action = chartData.actions[i];
            this.forgetAllOverlaysAndOutlinesFromBar(action);
            for (var j in action.bars){
                var bar = action.bars[j];
                this.forgetAllOverlaysAndOutlinesFromBar(bar);
            }
        }
    }

    ui.forgetAllOverlaysAndOutlinesFromBar = function(bar) {
        var channels = bar.channels;
        for (j in channels) {
            var channel = channels[j];
            channel.overlayActive = false;
            channel.outlineActive = false;
        }
    }

    ui.engageActiveOverlaysAndOutlinesSaliencyCombined = function(selectedBars){
        for (var i in selectedBars){
            var bar = selectedBars[i];
            var combinedChannel = bar.combinedChannel;
            if (combinedChannel.overlayActive){
                $("#scaii-gameboard").append( combinedChannel.overlayCanvas );
            }
            if (combinedChannel.outlineActive) {
                combinedChannel.mapHostDiv.appendChild( combinedChannel.outlineDiv );
            }
        }
    }
    
    ui.engageActiveOverlaysAndOutlinesSaliencyDetailed = function(selectedBars){
        for (var i in selectedBars){
            var bar = selectedBars[i];
            var channels = bar.channels;
            for (j in channels) {
                var channel = channels[j];
                if (channel.overlayActive){
                    $("#scaii-gameboard").append( channel.overlayCanvas );
                }
                if (channel.outlineActive) {
                    channel.mapHostDiv.appendChild( channel.outlineDiv );
                }
            }
        }
    }

    ui.engageActiveOverlaysAndOutlines = function(selectedBars) {
        if (currentExplManager.saliencyCombined){
           this.engageActiveOverlaysAndOutlinesSaliencyCombined(selectedBars);
        }
        else {
            this.engageActiveOverlaysAndOutlinesSaliencyDetailed(selectedBars);
        }
    }

    ui.configureIds = function(channel){
        channel.saliencyMapId       = "saliencyMap--" + channel.id;
        channel.gameboardOverlayId  = "gameOverlay--" + channel.id;
        channel.outlineDivId        = "outlineDiv--"  + channel.id;
        channel.titledMapDivId      = "titledMapDiv-" + channel.id;
        channel.titleId             = "title--"       + channel.id;
        channel.mapHostDivId        = "mapHost --"    + channel.id;
    }
    
	ui.renderSaliencyCombined = function(chartData) {
        var step = sessionIndexManager.getCurrentIndex();
        step = sessionIndexManager.getStepThatStartsEpochForStep(step);
        var dpEntityList = currentExplManager.entityListForDP[step];
        currentExplManager.applyFunctionToEachCachedDataset(detachChannelItem, "titledMapDiv");
        $("#saliency-div").remove();
        createSaliencyContainers();
        var selectedBars = chartData.getBarsFlaggedForShowingSaliency();
        
        for (var i in selectedBars){
            var bar = selectedBars[i];
            if (bar.combinedChannel == undefined){
                bar.dpEntityList = dpEntityList;
                this.configureCombinedChannelForBar(bar);
            }
        }
		for (var i in selectedBars){
            var bar = selectedBars[i];
            //render
            var contextString = this.getContextStringForDetailedSaliencyMapRow(bar.type);
            var nameContainerDiv = getNameDivForRow(i, bar, contextString);
            $("#saliency-maps").append(nameContainerDiv);

            
            this.uimap.renderExplChannel(1, i, bar.combinedChannel);

        }
        this.engageActiveOverlaysAndOutlines(selectedBars);
        // when answer question remove all overlays and outlines , but don't set flags to false
	}

    ui.configureCombinedChannelForBar = function(bar){
        var layerMessage = saliencyLookupMap.get(bar.saliencyId);
        if (layerMessage == undefined){
            console.log("ERROR - no Layer message for saliencyID " + bar.saliencyId);
            return;
        }
        var combinedChannel = {};
        bar.combinedChannel = combinedChannel;
        var expLayers = layerMessage.getLayersList();
        combinedChannel.dpEntityList = bar.dpEntityList;
        combinedChannel.contextString = this.getContextStringForCombinedSaliencyMapRow(bar.type);
        combinedChannel.width = expLayers[0].getWidth();
        combinedChannel.height = expLayers[0].getHeight();
        combinedChannel.name = "all features";
        combinedChannel.cells = getAggregatedCells(expLayers);
        combinedChannel.normalizationKey = "Combined-standin-saliency";// FIXME (Evan)
        combinedChannel.scaleFactor = 1.0;
        combinedChannel.saliencyId = bar.saliencyId;
        combinedChannel.id = convertNameToLegalId(prependDPNumber(bar.saliencyId + "--" + combinedChannel.name));
        combinedChannel.overlayActive = false;
        combinedChannel.outlineActive = false;
        this.configureIds(combinedChannel);
        this.uimap.buildExplChannel(combinedChannel);
    }

 
    return ui;
}


function removeAnySaliencyOverlaysFromGameboard(){
    $("[id^='gameOverlay--']").detach();
}

/*
*  The titleMapDivs are loaded up in the creation phase and hooked into the UI at render phase.
*  Thus, as we clean saliencies out prior to rendering other ones, we detach all those so they
*  be be intact when needed again.
*/
function detachChannelItem(chartData, itemName){
    for (var i in chartData.actions){
        var action = chartData.actions[i];
        detachChannelItemFromBar(action, itemName);
        for (var j in action.bars){
            var bar = action.bars[j];
            detachChannelItemFromBar(bar, itemName);
        }
    }
}

function detachChannelItemFromBar(bar, itemName) {
    if (bar.channels != undefined){
        for (var i in bar.channels) {
            var channel = bar.channels[i];
            if (channel[itemName] != undefined) {
                var id = channel[itemName].getAttribute("id");
                $("#" + id).detach();
            }
        }
    }
    if (bar.combinedChannel != undefined) {
        if (bar.combinedChannel[itemName] != undefined) {
            var id = bar.combinedChannel[itemName].getAttribute("id");
            $("#" + id).detach();
        }
    }
}

function getRowInfoString(bar) {
    var parts = bar.fullName.split(".");
    var result = "";
    if (parts.length == 1){
        result = parts[0]; 
    }
    else {
        result = parts[0] + ', ' + parts[1];
    } 
	return result;
}


function getAggregatedCells(expLayers){
	var result = [];
	var cellsCount = expLayers[0].getCellsList().length;
	for (i = 0; i < cellsCount; i++) {
		var totalForCell = 0;
		for (var j in expLayers){
			var expLayer = expLayers[j];
			totalForCell = totalForCell + expLayer.getCellsList()[i];
		}
		result[i] = totalForCell;
	}
	return result;
}

function getNameDivForRow(rowIndex, bar, contextString){
    var nameContainerDiv = document.createElement("div");
    nameContainerDiv.setAttribute("class", "flex-column");
	nameContainerDiv.setAttribute("style", getGridPositionStyle(0,rowIndex) + '; width:200px;text-align:center; border-style: solid; border-width:1px;font-family:Arial;');
    
    var contextDiv = document.createElement("div");
	contextDiv.setAttribute("style", 'width:200px;padding-top:100px; text-align:center; font-family:Arial;');
    contextDiv.innerHTML = contextString; 
    nameContainerDiv.append(contextDiv);

    var nameDiv = document.createElement("div");
	nameDiv.setAttribute("style", 'width:200px;padding-top:25px; text-align:center; font-family:Arial;');
    nameDiv.innerHTML = getRowInfoString(bar);     
    nameContainerDiv.append(nameDiv);
	return nameContainerDiv;
}

function createSaliencyContainers() {
	var saliencyDiv = document.createElement("DIV");
	saliencyDiv.setAttribute("id", "saliency-div");
	saliencyDiv.setAttribute("class", "saliencies-bg");
	saliencyDiv.setAttribute("style", "display:block;clear:both;");
	$("#scaii-interface").append(saliencyDiv);

	var saliencyGroup = document.createElement("DIV");
	saliencyGroup.setAttribute("id", "saliency-group");
	saliencyGroup.setAttribute("class", "flex-row saliencies-bg");
	//saliencyGroup.setAttribute("style", "margin-left:20px; margin-top:20px; margin-right: 20px;");
	$("#saliency-div").append(saliencyGroup);

	var saliencyContent = document.createElement("DIV");
	saliencyContent.setAttribute("id", "saliency-content");
	saliencyContent.setAttribute("class", "flex-column saliencies-bg");
	$("#saliency-group").append(saliencyContent);

	
	var saliencyMapsTitledContainer = document.createElement("DIV");
	saliencyMapsTitledContainer.setAttribute("id", "saliency-maps-titled-container");
	saliencyMapsTitledContainer.setAttribute("class", "titled-container flex-column saliencies-bg");
	$("#saliency-content").append(saliencyMapsTitledContainer);

	var saliencyMaps = document.createElement("DIV");
	saliencyMaps.setAttribute("id", "saliency-maps");
	saliencyMaps.setAttribute("class", "grid");
	$("#saliency-maps-titled-container").append(saliencyMaps);

    $("#saliency-div")      .on("click",regionClickHandlerSaliency);
}


function populateSaliencyQuestionSelector(){
	$("#what-radios").empty();
	
	// SALIENCY SECTION
	var radioCombinedSaliency = document.createElement("input");
	radioCombinedSaliency.setAttribute("type","radio");
	radioCombinedSaliency.setAttribute("name","saliencyView");
	radioCombinedSaliency.setAttribute("id","relevance-combined-radio");
	radioCombinedSaliency.setAttribute("value","saliencyCombined");
    radioCombinedSaliency.setAttribute("style", "margin-left:20px;");
    if (currentExplManager.saliencyCombined){
        radioCombinedSaliency.setAttribute("checked", "true");
    }
	radioCombinedSaliency.onclick = function(e) {
        currentExplManager.saliencyCombined = true;
        if (userStudyMode){
            targetClickHandler(e, "setSaliencyView:combinedSaliency");
        }
        removeAnySaliencyOverlaysFromGameboard();
        currentExplManager.render("live");
	};

	var combinedSaliencyLabel = document.createElement("div");
	combinedSaliencyLabel.setAttribute("style", "margin-left:10px;margin-top:3px;font-family:Arial;font-size:14px;");
	combinedSaliencyLabel.innerHTML = "relevance combined";
	combinedSaliencyLabel.setAttribute("id","relevance-combined-label");

	var radioDetailedSaliency = document.createElement("input");
	radioDetailedSaliency.setAttribute("type","radio");
	radioDetailedSaliency.setAttribute("name","saliencyView");
	radioDetailedSaliency.setAttribute("id","relevance-detailed-radio");
	radioDetailedSaliency.setAttribute("value","saliencyDetailed");
    radioDetailedSaliency.setAttribute("style", "margin-left:20px;");
    if (!currentExplManager.saliencyCombined){
        radioDetailedSaliency.setAttribute("checked", "true");
    }
	radioDetailedSaliency.onclick = function(e) {
        currentExplManager.saliencyCombined = false;
        if (userStudyMode){
            targetClickHandler(e, "setSaliencyView:detailedSaliency");
        }
        removeAnySaliencyOverlaysFromGameboard();
        currentExplManager.render("live");
	};

	var detailedSaliencyLabel = document.createElement("div");
	detailedSaliencyLabel.setAttribute("style", "margin-left:10px;margin-top:3px;font-family:Arial;font-size:14px;");
	detailedSaliencyLabel.innerHTML = "relevance details";
	detailedSaliencyLabel.setAttribute("id","relevance-detailed-label");
    
    // turning off combined saliency every where for now, so always hide buttons
    if (!userStudyMode) {
        $("#what-radios").append(radioCombinedSaliency);
        $("#what-radios").append(combinedSaliencyLabel);
        $("#what-radios").append(radioDetailedSaliency);
        $("#what-radios").append(detailedSaliencyLabel);
    }
	
}


function clearSaliencyControls() {
    $("#relevance-combined-radio").remove();
	$("#relevance-detailed-radio").remove();
	$("#relevance-combined-label").remove();
	$("#relevance-detailed-label").remove();
}

function processWhatClick() {
    if (currentExplManager.saliencyVisible){
        currentExplManager.saliencyVisible = false;
        $("#what-questions").toggleClass('saliency-active');
        $("#what-label").toggleClass('saliency-active');
        currentExplManager.render("live");
    }
    else {
        currentExplManager.saliencyVisible = true;
        $("#what-questions").toggleClass('saliency-active');
        $("#what-label").toggleClass('saliency-active');
        currentExplManager.render("live");
    }
}


function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
  }