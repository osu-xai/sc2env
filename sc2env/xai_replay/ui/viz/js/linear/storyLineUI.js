 
function createStoryLineUI(){
    var ui = {};
    ui.gridRowGap = "10px";
    ui.gridColGap = "30px";
    
    ui.createStoryLinesDiv = function(rowCount, colCount){
        var div  = document.createElement('div');
        div.setAttribute("id", "story-lines")
        return div;
    }
    ui.storyLinesDiv = ui.createStoryLinesDiv();

    
    ui.createPVTitleDiv = function(rowCount, colCount){
        var div  = document.createElement('div');
        div.setAttribute("id", "pv-title")
        return div;
    }
    ui.pvTitleDiv = ui.createPVTitleDiv();

    
    ui.createStoryLinesTitleDiv = function(rowCount, colCount){
        var div  = document.createElement('div');
        div.setAttribute("id", "storylines-title")
        return div;
    }
    ui.storyLinesTitleDiv = ui.createStoryLinesTitleDiv();

    ui.createPrincipalVariationDiv = function(){
        var div  = document.createElement('div');
        div.setAttribute("id", "principal-variation-div");
        div.setAttribute("style", "display :grid; grid-row-gap:"+ this.gridRowGap + ";");
        return div; 
      
    }

    ui.principalVariationDiv = ui.createPrincipalVariationDiv();

    
    ui.createQueryNavigatorDiv = function(){
        var div  = document.createElement('div');
        return div; 
    } 
    ui.queryNavigatorDiv = ui.createQueryNavigatorDiv();

    ui.createQueryInterfaceDiv = function(){
        var div  = document.createElement('div');
        return div; 
    } 

    ui.queryInterfaceDiv = ui.createQueryInterfaceDiv();

    ui.createUIDiv = function(){
        var div  = document.createElement('div');
        div.setAttribute("id", "story-line-ui");
        div.setAttribute("style", "display :grid;grid-template-columns: 15% 70% 15% ;grid-template-rows: 5% 95%;height:1200px");

        this.pvTitleDiv.setAttribute("style", getGridPositionStyleString(0,0) + ';background-color:#CCAAAA;width:100%;height:100%');
        div.append(this.pvTitleDiv);

        this.storyLinesTitleDiv.setAttribute("style", getGridPositionStyleString(1,0) + ';background-color:#AACCAA;width:100%;height:100%');
        div.append(this.storyLinesTitleDiv);

        this.principalVariationDiv.setAttribute("style", getGridPositionStyleString(0,1) + ';display:grid;grid-auto-columns: minmax(200px, 200px); grid-auto-rows: minmax(140px, 140px);   grid-row-gap:' + this.gridRowGap + ';grid-column-gap:' + this.gridColGap + ';padding-left:100px;padding-top:' + this.gridRowGap +';font-family:Arial;font-size:14px;background-color:#AAAACC;');
        div.append(this.principalVariationDiv);
        
        this.storyLinesDiv.setAttribute("style", getGridPositionStyleString(1,1) + ';background-color:"AAAAAA";width:100%;height:100%');
        div.append(this.storyLinesDiv);

        this.queryInterfaceDiv.setAttribute("style", getGridPositionStyleString(2,1) + ';background-color:#AACCAA;width:100%;height:100%');
        div.append(this.queryInterfaceDiv);

        var linearDiv = document.getElementById("linear");
        linearDiv.append(div);
        return div;
    }

    ui.uiDiv = ui.createUIDiv();


    ui.init = function(storyLines){
        this.populatePrincipalVariation(storyLines);
    }
    ui.populatePrincipalVariation = function(storyLines){
        var pv = storyLines.principalVariationStoryLine;
        addStoryLineDivToContainer(pv, this.principalVariationDiv, 0, storyLines);
    }
    ui.populateStoryLinesDefault = function(storyLines){
        var containerDiv  = document.createElement('div');
        containerDiv.setAttribute("id", "story-lines-default");
        containerDiv.setAttribute("style", 'display:grid;grid-auto-columns: minmax(200px, 200px); grid-auto-rows: minmax(140px, 140px);   grid-row-gap:' + this.gridRowGap + ';grid-column-gap:' + this.gridColGap + ';padding-top:' + this.gridRowGap + ';padding-left:' + this.gridColGap + ';font-family:Arial;font-size:14px;');
        for (var index in storyLines.storyLines){
            var storyLine = storyLines.storyLines[index];
            addStoryLineDivToContainer(storyLine, containerDiv, index, storyLines);
        }
        $("#story-lines").append(containerDiv);
    }
    return ui;
}

function getGridPositionStyleString(gridX, gridY) {
	var columnStart = Number(gridX) + 1;
	var columnEnd = Number(gridX) + 2;
	var rowStart = Number(gridY) + 1;
	var rowEnd = Number(gridY) + 2;
	var columnInfo = 'grid-column-start: ' + columnStart + '; grid-column-end: ' + columnEnd;
	var rowInfo = '; grid-row-start: ' + rowStart + '; grid-row-end: ' + rowEnd + ';';
	var result =  columnInfo + rowInfo;
	return result;
}

function addStoryLineDivToContainer(storyLine, container, column, storyLines){
    for (var index in storyLine.nodes){
        console.log("adding column " + column + " row " + index);
        var node = storyLine.nodes[index];
        var id = node.id;
        var div = document.createElement('div');
        div.setAttribute("style",getGridPositionStyleString(column,index) + ';border-style: solid; border-width:1px;text-align:center')
        div.innerHTML = getNodeGlyphs(node["data"], ( storyLines.maxStateUnitCount, storyLines.maxActionUnitCount));
        //div.innerHTML = id + ' s ' + storyLines. + ',a ' + storyLines.maxActionUnitCount;
        container.append(div);
    }
}

var storyLineUI = createStoryLineUI();
   
