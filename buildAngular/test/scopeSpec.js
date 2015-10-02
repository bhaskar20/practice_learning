/**
 * Created by bhaskar on 2/10/15.
 */

/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope", function() {
	it('can be constructed and used as a object', function() {
		var scope= new Scope();// new scope
		scope.aProperty=1;//set some property 

		expect(scope.aProperty).toBe(1);//test if that property is there on scope
	});

	describe("digest", function() {
		var scope;

		beforeEach(function(){
			scope = new Scope();
		});

		it("calls the listener function of a watch to first $digest", function () {
			var watchFn = function() { return 'wat'; };
			var listenerFn = jasmine.createSpy();
			scope.$watch(watchFn,listenerFn);
			scope.$digest();
			expect(listenerFn).toHaveBeenCalled();
		});

		it('calls the watch function with scope as an argument', function() {
			var watchFn= jasmine.createSpy();
			var listenerFn=function(){ };
			scope.$watch(watchFn,listenerFn);
			scope.$digest();

			expect(watchFn).toHaveBeenCalledWith(scope);
		});

		it('calls the listener function when watch value changes', function() {
			scope.someValue='a';
			scope.counter=0;

			scope.$watch(
				function(scope){ return scope.someValue; },
				function(newValue,oldValue,scope){ scope.counter++;}
				);

			expect(scope.counter).toBe(0);

			scope.$digest();
			expect(scope.counter).toBe(1);

			scope.someValue = 'b';//change the value
			expect(scope.counter).toBe(1);

			scope.$digest();
			expect(scope.counter).toBe(2);
		});

		it("calls listener when watch value is first undefined ",function(){
			scope.counter=0;

			scope.$watch(
				function(scope){ return scope.someValue;},
				function (newValue,oldValue,scope) { scope.counter++ ; }
				);

			scope.$digest();
			expect(scope.counter).toBe(1);
		});

		it("calls listener with new value as old value the first time", function() {
			scope.someValue = 123;
			var oldValueGiven, newValueGiven;

			scope.$watch(
				function(scope) { return scope.someValue; },
				function(newValue, oldValue, scope) { oldValueGiven = oldValue; newValueGiven=newValue; }
				);

			scope.$digest();
			expect(oldValueGiven).toBe(123);

			scope.someValue=124;
			scope.$digest();
			expect(oldValueGiven).toBe(123);
			expect(newValueGiven).toBe(124);
		});
		it('may have watchers that omit the listener function', function() {
			var watchFn= jasmine.createSpy().and.returnValue('something');
			scope.$watch(watchFn);
			scope.$digest();

			expect(watchFn).toHaveBeenCalled();
		});
	});
});

