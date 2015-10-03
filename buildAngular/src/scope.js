/* jshint globalstrict: true */
'use strict';
function Scope() {

	this.$$watchers=[];
	this.$$lastDirtyWatch=null;
	this.$$acyncQueue=[];
	this.$$phase=null;
	this.$$applyAcyncQueue=[];
	this.$$applyAcyncId=null;
	function initWatchVal() { };

	Scope.prototype.$watch = function(watchFn,listenerFn,valueEq) {
		var watcher = {
			watchFn:watchFn,
			listenerFn:listenerFn || function(){} ,
			last:initWatchVal,
			valueEq:valueEq
		};
		this.$$watchers.push(watcher);
		this.$$lastDirtyWatch=null;
	};
	Scope.prototype.$$digestOnce = function() {
		var self= this;
		var newValue,oldValue,dirty;
		_.forEach(this.$$watchers,function (watcher) {
			newValue=watcher.watchFn(self);
			oldValue=watcher.last;
			if(!self.$$areEqual(newValue,oldValue,watcher.valueEq)){
				self.$$lastDirtyWatch = watcher;
				watcher.last=(watcher.valueEq ? _.cloneDeep(newValue): newValue);
				watcher.listenerFn(newValue,
					oldValue===initWatchVal ? newValue : oldValue,
					self);
				dirty=true;
			}
			else if (self.$$lastDirtyWatch === watcher) {
				return false;
			}
		});
		return dirty;
	};
	Scope.prototype.$digest = function() {
		var ttl=10;
		var dirty;
		this.$$lastDirtyWatch = null;
		this.$beginPhase('$digest');
		if(this.$$applyAcyncId){
			clearTimeout(this.$$applyAcyncId);
			this.$$flushApplyAsync();
		}
		do{
			while(this.$$acyncQueue.length){
				var asyncTask= this.$$acyncQueue.shift();
				asyncTask.scope.$eval(asyncTask.expression);
			}
			dirty=this.$$digestOnce();
			if((dirty || this.$$acyncQueue.length) && !(ttl--)){
				this.$clearPhase();
				throw "10 digest iterations reached";
			}
		}while(dirty || this.$$acyncQueue.length);
		this.$clearPhase();
	};
	Scope.prototype.$$areEqual = function(newValue,oldValue,valueEq) {
		if(valueEq){
			return _.isEqual(newValue,oldValue);
		}else{
			return newValue===oldValue || (typeof newValue === 'number' && typeof oldValue ==='number' &&
				isNaN(newValue) && isNaN(oldValue));
		}
	};
	Scope.prototype.$eval = function(expr,locals) {
		return expr(this,locals);
	};
	Scope.prototype.$apply = function(expr) {
		try{
			this.$beginPhase('$apply');
			return this.$eval(expr);
		}finally{
			this.$clearPhase();
			this.$digest();
		}
	}
	Scope.prototype.$evalAsync = function(expr) {
		var self=this;
		if(!self.$$phase && !self.$$acyncQueue.length){
			setTimeout(function(){
				if(self.$$acyncQueue.length){
					self.$digest();
				}
			},0);
		}
		this.$$acyncQueue.push({scope:this, expression: expr});
	};
	Scope.prototype.$beginPhase = function(phase) {
		if(this.$$phase){
			throw this.$$phase + 'already in progress';
		}
		this.$$phase = phase;
	};
	Scope.prototype.$clearPhase = function() {
		this.$$phase= null;
	};
	Scope.prototype.$applyAsync = function(expr) {
		var self=this;
		self.$$applyAcyncQueue.push(function(){
			self.$eval(expr);
		});
		if(self.$$applyAcyncId==null){
			self.$$applyAcyncId = setTimeout(function(){
				self.$apply(_.bind(self.$$flushApplyAsync,self));
		},0);
		} 
	};
	Scope.prototype.$$flushApplyAsync = function() {
		while( this.$$applyAcyncQueue.length){
			this.$$applyAcyncQueue.shift()();
		}
		this.$$applyAcyncId=null;
	};
};

