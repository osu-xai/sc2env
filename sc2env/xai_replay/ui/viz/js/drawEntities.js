function get2dContextForMode(si, mode){
    if (mode == "outline"){
        return gameboard_canvas.getContext("2d");
    }
    else {
        return si.ctx;
    }
}
function drawCircle(shapeInfo, mode) {
    var si = shapeInfo;
    var ctx = get2dContextForMode(si, mode);
    ctx.save();
    ctx.translate(si.x, si.y);
    // (no need to rotate circle)
    ctx.beginPath();
    ctx.arc(0, 0, si.radius, 0, 2 * Math.PI);
    if (mode == "outline") {
        ctx.lineWidth = shape_outline_width + 3;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    else {
        ctx.stroke();
        ctx.fillStyle = si.colorRGBA;
        ctx.fill();
    }
    ctx.restore();
}

function drawRect(shapeInfo, mode) {
    var si = shapeInfo;
    var ctx = get2dContextForMode(si, mode);
    ctx.save();
    ctx.translate(si.x, si.y);
    ctx.rotate(si.rotation_in_radians);
    x = 0;
    y = 0;
    var x1 = x - (si.height / 2);
    var y1 = y - (si.width / 2);
    var x2 = x + (si.height / 2);
    var y2 = y + (si.width / 2);
    ctx.beginPath();

    if (mode == "outline"){
        ctx.lineWidth = shape_outline_width + 3;
        ctx.strokeStyle = "white";
        ctx.strokeRect(x1, y1, si.height, si.width);
    }
    else {
        ctx.lineWidth = shape_outline_width;
        ctx.strokeStyle = shape_outline_color;
        if (use_shape_color_for_outline) {
            ctx.strokeStyle = si.colorRGBA;
        }
        ctx.strokeRect(x1, y1, si.height, si.width);
        if (mode == "gradient") {
            var gradient = ctx.createLinearGradient(x1, si.y, x2, si.y);
            gradient.addColorStop(0, si.colorRGBA);
            gradient.addColorStop(1, 'white');
            ctx.fillStyle = gradient;
        }
        else {
            ctx.fillStyle = si.colorRGBA;
        }
        ctx.fillRect(x1, y1, si.height, si.width);
    }
    ctx.restore();
}

function drawTriangle(shapeInfo, mode) {
    var si = shapeInfo;
    var ctx = get2dContextForMode(si, mode);
    ctx.save();
    ctx.translate(si.x, si.y);
    ctx.rotate(si.rotation_in_radians);
    x = 0;
    y = 0;
    var radians = 60 * Math.PI / 180;
    var height = (Math.tan(radians) * si.baseLen) / 2;
    var yTip = y - height / 2;
    var yBottom = y + height / 2;
    var xTip = x;
    var xBottomLeft = x - si.baseLen / 2;
    var xBottomRight = x + si.baseLen / 2;
    ctx.beginPath();
    ctx.moveTo(xTip, yTip);
    ctx.lineTo(xBottomRight, yBottom);
    ctx.lineTo(xBottomLeft, yBottom);
    ctx.closePath();

    if (mode == "outline"){
        ctx.lineWidth = shape_outline_width + 3;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    else {
        // the outline
        ctx.lineWidth = shape_outline_width;
        ctx.strokeStyle = shape_outline_color;
        if (use_shape_color_for_outline) {
            ctx.strokeStyle = si.colorRGBA;
        }
        ctx.stroke();

        // the fill color
        ctx.fillStyle = si.colorRGBA;
        ctx.fill();
    }
    
    ctx.restore();
}


function drawKite(shapeInfo, mode) {
    var si = shapeInfo;
    var ctx = get2dContextForMode(si, mode);
    ctx.save();
    ctx.translate(si.x, si.y);
    ctx.rotate(si.rotation_in_radians);
    x = 0;
    y = 0;
    var yTip = y;
    var yBottom = y;
    var xTip = x + si.width / 2;
    var xBottom = x - si.width / 2;
    var xLeftWing = x - si.width / 4;
    var yLeftWing = y - si.length / 3;
    var xRightWing = x - si.width / 4;
    var yRightWing = y + si.length / 3;

    ctx.beginPath();
    ctx.moveTo(xTip, yTip);
    ctx.lineTo(xLeftWing, yLeftWing);
    ctx.lineTo(xBottom, yBottom);
    ctx.lineTo(xRightWing, yRightWing);
    ctx.closePath();

    if (mode == "outline") {
        ctx.lineWidth = shape_outline_width + 3;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    else {
        // the outline
        ctx.lineWidth = shape_outline_width;
        ctx.strokeStyle = shape_outline_color;
        if (use_shape_color_for_outline) {
            ctx.strokeStyle = si.colorRGBA;
        }
        ctx.stroke();

        var gradient = ctx.createLinearGradient(xBottom, yBottom, xTip, yTip);
        gradient.addColorStop(0, si.colorRGBA);
        gradient.addColorStop(1, 'white');

        ctx.fillStyle = gradient;
        ctx.fill();
    }
    ctx.restore();
}


function drawOctagon(shapeInfo, mode) {
    var si = shapeInfo;
    var ctx = get2dContextForMode(si, mode);
    ctx.save();
    ctx.translate(si.x, si.y);
    ctx.rotate(si.rotation_in_radians);
    var x1 = si.x - si.edgeTop / 2;
    var y1 = si.y - getOctagonHeight(si) / 2;
    var x2 = si.x + si.edgeTop / 2;
    var y2 = y1;

    var x3 = si.x + getOctagonWidth(si) / 2;
    var y3 = si.y - si.edgeLeft / 2;
    var x4 = x3;
    var y4 = si.y + si.edgeLeft / 2;

    var x5 = x2;
    var y5 = si.y + getOctagonHeight(si) / 2;
    var x6 = x1;
    var y6 = y5;

    var x7 = si.x - getOctagonWidth(si) / 2;
    var y7 = y4;
    var x8 = x7;
    var y8 = y3;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.lineTo(x5, y5);
    ctx.lineTo(x6, y6);
    ctx.lineTo(x7, y7);
    ctx.lineTo(x8, y8);
    ctx.lineTo(x1, y1);
    ctx.closePath();

    if (mode == "outline"){
        ctx.lineWidth = shape_outline_width + 3;
        ctx.strokeStyle = "white";
        ctx.stroke();
    }
    else {
        // the outline
        ctx.lineWidth = shape_outline_width;
        ctx.strokeStyle = shape_outline_color;
        if (use_shape_color_for_outline) {
            ctx.strokeStyle = si.colorRGBA;
        }
        ctx.stroke();

        // the fill color
        ctx.fillStyle = si.colorRGBA;
        ctx.fill();
    }
    
    ctx.restore();
}

function drawArrowShape(shapeInfo) {
    var si = shapeInfo;
    var fromx = si.x;
    var fromy = si.y;
    var tox = si.targetX;
    var toy = si.targetY;
    //variables to be used when creating the arrow

    var ctx = gameboard_canvas.getContext("2d");
    var headlen = si.headlength;

    var angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.save();
    //starting path of the arrow from the start square to the end square and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.strokeStyle = si.colorRGBA;
    ctx.lineWidth = si.thickness;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));

    //path from the side point back to the tip of the arrow, and then again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

    //draws the paths created above
    ctx.strokeStyle = si.colorRGBA;
    ctx.lineWidth = si.thickness;
    ctx.stroke();
    ctx.fillStyle = si.colorRGBA;
    ctx.fill();
    ctx.restore();
}
