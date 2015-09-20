/**
 * Created by bhaskar on 20/9/15.
 */
angular.module("sportStoreAdmin")
    .constant("productUrl", "http://localhost:2403/products/")
    .config(function($httpProvider) {
        $httpProvider.defaults.withCredentials = true;
    })
    .controller("productCtrl", function ($scope, $resource, productUrl) {
        $scope.productResource=$resource(productUrl+":id",{id:"@id"});

        $scope.listProducts= function () {
            $scope.products=$scope.productResource.query();
        }
        $scope.deleteProduct = function (product) {
            product.$delete().then(function () {
                $scope.products.splice($scope.products.indexOf(product), 1);
            });
        }
        $scope.createProduct = function (product) {
            new $scope.productResource(product).$save().then(function (newProduct) {
                $scope.products.push(newProduct);
                $scope.editedProduct = null;
            });
        }
        $scope.updateProduct = function (product) {
            product.$save();
            $scope.editedProduct = null;
        }
        $scope.startEdit = function (product) {
            $scope.editedProduct = product;
        }
        $scope.cancelEdit = function () {
            $scope.editedProduct = null;
        }
        $scope.listProducts();

    });
