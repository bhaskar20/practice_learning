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

		it('triggers chained watchers in the same digest', function() {
			scope.name='Jane';

			scope.$watch(
				function(scope) { return scope.nameUpper; },
				function(newValue,oldValue,scope){
					if(newValue){
						scope.initial=newValue.substring(0,1)+'.';
					}
				}
				);
			scope.$watch(
				function(scope){ return scope.name; },
				function(newValue,oldValue,scope){
					if(newValue){
						scope.nameUpper=newValue.toUpperCase();
					}
				}
				);
			scope.$digest();
			expect(scope.initial).toBe('J.');
			scope.name='Bob';
			scope.$digest();
			expect(scope.initial).toBe('B.');
		});

		it('gives up on watches after 10 iterations', function() {
			scope.counterA=0;
			scope.counterB=0;

			scope.$watch(
				function(scope){return scope.counterA; },
				function(newValue,oldValue,scope){
					scope.counterB++
				}
				);
			scope.$watch(
				function(scope){return scope.counterA; },
				function(newValue,oldValue,scope){
					scope.counterA++
				}
				);

			expect((function() { scope.$digest(); })).toThrow();
		});

		it('ends the digest when the last watch is clean', function() {
			scope.array = _.range(100);
			var watchExecutions=0;

			_.times(100,function(i){
				scope.$watch(
					function(scope){
						watchExecutions++;
						return scope.array[i];
					},
					function(newValue,oldValue,scope){
					}
					);
			});
			scope.$digest();
			expect(watchExecutions).toBe(200);

			scope.array[0]=420;
			scope.$digest();
			expect(watchExecutions).toBe(301);
		});

		it('does not end digest so that new watches are not run', function() {
			scope.aValue='abc';
			scope.counter = 0;

			scope.$watch(
				function(scope){ return scope.aValue; },
				function(newValue,oldValue,scope){
					scope.$watch(
						function(scope){ return scope.aValue;},
						function(newValue,oldValue,scope){
							scope.counter++;
						});
				});
			scope.$digest();
			expect(scope.counter).toBe(1);
		});

		it('compares based on value if enabled', function() {
			scope.aValue=[1,2,3];
			scope.counter=0;

			scope.$watch(
				function(scope){ return scope.aValue; },
				function(newValue,oldValue,scope){
					scope.counter++;
				},true);

			scope.$digest();
			expect(scope.counter).toBe(1);

			scope.aValue.push(4);
			scope.$digest();
			expect(scope.counter).toBe(2);
		});
		it('correctly handles NaN ', function() {
			scope.number=0/0; //NaN
			scope.counter=0;

			scope.$watch(
				function(scope){ return scope.number; },
				function(newValue,oldValue,scope){
					scope.counter++;
				});
			scope.$digest();
			expect(scope.counter).toBe(1);

			scope.$digest();
			expect(scope.counter).toBe(1);
		});
	});

	describe('eval',function(){
		var scope;
		beforeEach(function(){
			scope = new Scope();
		});

		it('executes eval function and return results', function() {
			scope.aValue=42;

			var result = scope.$eval(function(scope){
				return scope.aValue;
			});
			expect(result).toBe(42);
		});

		it('passes the second argument straight through', function() {
			scope.aValue=42;

			var result = scope.$eval(function(scope,arg){
				return scope.aValue+arg;
			},2);
			expect(result).toBe(44);
		});
	});

	describe('apply', function() {
		var scope;
		beforeEach(function(){
			scope=new Scope();
		});

		it('executes applied function and kickstarts the digest ', function() {
			scope.aValue = 'someValue';
			scope.counter = 0;

			scope.$watch(
				function(scope){
					return scope.aValue;
				},
				function(newValue,oldValue,scope){
					scope.counter++
				});
			scope.$digest();
			expect(scope.counter).toBe(1);

			scope.$apply(function(scope){
				scope.aValue='someothervalue';
			});
			expect(scope.counter).toBe(2);
			expect(scope.aValue).toBe('someothervalue');
		});
	});

	describe('evalAsynced', function() {
		var scope;
		beforeEach(function(){
			scope=new Scope();
		});

		it('executes evalAsynced function later in the same digest cycle', function() {
			scope.aValue = [1, 2, 3];
			scope.asyncEvaluated = false;
			scope.asyncEvaluatedImmediately = false;
		
			scope.$watch(
				function(scope) { return scope.aValue; },
				function(newValue, oldValue, scope) {
					scope.$evalAsync(function(scope) {
						scope.asyncEvaluated = true;
					});
					scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
				});

			scope.$digest();
			expect(scope.asyncEvaluated).toBe(true);
			expect(scope.asyncEvaluatedImmediately).toBe(false);
		});

		it('executes evalAsynced function added by watchFn', function() {
			scope.aValue = [1, 2, 3];
			scope.asyncEvaluated = false;

			scope.$watch(
				function(scope){
					if(!scope.asyncEvaluated){
						scope.$evalAsync(function(scope){
							scope.asyncEvaluated=true;
						});
					}
					return scope.aValue;
				},
				function(newValue,oldValue,scope){}
				);
			scope.$digest();

			expect(scope.asyncEvaluated).toBe(true);
		});

		it('executes evalAsynced function even when no watch is dirty', function() {
			scope.aValue = [1, 2, 3];
			scope.asyncEvaluatedTimes = 0;

			scope.$watch(
				function(scope){
					if(scope.asyncEvaluatedTimes<2){
						scope.$evalAsync(function(scope){
							scope.asyncEvaluatedTimes++;
						});
					}
					return scope.aValue;
				},
				function(newValue,oldValue,scope){ }
				);
			scope.$digest();

			expect(scope.asyncEvaluatedTimes).toBe(2);
		});	

		it('eventually halts $evalAsyncs added by watches', function() {
			scope.aValue=[1,2,3];

			scope.$watch(
				function(scope){
					scope.$evalAsync(function(scope){ });
					return scope.aValue;
				},
				function(newValue,oldValue,scope){ }
				);

			expect(function() { scope.$digest(); }).toThrow();
		});
	});

});

