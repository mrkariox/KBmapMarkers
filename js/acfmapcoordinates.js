var mapMarker_sourcemap = document.querySelector('.prometMap__mapHolder');
var cords;

mapMarker_sourcemap.onmouseover = function(e){

	if (mapMarker_sourcemap.querySelector('.mapMarkerCords')==null) {

		cords = document.createElement('div');
		cords.setAttribute('class', 'mapMarkerCords');

		mapMarker_sourcemap.appendChild(cords);

	} 

}

mapMarker_sourcemap.onmouseleave = function(e){

	mapMarker_sourcemap.querySelector('.mapMarkerCords').remove();

}

mapMarker_sourcemap.onmousemove = function(e){

	document.querySelector('.mapMarkerCords').innerHTML = "<strong>pos X: </strong>" + mousePositionElement(e).x + " " + "<strong>pos Y: </strong>" + mousePositionElement(e).y;

}

// Which HTML element is the target of the event
function mouseTarget(e) {
	var targ;
	if (!e) var e = window.event;
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;
	return targ;
}
 
// Mouse position relative to the document
// From http://www.quirksmode.org/js/events_properties.html
function mousePositionDocument(e) {
	var posx = 0;
	var posy = 0;
	if (!e) {
		var e = window.event;
	}
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	return {
		x : posx,
		y : posy
	};
}

// Find out where an element is on the page
// From http://www.quirksmode.org/js/findpos.html
function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return {
		left : curleft,
		top : curtop
	};
}
 
// Mouse position relative to the element
// not working on IE7 and below
function mousePositionElement(e) {
	var mousePosDoc = mousePositionDocument(e);
	var target = mapMarker_sourcemap;
	var targetPos = findPos(target);
	var posx = mousePosDoc.x - targetPos.left;
	var posy = mousePosDoc.y - targetPos.top;
	var elemHeight = mapMarker_sourcemap.clientHeight;
	var elemWidth = mapMarker_sourcemap.clientWidth;
	return {
		x : parseFloat(Math.round((posx / elemWidth)* 10000) / 100).toFixed(2),
		y : parseFloat(Math.round((posy / elemHeight)* 10000) / 100).toFixed(2)
	};
}