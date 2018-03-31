// array storing all currently added maps;
var addedKBmaps = [];

function Map(name, mapDataJSON){


	this.name = name;
	this.mapMarkers = [];
	this.addedMarkers = []; // array for markers added to map (and visible on map)
	this.maxZindex = 2;
	this.openedModals = [];
	this.container =  jQuery("#"+ this.name + " .KBmap__mapContainer .KBmap__mapHolder");
	this.mapDataJSON = mapDataJSON;

	this.getMarker = function(marker){
		return getKBmapMarker(this, marker);
	}

	this.showAllMapMarkers = function(icon){
		var icon = icon;

		for (locationName in this.mapDataJSON){

			// generate unique name for map marker (checks addedMarkers array for duplicates);
			var markerName = generateUniqueMarkerName(this);

			if (markerName) {

				this.mapMarkers[markerName] = new MapMarker(markerName, icon, this, locationName, this.mapDataJSON);

				this.mapMarkers[markerName].show();

			}else{
				console.error("MapMarker for location: " + locationName + " was not added to map because of error.");
			}	

		}
	}

	this.closeAllModals = function(){
		for (var i = this.openedModals.length-1; i >= 0; i--) {
			this.openedModals[i].closeModal()
		};
	}

} // Map class end

function MapMarker(name, icon, map, location_name, jsonfile){

	this.map = map;
	this.name = name;
	this.icon = icon;
	this.location = location_name;
	this.dataJSON = jsonfile;
	this.cordX = this.dataJSON[this.location]['coordinates']['x'];
	this.cordY = this.dataJSON[this.location]['coordinates']['y'];
	this.markerContainer = this.map.container; // jquery map marker container object
	this.modal = new MarkerModal(this);
	
	this.activate = function(){
		jQuery('[data-marker-name="' + this.name + '"]').addClass('active');
	}

	this.deactivate = function(){
		jQuery('[data-marker-name="' + this.name + '"]').removeClass('active');
	}

	this.setCurrent = function(){
		jQuery('[data-marker-name="'+ this.name +'"]').css('z-index', this.map.maxZindex);
		this.map.maxZindex++;
	}

	this.unsetCurrent = function(){
		jQuery('[data-marker-name="'+ this.name +'"]').css('z-index', "2");
	}

	this.generateMarker = function(){
		output = '<div class="KBmap__marker" data-marker-name="'+this.name+'" data-location="'+this.location+'" style="left: '+this.cordX+'%; top: '+this.cordY+'%"><img src="'+this.icon+'" alt="'+this.location+'"></div>'

		return output;
	}

	this.removeMarker = function(){

		jQuery('[data-marker-name="'+this.name+'"]').remove();
		this.map.addedMarkers.removeElement(this);

		this.map.openedModals.removeElement(this.modal);
	}

	this.show = function(){

		this.markerContainer.append(this.generateMarker());

		// add currently generated marker to array with all generated markers;
		this.map.addedMarkers.push(this);

	}


} // MapMarker class end

function MarkerModal(linkedMapMarker){

	this.linkedMapMarker = linkedMapMarker; // linked to modal map marker object
	this.contentitems = this.linkedMapMarker.dataJSON[this.linkedMapMarker.location]['contentitems'];
	this.positionedElemOffset = null;
	
	self = this;

	this.generateModal = function(){
		output = '<div  class="KBmap__markerContent"><div class="KBmap__markerClose"><i class="fa fa-times" aria-hidden="true"></i></div><h3 class="KBmap__markerTitle">' + this.linkedMapMarker.location + '</h3>';

		for (contentitem in this.contentitems){
			output += '<div class="KBmap__markerContentItem">' + '<div class="KBmap__markerContentRow">' + contentitem + '</div>';

			for (contentitem_field in this.contentitems[contentitem]) {

				// if field is not empty show it
				if (this.contentitems[contentitem][contentitem_field]) {
					output += '<div class="KBmap__markerContentRow">' + contentitem_field + ": " + this.contentitems[contentitem][contentitem_field] + "</div>";
				}
				
			}

			output += '</div>';

		}

		output += '</div>';

		return output;

	}

	this.isModalActive = function(){
		return (jQuery('[data-marker-name="' + this.linkedMapMarker.name + '"]').hasClass('active'));
	}

	this.closeModal = function(){
		jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"] .KBmap__markerContent').remove();
		this.linkedMapMarker.map.openedModals.removeElement(this);

		this.linkedMapMarker.deactivate();

		this.linkedMapMarker.unsetCurrent();

		if (this.linkedMapMarker.map.openedModals.length < 1) {
			this.linkedMapMarker.map.maxZindex = 2;
		};

	}

	this.openModal = function(){

		this.linkedMapMarker.activate();

		this.linkedMapMarker.setCurrent();

		// generate modal and insert it into block with clicked map marker;
		jQuery('[data-marker-name="' + this.linkedMapMarker.name + '"]').append(this.generateModal());		

		// add currently opened modal to array with all opened modals;
		this.linkedMapMarker.map.openedModals.push(this);					

		// center opened modal on map marker (css);
		this.clearPosition();

	}

	this.toggleModal = function(){

		if ( ! this.isModalActive() ){

			this.openModal();

		}else{

			this.closeModal();

		}

	}

	this.clearPosition = function(){

		$markerContentWidth = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.KBmap__markerContent').outerWidth();

		// if modal content block width is grater than window width set modal with to window width
		if ($markerContentWidth > jQuery(window).outerWidth()) {
			$markerContentWidth = jQuery(window).outerWidth()-1;
		}

		$markerWidth = jQuery('.KBmap__marker').outerWidth();

		$positionedElem = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.KBmap__markerContent');

		self.positionedElemOffset = -($markerContentWidth/2)+$markerWidth/2;

		$positionedElem.css({
			'left': self.positionedElemOffset,
			'max-width': jQuery(window).outerWidth()
		});	

		// if modal is off screen changes its left/right position until modal is fully on screen
		whileOffScreen();

	}

	function whileOffScreen(){

		while (($positionedElem.offset().left < 0)&(!($positionedElem.offset().left + $markerContentWidth > jQuery(window).outerWidth()))) {
			self.positionedElemOffset += 1;
			$positionedElem.css({
				'left': self.positionedElemOffset,
				'max-width': jQuery(window).outerWidth()-1
			});
		}

		while (($positionedElem.offset().left + $markerContentWidth > jQuery(window).outerWidth())&(!($positionedElem.offset().left < 0))) {
			self.positionedElemOffset += -1;
			$positionedElem.css({
				'left': self.positionedElemOffset,
				'max-width': jQuery(window).outerWidth()-1
			});
		}	

	}

} // MarkerModal class end

/*
 *
 *  Required functionality methods and functions
 *
 */

Array.prototype.removeElement = function(elem){

	var index = this.indexOf(elem);
	if (index > -1) {
		this.splice(index, 1);
	}

}

function generateName(namebase){
	return namebase+Math.floor((Math.random() * 1000) + 1);
}

function generateUniqueMarkerName(map){

	var namebase = 'mapMarker';
	var objname = generateName(namebase);

	var infiniteLoopCheck = 0;

	while (map.addedMarkers.indexOf(window[objname])!= -1) {

		objname = generateName(namebase);

		infiniteLoopCheck++;

		if (infiniteLoopCheck > addedMarkers.length * 100) {
			console.error('Can not generate unique name for MapMarker object. Change max number in MapMarker object name [function generateName()]. Default max: 1000');
			return false;
		};
	}

	return objname;

}

function getKBmap(name){

	for (var i=0, iLen=addedKBmaps.length; i<iLen; i++) {

		if (addedKBmaps[i].name == name) return addedKBmaps[i];

	}

}

function getKBmapMarker(map, marker){

	for (var i=0, iLen=map.addedMarkers.length; i<iLen; i++) {

		if (map.addedMarkers[i].name == marker) return map.addedMarkers[i];

	}

}

// on resize chceck if modal is fully on screen, if not change its position
jQuery(window).resize(function(){

	addedKBmaps.forEach(function(map){

		map.openedModals.forEach(function(modal){

			modal.clearPosition();

		});

	});
	
});

// on map marker click trigger event markerClick (adding new event)
jQuery('body').on('click', '.KBmap__marker img', function(){

	var clickedMarkerName = jQuery(this).parent().attr('data-marker-name');
	var clickedMarkerMapName = jQuery(this).parent().parent().parent().parent().attr('id');

	jQuery.event.trigger('markerClick', getKBmapMarker(getKBmap(clickedMarkerMapName), clickedMarkerName));

});

// on "x" click in modal block close modal
jQuery('body').on('click', '.KBmap__markerClose', function(event){

	event.stopPropagation();

	var clickedMarkerName = jQuery(this).parent().parent().attr('data-marker-name');
	var clickedMarkerMapName = jQuery(this).parent().parent().parent().parent().parent().attr('id');

	jQuery.event.trigger('markerClose', getKBmapMarker(getKBmap(clickedMarkerMapName), clickedMarkerName));

});

// on modal body click add current class to it and remove that class from all other opened modals 
// (current modal is always on top of others)
jQuery('body').on('click', '.KBmap__markerContent', function(){

	var mapMarkerParent = jQuery(this).parent().attr('data-marker-name');
	var mapMarkerMapParent= jQuery(this).parent().parent().parent().parent().attr('id');

	getKBmapMarker(getKBmap(mapMarkerMapParent), mapMarkerParent).setCurrent();

});

// on markerClick event run function that opens linked modal
jQuery(document).on('markerClick', function(event, mapMarker){

	mapMarker.modal.toggleModal();

});

// on markerClose event
jQuery(document).on('markerClose', function(event, mapMarker){

	mapMarker.modal.closeModal();

});


/*
 *
 *  // Required functionality methods and functions end
 *
 */

function createKBmap(name, mapsrc, mapDataJSON){

	var mapImg = mapsrc;

	var output = '<div class="KBmap__mapContainer"><div class="KBmap__mapHolder"><img src="' + mapImg + '" alt="mapa"></div></div>';

	jQuery('#'+name).append(output);

	window[name] = new Map(name, mapDataJSON);

	addedKBmaps.push(window[name]);

}