var twitter = angular.module("twitter", ['ngRoute', 'firebase']);
twitter.config(function ($routeProvider) {
    $routeProvider.when
    ('/', { templateUrl: "Views/home.html", controller: "Home" }).when
    ('/profile', { templateUrl: "Views/profile.html", controller: "Home" }).when
    ('/friends/:key', { templateUrl: "Views/friends.html", controller: "Home" }).when
    ('/error', { templateUrl: "Views/error.html" }).otherwise({ templateUrl: 'Views/error.html' });
});
twitter.factory("friendList", function () {
    return [];
});
twitter.factory("tweetList", function () {
    return [];
});
twitter.factory("userInfo", function () {
    return [];
});
twitter.factory("friendFriends", function () {
    return [];
});
twitter.controller("Home", function ($scope, $http, friendFriends, tweetList, userInfo, friendList, $firebase) {
    $scope.friendFriends = friendFriends;
    $scope.friends = friendList;
    $scope.tweets = tweetList;
    $scope.info = userInfo;
    $scope.user = "";
    $scope.myTweet = "";
    $scope.key = "";
    var myBase = new Firebase("https://twittterapp.firebaseio.com/Profile");
    // Automatically syncs everywhere in realtime
    $scope.profile = $firebase(myBase);
    $scope.addFriendTweets = function () {

        $http.get("https://" + $scope.user + ".firebaseio.com/Profile.json").success(function (data) {
            $scope.info.push(data);
            $scope.friends.push(data);

            $scope.addedFriend = {personalUrl: $scope.friends[$scope.friends.length-1].personalUrl};
            $http.post('https://twittterapp.firebaseio.com/Profile/Friends.json', $scope.addedFriend).success();

            $http.get("https://" + $scope.user + ".firebaseio.com/Profile/Tweets.json").success(function (data) {
                for (var x in data) {
                    data[x].key = x;
                    data[x].pictureUrl = $scope.info[$scope.info.length - 1].pictureUrl;
                    data[x].userName = $scope.info[$scope.info.length - 1].userName;
                    $scope.tweets.push(data[x]);
                }
            });
        });
    };
    $scope.addMyTweet = function () {
        $http.post('https://twittterapp.firebaseio.com/Profile/Tweets.json', { message: $scope.myTweet, time: Date.now(), userName: $scope.profile.userName });
        $scope.tweets.push({ pictureUrl: $scope.profile.pictureUrl, message: $scope.myTweet, time: Date.now(), userName: $scope.profile.userName });
    };
    $scope.pageLoad = function (j) {
        $scope.tweets = [];
        $scope.friends = [];
        var getMethod = function (j) {
            $http.get($scope.friendFriends[j].personalUrl + "/Profile.json").success(function (data) {

                $scope.info.push(data);
                $scope.friends.push(data);
                $http.get($scope.friendFriends[j].personalUrl + "/Profile/Tweets.json").success(function (data) {

                    for (var x in data) {
                        data[x].key = x;
                        data[x].pictureUrl = $scope.info[$scope.info.length - 1].pictureUrl;
                        data[x].userName = $scope.info[$scope.info.length - 1].userName;
                        $scope.tweets.push(data[x]);
                    };
                    i++;
                    if (i < $scope.friendFriends.length) {
                        getMethod(i);
                    }

                });
            });
        }
        getMethod(j);
    };
    $scope.friendLoad = function () {
        $scope.friendFriends = [];
        $http.get("https://twittterapp.firebaseio.com/Profile/Friends.json").success(function (data) {
            for (var x in data) {
                data[x].key = x;
                $scope.friendFriends.push(data[x]);

            };
            $scope.pageLoad(i);
        });
    };
    var i = 0;
    $scope.friendLoad();
});