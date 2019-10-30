function getSVGDP(id, w, h, fontSize, dp){
    var result = '<svg style="width:' + w + 'px;height:' + h + 'px;" version="1.1" xmlns="http://www.w3.org/2000/svg">' + 
        '<polygon points="' + 0 + ','      + 0.5 * h + 
                        ' ' + 0.5 * w +',' + 0 + 
                        ' ' + w +', ' + 0.5 * h + 
                        ' ' + 0.5 * w +', ' + h + '" style="fill:black;stroke:black;stroke-width:1" />' +
        '<text id=' + id + ' x=50% y=60% style="font-size:' + fontSize + '" fill="white" text-anchor="middle">D' + dp + '</text>'
        '</svg>';
    return result;
}
// function getSVGDPFoo(){
//     var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//     svg.setAttribute('style', 'border: 1px solid black');
//     svg.setAttribute('width', '600');
//     svg.setAttribute('height', '250');
//     svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
//     document.getElementById('r-p-s-key').appendChild(svg);
// }