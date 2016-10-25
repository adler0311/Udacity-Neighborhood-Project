// initialize GoogleMap
var map, marker;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 37.5586875, lng: 126.93669879999993},
		zoom: 17
  	});

  	

  	// Activates knockout.js
  	// applyBindings를 여기에 해야 google을 사용할 수 있다.
	ko.applyBindings(new ViewModel()); 
}


// model of neighborhood location.
var Spots = [
	{
		name: "starbucks yonsei",
		location: {lat: 37.5586875, lng: 126.93669879999993}
	},
	{
		name: "macdonald yonsei",
		location: {lat: 37.5585515, lng: 126.93670859999997}
	},
	{
		name: "burgerking yonsei",
		location: {lat: 37.5578925, lng: 126.93667159999995}
	},
	{
		name: "pizzahut yonsei",
		location: {lat: 37.55745599999999, lng: 126.93672530000003}
	},
];


// constructor function.
var Spot = function(data) {
	this.name = data.name;
	this.location = data.location;
}


var ViewModel = function() {
	var self = this;	
	this.locations = ko.observableArray([]); // observableArray를 만든다. 

	// populates locations observable array from Spots
	Spots.forEach(function(spot) {
		self.locations.push(new Spot(spot)); // 모델로부터 spot데이터를 가져와서 Spot이라는 object에서 observable로 바꾼 후 spotList에 집어 넣는다.
	});

	var infowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// make marker, click event...
	self.locations().forEach(function(item) {

		var marker = new google.maps.Marker({
		    map: map,
			position: item.location, 
		    title: item.name,
			animation: google.maps.Animation.DROP
		});	

		item.marker = marker;
		bounds.extend(marker.position);

		// events when click the marker
		marker.addListener('click', function(){
			// execute displayInfoWindow function when click the marker
			populateInfoWindow(this, infowindow);
		});

		item.displayInfoWindow = function() {
			populateInfoWindow(this.marker, infowindow);;			
		}
	});

	map.fitBounds(bounds);

	function populateInfoWindow(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on the marker
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
			infowindow.open(map, marker);
			//Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function() {
				infowindow.marker(null);
			});
		}
	};

	self.filter = ko.observable(""); // searching form의 value.

	// filter된 결과 list. list에 출력될 예정.
	self.filteredItems = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		return self.locations().filter(function(item) { // 입력한 값이 item.name안에 있으면 true
			var match = (item.name.toLowerCase().indexOf(filter) > -1) //입력한 글자가 item이름에 있으면 match = true
			console.log(match)
			if (!match) {
				item.marker.setMap(null);
			} else {
				item.marker.setMap(map); // map에 올린다는 뜻이다. 
				return item.name.toLowerCase().indexOf(filter) > -1;
			}
		});
	});
};
