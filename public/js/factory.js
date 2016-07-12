// Login Factory (Services)
loginApp.factory('loginFactory', function ($http) {
    var urlBase = '/api/users';
    var _userService = {};

    _userService.getUser = function (user) {
        return $http.post(urlBase, user);
    };
    return _userService;
});

// Course Factory (Services)
courseApp.factory('courseFactory', function ($http) {
    var urlBase = '/api/courses';
    var logBase = '/api/logoutUser';
    var _courseService = {};

    _courseService.getcourses = function () {
        return $http.get(urlBase);
    };
    _courseService.logoutUser = function () {
        return $http.get(logBase);
    };
    return _courseService;
});
