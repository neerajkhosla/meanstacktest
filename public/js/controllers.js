// Define the Login Controller 
loginApp.controller('LoginCtrl', function ($rootScope, $scope, $location, loginFactory) {
    $scope.loginuser = function (form) {
        if (form.$valid) {  // Check form is valid
            var login = $scope.login;
            var password = $scope.password;
            // Loging user method
            loginFactory.getUser({
                "login": login,
                "password": password
            }).then(function (data) {
                if (data.data != null)
                    window.location.href = "/course";
            });
        }
    };
});

// Define the Course Controller 
courseApp.controller('CourseCtrl', function ($rootScope, $scope, courseFactory) {
    $scope.usercourses = [];
    $scope.name = "";
    // Get all courses specific with logged in user
    courseFactory.getcourses().then(function (data) {
        $scope.name = data.data.name;
        $scope.usercourses = data.data.mycourses;
    });
    // Logout the current logged in user
    $scope.logoutuser = function ($event) {
        courseFactory.logoutUser().then(function (data) {
            window.location.href = "/";
        });
    };
    // load the app.html page
    $scope.loadcontent = function ($event) {
        $scope.detailFrame = "../content/app.html";
    };
    // load the index.html page (for empty the page)
    $scope.emptymodel = function ($event) {
        $scope.detailFrame = "../content/index.html";
    };
});
