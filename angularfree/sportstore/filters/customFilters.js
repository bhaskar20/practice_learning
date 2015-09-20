/**
 * Created by bhaskar on 20/9/15.
 */
angular.module("customFilters",[])
    .filter("unique", function () {
        return function (data,propertyName) {
            if(angular.isArray(data) && angular.isString(propertyName)){
                var result=[];
                var keys={};
                angular.forEach(data, function (item) {
                    if(angular.isDefined(item[propertyName])){
                        if(angular.isUndefined(keys[item[propertyName]])){
                            keys[item[propertyName]]=true;
                            result.push(item[propertyName]);
                        }
                    }
                });
                return result;
            }
            else{
                return data;
            }
        }
    })
    .filter("range", function ($filter){
        return function (data,page,size) {
            if(angular.isArray(data) && angular.isNumber(page) && angular.isNumber(size)) {
                var start_index = (page - 1) * size;
                if (data.length < start_index) {
                    return [];
                }
                else {
                    return $filter("limitTo")(data.slice(start_index), size);
                }
            }
            else{
                return data;
            }
        }
    })
    .filter("pageCount", function () {
        return function (data,size) {
            if(angular.isArray(data)){
                var result=[];
                for (var i = 0; i < Math.ceil(data.length / size) ; i++) {
                    result.push(i);
                }
                return result;
            }
            else{
                return data;
            }
        }
    });





