
// initialize GoogleMap
var map, marker;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.5586875, lng: 126.93669879999993},
		zoom: 17
  	});

  	// Activates knockout.js
	ko.applyBindings(new ViewModel()); 
};

function mapError() {
	alert("There's a problem. Google map loading is faild!")
}

// model of neighborhood location.
var spots = [
	{
		name: 'Chloris Tea Garden',
		location: {lat: 37.55774448891895, lng: 126.93872809410095},
		foursquareId: "4bcac5b6fb84c9b62fca1d3e"
	},
	{
		name: 'bar TILT',
		location: {lat: 37.55891542039909, lng: 126.93534692663208},
		foursquareId: "4df2462452b100c2d7f5e412"
	},
	{
		name: 'Minerva',
		location: {lat: 37.55786084240519, lng: 126.93774042764508},
		foursquareId: "4baca972f964a520b1013be3"
	},
	{
		name: 'Nice Pig',
		location: {lat: 37.55853536087748, lng: 126.93880593034153},
		foursquareId: "50113732e4b0c3490cf8c245"
	},
	{
		name: 'The Pie Hole',
		location: {lat: 37.55914992666027, lng: 126.9344703398036},
		foursquareId: "4f86ae01e4b0fa91a17db513"
	},
	{
		name: 'Gosami',
		location: {lat: 37.558267958610564, lng: 126.93474329012058},
		foursquareId: "4ee57d189adf398200800b03"
	},
	{
		name: 'Pomme Frites',
		location: {lat: 37.558942152661935, lng: 126.93552014314709},
		foursquareId: "513af3dde4b06910fe19e72b"
	}
];


// constructor function.
var Spot = function(data) {
	this.name = data.name;
	this.location = data.location;
}


var ViewModel = function() {
	var self = this;	

	self.isActive = ko.observable();
	self.toggleActive = function() {
		self.isActive(!self.isActive())	
	}


	this.locations = ko.observableArray([]); // make observableArray

	// populates locations observable array from spots
	spots.forEach(function(spot) {
		self.locations.push(new Spot(spot)); 
	});

	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var rating;
	var toggleError = false;

	// make marker, click event...
	self.locations().forEach(function(item) {

		//Foursquare api ajax request
		$.ajax({
			type: "GET",
			dataType: 'JSON',
			cache: false,
			url: 'https://api.foursquare.com/v2/venues/explore',
			data: 'v=20161027&ll=' + item.location.lat + '%2C' + item.location.lng + '&radius=1800&query='
					+ item.name + '&novelty=new&oauth_token=UY5051X5NZARVOAGHY1Y4UWSVA2VAXUQCWBCNY4WXFTUQSSJ',
			async: true,
			success: function(data) {
				item.rating = data.response.groups[0].items[0].venue.rating;
				if (!item.rating) {
					item.rating = 'There is no rating';
				}
			},
			error: function(data) {
				toggleError = true
			}
		});

		var marker = new google.maps.Marker({
		    map: map,
			position: item.location,
		    title: item.name,
			animation: google.maps.Animation.DROP
		});

		function toggleBounce() {
			self.locations().forEach(function(item) {
				item.marker.setAnimation(null);
			});

			marker.setAnimation(google.maps.Animation.BOUNCE);
		};

		marker.addListener('click', toggleBounce);
		
		item.marker = marker;
		bounds.extend(marker.position);

		// events when click the marker
		marker.addListener('click', function() {
			// execute displayInfoWindow function when click the marker
			marker.rating = item.rating;
			populateInfoWindow(this, infowindow);
		});

		item.displayInfoWindow = function() {
			toggleBounce();
			populateInfoWindow(this.marker, infowindow);;			
		}
	});

	map.fitBounds(bounds);

	$(document).ajaxStop(function(){
		if (toggleError == true) {
			alert("The Foursquare API loading is failed!");
		}
	})
	
	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on the marker
		if (infowindow.marker != marker) {
			infowindow.setContent('');
			infowindow.marker = marker;
			// infowindow.open(map, marker);
			
			//Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				marker.setAnimation(null);
				infowindow.marker = null;
			});
			var streetViewService = new google.maps.StreetViewService();
			var radius = 50;

			function getStreetView(data, status) {
				if (status == google.maps.StreetViewStatus.OK) {
					var nearStreetViewLocation = data.location.latLng;
					var heading = google.maps.geometry.spherical.computeHeading(
						nearStreetViewLocation, marker.position);
					infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>'+ '<p>Foursquare rating: ' + marker.rating + '</p>');
					var panoramaOptions = {
						position: nearStreetViewLocation,
						pov: {
							heading: heading,
							pitch: 30
						}
					};
					var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
				} else {
					infowindow.setContent('<div>' + marker.title +'</div>'+'<div>No Street View Found</div>');
 				}
			}

			// Use streetview service to get the closest streetview image within
			// 50 meters of the markers position.
			streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
			// Open the infowindow on the correct marker.
			infowindow.open(map, marker);
		} // end of the if statement
	}; // end of the populateInfoWindow function.

	self.filter = ko.observable(""); // value of searching form

	// filtered list. append to list
	self.filteredItems = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		return self.locations().filter(function(item) { 
			var match = (item.name.toLowerCase().indexOf(filter) > -1)
			if (!match) {
				item.marker.setVisible(false);
			} else {
				item.marker.setMap(map); 
				return item.name.toLowerCase().indexOf(filter) > -1;
			}
		});
	})
}