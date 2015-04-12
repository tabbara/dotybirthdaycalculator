var app = angular.module("myApp", [
  "ui.router",
  "ngSanitize",
  "mainModule"
]);

angular.module("mainModule", []);

angular.module('mainModule')
  .filter('startFrom', function() {
  return function(input, start) {
    start = parseInt(start, 10);
    return input.slice(start);
  }
})
  .controller('mainCtrl', function($rootScope, $scope, $state, $q, $http) {

  var login = function (userEmail, userPassword) {
    var deferred = $q.defer();
    var timeNonce = new Date().getTime();

    $http({
      method: 'GET',
      url: 'https://www.daysoftheyear.com/api/1.6/users/?login&email=' + userEmail + '&password=' + userPassword + '&throwaway=' + timeNonce
    }).
    success(function(data, status, headers) {
      if(data.status.code === 100) {
        deferred.resolve();
      } else {
        deferred.reject();
      }

    }).
    error(function(data, status) {
      deferred.reject();
    });

    return deferred.promise;
  }

  $scope.loginsuccess = 0;

  login("birthday@dotytest.com", "aaa").then( function () {
    $scope.loginsuccess = 1;
    setTimeout(function () {
      $('[data-toggle="tooltip"]').tooltip();
    }, 0);
  }, function () {
    alert("We seem to be having some technical issues, sorry! Please try again later or let us know if the problem persists.");
  });

  $scope.onLogin = function (response) {
    if (response.status == 'connected') {

      //      FB.api('/me/permissions', function(data) {
      //        console.log(data);
      //      });

      FB.api('/me?fields=birthday', function(data) {
        if (data.birthday) {
          var birthday = data.birthday.split("/");

          if (birthday.length) {
            if (birthday.length == 2 || birthday.length == 3) {
              $scope.$apply( function () {
                $rootScope.birthday = {
                  day: parseInt(birthday[1]),
                  month: parseInt(birthday[0])
                };

                //                $rootScope.birthday = {
                //                  day: 12,
                //                  month: 12
                //                };

                function treatAsUTC(date) {
                  var result = new Date(date);
                  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
                  return result;
                }

                function daysBetween(startDate, endDate) {
                  var millisecondsPerDay = 24 * 60 * 60 * 1000;
                  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
                }

                var currentDateFull = new Date();
                var currentDate = new Date(currentDateFull.getFullYear(), currentDateFull.getMonth(), currentDateFull.getDate());

                var birthdayThisYear = new Date(currentDate.getFullYear(), $rootScope.birthday.month-1, $rootScope.birthday.day);

                if( currentDate.getTime() > birthdayThisYear.getTime() ) {
                  birthdayThisYear.setFullYear(birthdayThisYear.getFullYear()+1);
                };

                $rootScope.birthday.daysleft = daysBetween(currentDate, birthdayThisYear);

                $state.go('mybirthday');
              });
            } else {
              alert("Couldn't get your date of birth from Facebook, only your birthyear " + birthday[0] +", sorry! Please check your Facebook settings.");
              FB.api('/me/permissions', 'delete', function(data) {});
            }
          }
        } else {
          alert("To use this app your birthday is required. We couldn't retrieve your birthday from Facebook, sorry! Please check your privacy settings.");
          FB.api('/me/permissions', 'delete', function(data) {});
        }
      });

    } else {
      alert('Something went wrong logging in to Facebook, sorry! Please try again.');
    }
  }

  $scope.showme = function () {
    FB.getLoginStatus(function(response) {
      if (response.status == 'connected') {
        $scope.onLogin(response);
      } else {
        FB.login(function(response) {
          $scope.onLogin(response);
        }, {scope: 'email, user_birthday'});
      }
    });
  }

})
  .controller('mybirthdayCtrl', function($rootScope, $scope, $state, $q, $http, $timeout) {

  $scope.openDay = function (day) {
    $('#dayModal').modal({
      backdrop: true,
      keyboard: true,
      show: true
    });

    $rootScope.dayObj = day;
  };

  var getRegistration = function (email) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: "https://www.daysoftheyear.com/api/1.6/users/?register&email=" + email
    })
      .success(function(data) {
      deferred.resolve(data);
    })
      .error( function (data) {
      deferred.reject(data);
    });

    return deferred.promise;

  };

  $rootScope.signup = {
    go: function () {
      if ($scope.signup.status == 0) {
        $scope.signup.status = 1;
        $scope.signup.message = "Loading...";

        getRegistration($scope.user.email)
          .then( function (data) {
//          $scope.$apply( function () {
            $scope.signup.status = 2;
            $scope.signup.message = "Thanks!";
            console.log('s', data);
//          });
        }, function (data) {
//          $scope.$apply( function () {
            $scope.signup.status = 2;
            $scope.signup.message = "Thanks!";
            console.log('e', data);
//          });
        });
      }
    },
    message: "Register",
    status: 0
  };

  $rootScope.fbShare = function (day) {
    FB.ui({
      method: 'share_open_graph',
      action_type: 'og.likes',
      action_properties: JSON.stringify({
        object: day.url,
      })
    }, function(response){
      console.log(response);
    });
  };

  $scope.getDays = function () {
    var deferred = $q.defer();

    var today = new Date();
    var birthdayThisYear = new Date(today.getFullYear(), $rootScope.birthday.month-1, $rootScope.birthday.day);

    if( today.getTime() > birthdayThisYear.getTime() ) {
      birthdayThisYear.setFullYear(birthdayThisYear.getFullYear()+1);
    };

    var tempDate = new Date(Date.UTC(birthdayThisYear.getFullYear(), birthdayThisYear.getMonth(), birthdayThisYear.getDate()));
    var timestamp = Math.round(tempDate.getTime()/1000);

    $http({
      method: 'GET',
      url: "https://www.daysoftheyear.com/api/1.6/days/?date_start="
      + timestamp +"&date_end=" + timestamp + "&limit=100"
    })
      .success(function(data) {
      deferred.resolve(data);
    })
      .error(function () {
      deferred.reject();
    });

    return deferred.promise;
  };


  function onAlways () {
    console.log('finished loading images');
  }

  function onProgress (imgLoad, image) {
    console.log('loaded: ' + image.img.src);
    var $imageEl = $(image.img).parent();
    $imageEl.removeClass('image-loading');
    $imageEl.children(".spinner-animation").remove();
  }

  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  $scope.startPage = function () {
    FB.api('/me?fields=first_name, email', function(data) {
      $scope.$apply( function () {
        $scope.user = {
          firstname: data.first_name || "",
          email: data.email || ""
        };
      });
    });

    months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    //    $scope.birthday.message = "We've compiled a list of the world’s weird, funny, wonderful and bizarre holidays that share their date with your birthday, " + months[$scope.birthday.month-1] + ", " + $scope.birthday.day +". Check them out below!";
    $scope.birthday.monthname = months[$scope.birthday.month-1];
  };

  $scope.startPage();

  $scope.page = {
    showing: 0,
    total: 0,
    pagesize: 2,
    currentpage: 0,
    totalpages: 0,
    stage: 0
  };

  $scope.changePage = function (direction) {
    if (direction == 0) {
      if($scope.page.currentpage > 0) {
        $scope.page.currentpage -=1;
      }
    } else {
      if (direction == 1) {
        if (($scope.page.currentpage+1) * $scope.page.pagesize < $scope.page.total) {
          $scope.page.currentpage += 1;
        }
      } else {
        if (direction == 2) {
          $scope.page.stage = 1;
        } else {
          if (direction == 3) {
            $scope.page.stage = 0;
          }
        }
      }
    }
  }

  $scope.cleanDay = function(daysArray) {
    var deferred = $q.defer();

    $.each(daysArray, function (index, _dayObj) {

      _dayObj.tag = {};
      _dayObj.tagArray = [];
      $.each(_dayObj.tags, function (_tagIndex, _tagValue) {
        _dayObj.tags[_tagIndex].name = _dayObj.tags[_tagIndex].name
          .replace("&amp;","&");

        if (_dayObj.tags[_tagIndex].level === 0) {
          _dayObj.tag = {
            name: _dayObj.tags[_tagIndex].name,
            slug: _dayObj.tags[_tagIndex].slug
          };
        }

        _dayObj.tagArray.push(_dayObj.tags[_tagIndex].slug);
      });

      var currentTime = new Date().getTime() / 1000;
      var timeDiff = 0;
      var timeIndex = -1;

      $.each(_dayObj.dates, function (_dateIndex, _dateValue) {
        var dateDiff = Math.abs(parseInt(_dayObj.dates[_dateIndex]) - currentTime);
        if (dateDiff < timeDiff || timeIndex === -1) {
          timeDiff = dateDiff;
          timeIndex = _dateIndex;
        }
      });

      _dayObj.date = new Date(parseInt(_dayObj.dates[timeIndex]) * 1000);

      _dayObj.content = "<div class='content-text'>" + _dayObj.content + "</div>"
      _dayObj.content = _dayObj.content
        .replace(/<ul>/g, "<ul class='list list-inset'>")
        .replace(/<li>/g, "<li class='item'>")
        .replace(/<h3>/g, "<h4>")
        .replace(/<\/h3>/gi, "</h4>")
        .replace(/<h2>/g, "<h3>")
        .replace(/<\/h2>/gi, "</h3>");
    });

    deferred.resolve(daysArray);

    return deferred.promise;
  };

  $scope.setDayColors = function () {
    var colors = ["#ea493b", "#7fccbd", "#81c256", "#f6d24c",
                  "#9765b8", "#73a6db", "#9e4f64", "#e6b294"];

    var lightercolors = ["#EE6D62", "#99D6CA", "#9ACE78", "#F8DB70",
                         "#AC84C6", "#8FB8E2", "#B17283", "#EBC1A9"];

    var darkercolors = ["#bf544b", "#549f90", "#649543", "#aa964d",
                        "#70478b", "#4b6e93", "#743a4a", "#9f7258"];

    $timeout(function () {
      $(".card-title").each(function(i) {
        this.style.background = colors[i % 8];
      });

      $(".card-wrapper").each(function(i) {
        this.style.borderColor = colors[i % 8];
        this.style['box-shadow'] = '0px 2px 0px 0px' + darkercolors[i % 8];
        //        rgba(175, 136, 114, 1)'
      });

      $(".dayimage-container").each(function(i) {
        this.style['background-color'] = lightercolors[i % 8];
      });
    }, 0, false);

  };

  $scope.getDays()
    .then(function(data) {
    if (data.status.code === 100) {
      $scope.cleanDay(data.result)
        .then(function (daysObject) {

        $scope.days = daysObject;
        $scope.page.showing = Math.min($scope.days.length, $scope.page.pagesize);
        $scope.page.currentpage = 0;
        $scope.page.total = $scope.days.length;
        $scope.page.stage = 0;
        if ($scope.page.total > 0) {
          $scope.page.totalpages = Math.ceil($scope.page.total / $scope.page.pagesize);
        } else { $scope.page.totalpages = 1; }

        //        $scope.setDayColors();

        //        setTimeout( function () {
        //          var imagesWrapper = $('#content-wrapper');
        //          imagesWrapper.imagesLoaded()
        //            .progress( onProgress )
        //            .always( onAlways );
        //        }, 0, false);

      });
    } else {
      alert("We seem to be having some technical issues, sorry! Please try again later or let us know if the problem persists.");
    }
  }, function (status) {
    alert("We seem to be having some technical issues, sorry! Please try again later or let us know if the problem persists.");
  });

});

angular.module("myApp")
  .config( function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/");

  $stateProvider
    .state('/', {
    cache: false,
    url: "/",
    templateUrl: "views/main.html",
    controller: "mainCtrl"
  })
    .state('mybirthday', {
    cache: false,
    url: "/mybirthday",
    templateUrl: "views/mybirthday.html",
    controller: "mybirthdayCtrl"
  });
});
