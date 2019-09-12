 
function createStoryLineUI(){
    var ui = {};
    ui.gridRowGap = "50px";

    
    ui.createStoryLinesDiv = function(rowCount, colCount){
        var div  = document.createElement('div');
        div.setAttribute("id", "story-lines")
        return div;
    }
    ui.storyLinesDiv = ui.createStoryLinesDiv();

    
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
        div.setAttribute("style", "display :grid");

        this.queryNavigatorDiv.setAttribute("style", getGridPositionStyleString(0,0) + ';background-color:red;');
        div.append(this.queryNavigatorDiv);

        this.queryInterfaceDiv.setAttribute("style", getGridPositionStyleString(0,1) + ';background-color:green;');
        div.append(this.queryInterfaceDiv);

        this.principalVariationDiv.setAttribute("style", getGridPositionStyleString(1,0) + ';background-color:blue;');
        div.append(this.principalVariationDiv);
        
        this.storyLinesDiv.setAttribute("style", getGridPositionStyleString(1,1) + ';background-color:yellow;');
        div.append(this.storyLinesDiv);
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
        addStoryLineDivToContainer(pv, this.principalVariationDiv, 0);
    }
    ui.populateStoryLinesDefault = function(storyLines){
        var containerDiv  = document.createElement('div');
        containerDiv.setAttribute("id", "story-lines-default");
        containerDiv.setAttribute("style", 'display:grid;grid-row-gap:' + this.gridRowGap + ';margin-left:10px;margin-bottom:0px;margin-top:6px;font-family:Arial;font-size:14px;');
        for (var index in storyLines.storyLines){
            var storyLine = storyLines.storyLines[index];
            addStoryLineDivToContainer(storyLine, containerDiv, index);
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

function addStoryLineDivToContainer(storyLine, container, column){
    for (var index in storyLine.nodes){
        var node = storyLine.nodes[index];
        var id = node.id;
        var div = document.createElement('div');
        div.setAttribute("style",getGridPositionStyleString(column,index))
        div.innerHTLM = id;
        container.append(div);
    }
}

var storyLineUI = createStoryLineUI();
   
