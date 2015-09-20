/**
 * Created by bhaskar on 20/9/15.
 */

angular.module("sportStore")
    .constant("dataUrl","http://localhost:2403/products")
    .constant("orderUrl","http://localhost:2403/orders")
    .config(function ($routeProvider) {
        $routeProvider.when("/complete",{
            templateUrl:"views/thankYou.html"
        });
        $routeProvider.when("/placeorder",{
            templateUrl:"views/placeOrder.html"
        });
        $routeProvider.when("/checkout",{
            templateUrl:"views/checkOutSummary.html"
        });
        $routeProvider.when("/products",{
            templateUrl:"views/productList.html"
        });
        $routeProvider.otherwise({
            templateUrl:"views/productList.html"
        });
    })
    .controller("sportStoreCtrl", function ($scope,$http,dataUrl,$location,orderUrl,cart) {
        $scope.data = {};
        $http.get(dataUrl)
            .success(function (data) {
                $scope.data.products=data;
            })
            .error(function (error) {
                $scope.data.error=error;
            });
        $scope.sendOrder= function (shippingDetails) {
            var order=angular.copy(shippingDetails);
            order.products=cart.getProducts();
            $http.post(orderUrl,order)
                .success(function (data) {
                    $scope.data.orderId=data.id;
                    cart.getProducts().length=0;
                })
                .error(function (error) {
                    $scope.data.orderError=error;
                })
                .finally(function () {
                    $location.path("/complete");
                });
        }
    });
