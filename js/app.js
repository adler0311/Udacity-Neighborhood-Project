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

	// make marker, click event...
	self.locations().forEach(function(item) {
		console.log(item)
		var marker = new google.maps.Marker({
			position: item.location, 
			animation: google.maps.Animation.DROP,
		    map: map,
		    title: item.name
		});	

		// infowindow 선언
		item.infowindow = new google.maps.InfoWindow();
		item.marker = marker

		// events when click the marker
		marker.addListener('click', function(){
			// Set this marker animate BOUNCE
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
				marker.setAnimation(google.maps.Animation.BOUNCE);
			}

			// execute displayInfoWindow function when click the marker
			showInfo(item, item.infowindow);
		});

		item.displayInfoWindow = function() {
			showInfo(item, this.infowindow);
		}


		// infowindow에 내용을 보여주는 displayInfoWindow function
		showInfo = function(item, infowindow) {
			// Before animate this marker, all the other animation stop.
			self.locations().forEach(function(item) {				
				item.marker.setAnimation(null);
				item.infowindow.close();
			});

			infowindow.open(map, item.marker);

			var infoName = '<h4>'+ item.name + '</h4>'
			var viewTag = '<div id="pano"></div>';
			var text = '<p>fsjkfhaflksajdlkfnadsasflkhflasfdas</p>'
			var content = infoName + viewTag + text;
			infowindow.setContent(content);

	        console.log(item.location)
			

			// panorama
			var panorama;
			function activepanorama() {
				panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
      			panorama.setPosition(item.location);
      		}
			activepanorama();
        	console.log(document.getElementById("pano"))
			console.log(infowindow.content)
		}
	});



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
