var ele = document.getElementById("spiderText");

var app = angular.module('spider', []);
app.controller('vc_spider', function($scope,$http) {
    $scope.start = function(){
        $http({
            method: 'POST',
            url: '/spider',
            data: {ok:0}
        }).then(function successCallback(response) {
            if(response.data.ok){
              ele.value = ele.value + "开始爬取页面,请稍候..." + '\n';
            }else{
              ele.value = ele.value + "爬取页面还未完成，过会再试..." + '\n';
            }
        }, function errorCallback(response) {
            // 请求失败执行代码
        });
    }
    $scope.clean = function(){
      ele.value = "";
    }
})
