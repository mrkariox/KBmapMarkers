// array storing all currently added maps;
var addedKBmaps = [];

function Map(name){


	this.name = name;
	this.mapMarkers = [];
	this.maxZindex = 2;
	this.openedModals = [];
	this.container =  jQuery("#"+ this.name + " .KBmap__mapContainer .KBmap__mapHolder");
	this.mapDataJSON;

	this.addMarker = function(icon, cordX, cordY, name){

		var markerName;

		// if name param is specified use it and check for duplicates in mapMarkers array else generate name
		if(typeof name !== 'undefined'){

			markerName = generateUniqueMarkerName(this, name);
		
		}else{

			markerName = generateUniqueMarkerName(this);
		
		}

		this.mapMarkers[markerName] = new MapMarker(markerName, icon, cordX, cordY, this);

	}

	this.removeMarker = function(mapMarker){
		this.mapMarkers[mapMarker].removeMarker();
	}

	this.importJSON = function(mapDataJSON){

		this.mapDataJSON = mapDataJSON;

		for (importedMarkerName in this.mapDataJSON){

			// add new marker
			this.addMarker(this.mapDataJSON[importedMarkerName].icon, this.mapDataJSON[importedMarkerName].cordX, this.mapDataJSON[importedMarkerName].cordY, importedMarkerName);

			// add modal to new added marker if specified in json
			if (this.mapDataJSON[importedMarkerName]["modal"] && this.mapDataJSON[importedMarkerName]["modal"].title && this.mapDataJSON[importedMarkerName]["modal"].content) {
;
				this.mapMarkers[importedMarkerName].addModal(this.mapDataJSON[importedMarkerName]["modal"].title, this.mapDataJSON[importedMarkerName]["modal"].content);
				
			};

		}
	}

	this.generateJSON = function(){
		// function code here
	}

	this.showAllMapMarkers = function(){

		var count = 0;
		
		for (mapMarker in this.mapMarkers){

			if (mapMarker != "removeElement") {

				this.mapMarkers[mapMarker].show();
	
			};

		}

	}

	this.closeAllModals = function(){
		for (var i = this.openedModals.length-1; i >= 0; i--) {
			this.openedModals[i].closeModal()
		};
	}

} // Map class end

function MapMarker(name, icon, cordX, cordY, map){

	this.map = map;
	this.name = name;
	this.icon = icon;
	this.cordX = cordX;
	this.cordY = cordY;
	this.markerContainer = this.map.container; // jquery map marker container object
	this.modal;

	this.addModal = function(modalTitle, modalContent){
		this.modal = new MarkerModal(modalTitle, modalContent, this);
	}
	
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
		jQuery('[data-marker-name="'+ this.name +'"]').css('z-index', "1");
	}

	this.generateMarker = function(){
		output = '<div class="KBmap__marker" data-marker-name="'+this.name+'" style="left: '+this.cordX+'%; top: '+this.cordY+'%"><img src="'+this.icon+'" alt="'+this.location+'"></div>'

		return output;
	}

	this.removeMarker = function(){

		jQuery('[data-marker-name="'+this.name+'"]').remove();

		delete this.map.mapMarkers[this.name];

		this.map.openedModals.removeElement(this.modal);
	}

	this.show = function(){

		this.markerContainer.append(this.generateMarker());

	}


} // MapMarker class end

function MarkerModal(modalTitle, content, linkedMapMarker){

	this.title = modalTitle;
	this.linkedMapMarker = linkedMapMarker; // linked to modal map marker object
	this.content = content;
	this.positionedElemOffsetX = null;
	this.positionedElemOffsetY = null;
	
	self = this;

	this.generateModal = function(){
		output = '<div  class="KBmap__markerContent"><div class="KBmap__markerClose"><i class="fa fa-times" aria-hidden="true"></i></div><h3 class="KBmap__markerTitle">' + this.title + '</h3>';

		output += '<div class="KBmap__markerContentItem">' + this.content + '</div>';

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
		$markerContentHeight = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.KBmap__markerContent').outerHeight();

		// if modal content block width is grater than window width set modal with to window width
		if ($markerContentWidth > jQuery(window).outerWidth()) {
			$markerContentWidth = jQuery(window).outerWidth()-1;
		}

		$markerWidth = jQuery('.KBmap__marker').outerWidth();
		$markerHeight = jQuery('.KBmap__marker').outerHeight();

		$positionedElem = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.KBmap__markerContent');

		self.positionedElemOffsetX = -($markerContentWidth/2)+$markerWidth/2;
		self.positionedElemOffsetY = $markerHeight/2;

		$positionedElem.css({
			'left': self.positionedElemOffsetX,
			'bottom': self.positionedElemOffsetY,
			'max-width': jQuery(window).outerWidth()
		});	

		// if modal is off screen changes its left/right position until modal is fully on screen
		whileOffScreen();

	}

	function whileOffScreen(){

		// while is overflowing screen on the left
		while (($positionedElem.offset().left < 0)&(!($positionedElem.offset().left + $markerContentWidth > jQuery(window).outerWidth()))) {
			self.positionedElemOffsetX += 1;
			$positionedElem.css({
				'left': self.positionedElemOffsetX,
				'bottom': self.positionedElemOffsetY,
				'max-width': jQuery(window).outerWidth()-1
			});
		}

		// while is overflowing screen on the rifht
		while (($positionedElem.offset().left + $markerContentWidth > jQuery(window).outerWidth())&(!($positionedElem.offset().left < 0))) {
			self.positionedElemOffsetX += -1;
			$positionedElem.css({
				'left': self.positionedElemOffsetX,
				'bottom': self.positionedElemOffsetY,
				'max-width': jQuery(window).outerWidth()-1
			});
		}	

		// while is overflowing srceen on top
		while($positionedElem.offset().top<0){
			self.positionedElemOffsetY += -1;
			$positionedElem.css({
				'left': self.positionedElemOffsetX,
				'bottom': self.positionedElemOffsetY,
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

function generateUniqueMarkerName(map, name){

	var namebase = 'mapMarker';
	var objname;

	// check if param name is specified, if so use its name and check for duplicates
	if(typeof name !== 'undefined'){

		objname = name;
	
	}else{

		objname = generateName(namebase);

	}

	var infiniteLoopCheck = 0;

	while (map.mapMarkers[objname]) {

		objname = generateName(namebase);

		infiniteLoopCheck++;

		if (infiniteLoopCheck > 1000) {
			console.error('After 10000 tries couldnt generate unique name for MapMarker object. Change max number in MapMarker object name [function generateName()]. Default max: 1000');
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

jQuery( document ).ready(function() {

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

		jQuery.event.trigger('markerClick', getKBmap(clickedMarkerMapName).mapMarkers[clickedMarkerName]);

	});

	// on "x" click in modal block close modal
	jQuery('body').on('click', '.KBmap__markerClose', function(event){

		event.stopPropagation();

		var clickedMarkerName = jQuery(this).parent().parent().attr('data-marker-name');
		var clickedMarkerMapName = jQuery(this).parent().parent().parent().parent().parent().attr('id');

		jQuery.event.trigger('markerClose', getKBmap(clickedMarkerMapName).mapMarkers[clickedMarkerName]);

	});

	// on modal body click add current class to it and remove that class from all other opened modals 
	// (current modal is always on top of others)
	jQuery('body').on('click', '.KBmap__markerContent', function(){

		var mapMarkerParent = jQuery(this).parent().attr('data-marker-name');
		var mapMarkerMapParent= jQuery(this).parent().parent().parent().parent().attr('id');

		getKBmap(mapMarkerMapParent).mapMarkers[mapMarkerParent].setCurrent()

	});

	// on markerClick event run function that opens linked modal
	jQuery(document).on('markerClick', function(event, mapMarker){

		mapMarker.modal.toggleModal();

	});

	// on markerClose event
	jQuery(document).on('markerClose', function(event, mapMarker){

		mapMarker.modal.closeModal();

	});

}); // document ready end

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

