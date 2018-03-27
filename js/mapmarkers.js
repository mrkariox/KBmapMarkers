// array storing all currently added map markers;
var addedMarkers = [];
var maxZindex = 2;

function MapMarker(name, icon, container, location_name, jsonfile){

	// test dzialania;
	this.name = name;
	this.icon = icon;
	this.location = location_name;
	this.dataJSON = jsonfile;
	this.cordX = this.dataJSON[this.location]['coordinates']['x'];
	this.cordY = this.dataJSON[this.location]['coordinates']['y'];
	this.markerContainer = container; // jquery map marker container object
	this.modal = new MarkerModal(this);
	
	this.activate = function(){
		jQuery('[data-marker-name="' + this.name + '"]').addClass('active');
	}

	this.deactivate = function(){
		jQuery('[data-marker-name="' + this.name + '"]').removeClass('active');
	}

	this.setCurrent = function(){
		jQuery('[data-marker-name="'+ this.name +'"]').css('z-index', maxZindex);
		maxZindex++;
	}

	this.generateMarker = function(){
		output = '<div class="prometMap__marker" data-marker-name="'+this.name+'" data-location="'+this.location+'" style="left: '+this.cordX+'%; top: '+this.cordY+'%"><img src="'+this.icon+'" alt="'+this.location+'"></div>'

		return output;
	}

	this.removeMarker = function(){

		jQuery('[data-marker-name="'+this.name+'"]').remove();
		addedMarkers.removeElement(this);
		delete window[this.name];

		openedModals.removeElement(this.modal);
	}

	this.show = function(){

		this.markerContainer.append(this.generateMarker());

		// add currently generated marker to array with all generated markers;
		addedMarkers.push(this);

	}


} // MapMarker class endw

// array storing all currently opened modals;
var openedModals = [];

function MarkerModal(linkedMapMarker){

	this.linkedMapMarker = linkedMapMarker; // linked to modal map marker object
	this.members = this.linkedMapMarker.dataJSON[this.linkedMapMarker.location]['members'];
	this.positionedElemOffset = null;
	
	self = this;

	this.generateModal = function(){
		output = '<div  class="prometMap__markerContent"><div class="prometMap__close"><i class="fa fa-times" aria-hidden="true"></i></div><h3 class="sectionHeader">' + this.linkedMapMarker.location + '</h3>';

		for (member in this.members){
			output += '<div class="prometMap_markerMember">' + '<div class="prometMap__markerContentRow">' + member + '</div>';

			for (member_field in this.members[member]) {

				// if field is not empty show it
				if (this.members[member][member_field]) {
					output += '<div class="prometMap__markerContentRow">' + member_field + ": " + this.members[member][member_field] + "</div>";
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
		jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"] .prometMap__markerContent').remove();
		openedModals.removeElement(this);

		this.linkedMapMarker.deactivate();

		if (openedModals.length < 1) {
			maxZindex = 2;
		};

	}

	this.openModal = function(){

		this.linkedMapMarker.activate();

		this.linkedMapMarker.setCurrent();

		// generate modal and insert it into block with clicked map marker;
		jQuery('[data-marker-name="' + this.linkedMapMarker.name + '"]').append(this.generateModal());		

		// add currently opened modal to array with all opened modals;
		openedModals.push(this);					

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

		$markerContentWidth = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.prometMap__markerContent').outerWidth();

		// if modal content block width is grater than window width set modal with to window width
		if ($markerContentWidth > jQuery(window).outerWidth()) {
			$markerContentWidth = jQuery(window).outerWidth()-1;
		}

		$markerWidth = jQuery('.prometMap__marker').outerWidth();

		$positionedElem = jQuery('[data-marker-name="'+ this.linkedMapMarker.name +'"]').find('.prometMap__markerContent');

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

function generateUniqueMarkerName(){

	var namebase = 'mapMarker';
	var objname = generateName(namebase);

	var infiniteLoopCheck = 0;

	while (addedMarkers.indexOf(window[objname])!= -1) {

		objname = generateName(namebase);

		infiniteLoopCheck++;

		if (infiniteLoopCheck > addedMarkers.length * 100) {
			console.error('Can not generate unique name for MapMarker object. Change max number in MapMarker object name [function generateName()]. Default max: 1000');
			return false;
		};
	}

	return objname;

}

// on resize chceck if modal is fully on screen, if not change its position
jQuery(window).resize(function(){	
	openedModals.forEach(function(modal){
		modal.clearPosition();
	});
});

// on map marker click trigger event markerClick (adding new event)
jQuery('body').on('click', '.prometMap__marker img', function(){

	var clickedMarker = jQuery(this).parent().attr('data-marker-name');

	jQuery.event.trigger('markerClick', window[clickedMarker]);

});

// on "x" click in modal block close modal
jQuery('body').on('click', '.prometMap__close', function(event){

	event.stopPropagation();

	var clickedMarker = jQuery(this).parent().parent().attr('data-marker-name');

	jQuery.event.trigger('markerClose', window[clickedMarker]);

});

// on modal body click add current class to it and remove that class from all other opened modals 
// (current modal is always on top of others)
jQuery('body').on('click', '.prometMap__markerContent', function(){

	var mapMarkerParent = jQuery(this).parent().attr('data-marker-name');

	window[mapMarkerParent].setCurrent();

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


// show all markers on map function
function showAllMapMarkers(icon, container, mapDataJSON){
	var icon = icon;

	for (locationName in mapDataJSON){

		// generate unique name for map marker (checks addedMarkers array for duplicates);
		markerName = generateUniqueMarkerName();

		if (markerName) {

			window[markerName] = new MapMarker(markerName, icon, jQuery(container), locationName, mapDataJSON);

			window[markerName].show();

		}else{
			console.error("MapMarker for location: " + locationName + " was not added to map because of error.");
		}	

	}
}

function closeAllModals(){
	for (var i = openedModals.length-1; i >= 0; i--) {
		openedModals[i].closeModal()
	};
}
