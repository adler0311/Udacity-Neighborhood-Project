//identify the first matching item by name
var viewModel = function() {
	var self = this

	this.filter = ko.observable();
	

	viewModel.firstMatch = ko.computed(function() {
	    var search = this.search().toLowerCase();
	    if (!search) {
	        return null;
	    } else {
	        return ko.utils.arrayFirst(this.filteredItems(), function(item) {
	            return ko.utils.stringStartsWith(item.name().toLowerCase(), search);
	        });
	    }
	}, viewModel);	
}


ko.applyBindings(new viewModel());