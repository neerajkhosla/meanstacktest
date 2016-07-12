// Course App Load Partial view and startup route
courseApp = angular.module('courseApp', ['ngRoute'])
  .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
            templateUrl: '/views/course.html',
            // controller: 'CourseCtrl'
        }).otherwise({
            redirectTo: '/'
        });
});

// Login App loaded partial view and startup route
loginApp = angular.module('loginApp', ['ngRoute'])
  .config(function ($routeProvider) {
      $routeProvider
            .when('/', {
                templateUrl: '/views/loginuser.html',
                controller: 'LoginCtrl'
            })
          .when('/users/login', {
              templateUrl: '/views/employee.html',
              controller: 'LoginCtrl'
          }).otherwise({
              redirectTo: '/'
          });

  });


