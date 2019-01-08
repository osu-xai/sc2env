
// zooming
var gameboard_zoom_canvas = document.createElement("canvas");
var gameboard_zoom_ctx = gameboard_zoom_canvas.getContext("2d");
var zoomSlider = document.createElement("input");
var zoomFactor = 3;
var zoomBoxOriginX = 0;
var zoomBoxOriginY = 0;


function configureZoomCanvas() {
	gameboard_zoom_canvas.width = gameboard_canvas.width;
	gameboard_zoom_canvas.height = gameboard_canvas.height;
	$("#scaii-gameboard-zoom").append(gameboard_zoom_canvas);
	$("#scaii-gameboard-zoom").css("width", gameboard_zoom_canvas.width);
	$("#scaii-gameboard-zoom").css("height", gameboard_zoom_canvas.height);
	$("#scaii-gameboard-zoom").css("background-color", game_background_color);

	gameboard_zoom_canvas.addEventListener('click', function (event) {
		shapeId = getClosestInRangeShapeId(gameboard_zoom_ctx, event.offsetX, event.offsetY, shapePositionMapForContext["zoom"]);
		handleEntities(entitiesList);


	});
}

function configureZoomBox() {
	configureZoomSlider();
	configureZoomCanvas();
}

function adjustZoomBoxPosition(x, y) {
	// they clicked at new target for center of box.
	var boxWidth = gameboard_canvas.width / zoomFactor;
	var boxHeight = gameboard_canvas.height / zoomFactor;
	zoomBoxOriginX = x - boxWidth / 2;
	zoomBoxOriginY = y - boxHeight / 2;
	if (zoomBoxOriginX < 0) {
		zoomBoxOriginX = 0;
	}
	else if (zoomBoxOriginX > gameboard_canvas.width - boxWidth) {
		zoomBoxOriginX = gameboard_canvas.width - boxWidth;
	}
	else {
		// a-ok - they clicked in the middle somewhere
	}
	if (zoomBoxOriginY < 0) {
		zoomBoxOriginY = 0;
	}
	else if (zoomBoxOriginY > gameboard_canvas.height - boxHeight) {
		zoomBoxOriginY = gameboard_canvas.height - boxHeight;
	}
	else {
		// a-ok - they clicked in the middle somewhere
	}
}

function drawZoomBox(ctx, canvas, originX, originY, zoom) {
	ctx.beginPath();
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'white';
	var width = canvas.width / zoom;
	var height = canvas.height / zoom;
	ctx.rect(originX, originY, width, height);
	ctx.stroke();
	//ctx.strokeRect(originX, originY, height, width);
}


var configureZoomSlider = function () {
	var zoomSliderLabel = document.createElement("div");
	$("#scaii-zoom-controls").append(zoomSliderLabel);
	zoomSliderLabel.setAttribute("id", "zoom-slider-label");
	$("#zoom-slider-label").html("zoom");
	$("#zoom-slider-label").css("font-family", "Fira Sans");
	$("#zoom-slider-label").css("font-size", "12px");
	$("#zoom-slider-label").css("padding-left", "6px");
	$("#zoom-slider-label").css("padding-right", "4px");
	$("#zoom-slider-label").css("padding-top", "2px");
	$("#scaii-zoom-controls").append(zoomSlider);
	zoomSlider.setAttribute("type", "range");
	zoomSlider.setAttribute("min", "100");
	zoomSlider.setAttribute("max", "600");
	zoomSlider.setAttribute("value", "200");
	zoomSlider.setAttribute("class", "slider");
	zoomSlider.setAttribute("id", "zoom-slider");
	zoomSlider.oninput = function () {
		zoomFactor = "" + this.value / 100;
		//console.log("zoom factor " + zoomFactor);
		handleEntities(entitiesList);
	}
}

function addZoomControlToGameboardCanvas(gameboard_canvas){
	gameboard_canvas.addEventListener('click', function (event) {
		if (event.shiftKey) {
			adjustZoomBoxPosition(event.offsetX, event.offsetY);
			handleEntities(entitiesList);
		}
		else {
			shapeId = getClosestInRangeShapeId(gameboard_ctx, event.offsetX, event.offsetY, shapePositionMapForContext["game"]);
			handleEntities(entitiesList);
		}

	});
}