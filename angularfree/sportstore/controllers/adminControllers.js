/**
 * Created by bhaskar on 20/9/15.
 */
angular.module("sportStoreAdmin")
    .constant("authUrl","http://localhost:2403/users/login")
    .constant("orderUrl", "http://localhost:2403/orders")
    .controller("authCtrl", function ($scope,$http,$location,authUrl) {
        $scope.authenticate= function (user,password) {
            $http.post(authUrl,{
                username:user,
                password:password
            },{
                withCredentials:true
            }).success(function (data) {
                $location.path("/main");
            }).error(function (error) {
                $scope.authenticationError=error;
            });
        }
    })
    .controller("mainCtrl",function ($scope) {
        $scope.screens=["Products","Orders"];
        $scope.current=$scope.screens[0];

        $scope.setScreen= function (index) {
            $scope.current=$scope.screens[index];
        };

        $scope.getScreen= function () {
            return $scope.current=="Products"?
                "views/adminProducts.html":"views/adminOrders.html";
        }
    })
    .controller("orderCtrl", function ($scope,$http,orderUrl) {
        $http.get(orderUrl,{withCredentials:true})
            .success(function (data) {
                $scope.orders=data;
            })
            .error(function (error) {
                $scope.error=error;
            })

        $scope.selectOrder= function (order) {
            $scope.selectedOrder=order;
        }

        $scope.calcTotal= function (order) {
            var total = 0;
            for (var i = 0; i < order.products.length; i++) {
                total +=
                    order.products[i].count * order.products[i].price;
            }
            return total;
        }
    });
