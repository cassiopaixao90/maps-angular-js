// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice']);
addCtrl.controller('addCtrl', function($scope, $http, $rootScope, geolocation, gservice) {

  // Initializes Variables
  // ----------------------------------------------------------------------------
  $scope.formData = {};
  var coords = {};
  var lat = 0;
  var long = 0;

  // Set initial coordinates to the center of the US
  $scope.formData.longitude = -98.350;
  $scope.formData.latitude = 39.500;

  // Get User's actual coordinates based on HTML5 at window load
  geolocation.getLocation().then(function(data) {

    // Set the latitude and longitude equal to the HTML5 coordinates
    coords = {
      lat: data.coords.latitude,
      long: data.coords.longitude
    };

    console.log("data", data);

    // Display coordinates in location textboxes rounded to three decimal points
    // $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
    // $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

    $scope.formData.longitude =  parseFloat(data.coords.longitude).toFixed(3);
    $scope.formData.latitude = parseFloat(data.coords.latitude).toFixed(3);

    console.log(data.coords.longitude);
    console.log(data.coords.latitude);

    var latlng = new google.maps.LatLng(parseFloat(data.coords.latitude).toFixed(3), parseFloat(data.coords.longitude).toFixed(3));
    var geocoder = geocoder = new google.maps.Geocoder();
    console.log(latlng);
    // console.log(geocoder);
    geocoder.geocode({ 'location': latlng }, function (results, status) {
      console.log(results);
      console.log(status);
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                console.log("Location: " + results[1].formatted_address);
            }
        }
    });


    // Display message confirming that the coordinates verified.
    $scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";

    // gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

  });

  // Functions
  // ----------------------------------------------------------------------------

  // Get coordinates based on mouse click. When a click event is detected....
  $rootScope.$on("clicked", function() {

    // Run the gservice functions associated with identifying coordinates
    $scope.$apply(function() {
      $scope.formData.latitude = gservice.clickLat;
      $scope.formData.longitude = gservice.clickLong;
      $scope.formData.htmlverified = "Nope (Thanks for spamming my map...)";
    });
  });

  // Function for refreshing the HTML5 verified location (used by refresh button)
  // $scope.refreshLoc = function() {
  //   geolocation.getLocation().then(function(data) {
  //     coords = {
  //       lat: data.coords.latitude,
  //       long: data.coords.longitude
  //     };
  //
  //     $scope.formData.longitude = coords.long;
  //     $scope.formData.latitude = coords.lat;
  //     $scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";
  //     gservice.refresh(coords.lat, coords.long);
  //   });
  // };

  // Creates a new user based on the form fields
  $scope.createUser = function() {

    // Grabs all of the text box fields
    var userData = {
      username: $scope.formData.username,
      gender: $scope.formData.gender,
      age: $scope.formData.age,
      favlang: $scope.formData.favlang,
      location: [$scope.formData.longitude, $scope.formData.latitude],
      htmlverified: $scope.formData.htmlverified
    };

    // Saves the user data to the db
    $http.post('/users', userData)
      .success(function(data) {

        // Once complete, clear the form (except location)
        $scope.formData.username = "";
        $scope.formData.gender = "";
        $scope.formData.age = "";
        $scope.formData.favlang = "";

        // Refresh the map with new data
        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };
});
