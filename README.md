# KBmapMarkers
JavaScript library for displaying maps (or other images) with custom map markers (or other icons) and on marker click opens their description in modal. Fully responsive.

## DEMO:
https://mrkariox.github.io/KBmapMarkers/

## How to use?
1. First add jQuery library to your document (tested on jquery-3.3.1).
2. Then add js and css files to your document:
```
<script type="text/javascript" src="js/KBmapmarkers.js"></script>
<script type="text/javascript" src="js/KBmapmarkersCords.js"></script> <- optional (adds cursor coordinates on map)
<link href="css/KBmapmarkers.css" rel="stylesheet">
```
3. Create DOM element with class KBmap and any Id you want:
```
<section class="KBmap" id="IDofCreatedMap"></section>
```
4. Now you are ready to create map:
```
var json = 
{
	"mapMarker1": {
		"cordX": "54.25",
		"cordY": "18.59",
		"icon": "src/to/map-marker.svg",
		"modal": {
			"title": "Kaer Morhen",
			"content": "<p>Vesemir<br />email: vesemir@kaermorhen.pl<br />tel: 942 422 144</p>"
		}
	},
	"mapMarker2": {
		"cordX": "32.15",
		"cordY": "53.34",
		"icon": "src/to/map-marker.svg",
		"modal": {
			"title": "Wyzima",
			"content": "<p>Król Foltest<br />email: foltest@temeria.pl<br />tel: 654 342 674</p>"
		}
	}
};

(function($) {

	$(document).ready(function(){ 

		createKBmap('IDofCreatedMap', 'src/to/map.jpg'); // creates map

		IDofCreatedMap.importJSON(json); // import json data into map
		
		IDofCreatedMap.showAllMapMarkers(); // show all markers stored in map object

	});

})(jQuery);
```
