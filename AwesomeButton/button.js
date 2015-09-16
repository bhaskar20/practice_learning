function UIProgressButton(e1,options){
	this.e1=e1;
	this.options=extend({},this.options);
	extend(this.options,options);
	this._init();
}
UIProgressButton.prototype._init = function() {
	// body...
	this.button=this.e1.querySelector("button");
	this.progressEl = new SVGEl( this.el.querySelector( 'svg.progress-circle' ) );
	this.successEl = new SVGEl( this.el.querySelector( 'svg.checkmark' ) );
	this.errorEl = new SVGEl( this.el.querySelector( 'svg.cross' ) );
	// init events
	this._initEvents();
	//enable button
	this.enable();
};
function SVGEl( el ) {
	this.el = el;
	// the path elements
	this.paths = [].slice.call( this.el.querySelectorAll( 'path' ) );
	// we will save both paths and its lengths in arrays
	this.pathsArr = new Array();
	this.lengthsArr = new Array();
	this._init();
}

SVGEl.prototype._init = function() {
	var self = this;
	this.paths.forEach( function( path, i ) {
		self.pathsArr[i] = path;
		path.style.strokeDasharray = self.lengthsArr[i] = path.getTotalLength();
	} );
	// undraw stroke
	this.draw(0);
}

// val in [0,1] : 0 - no stroke is visible, 1 - stroke is visible
SVGEl.prototype.draw = function( val ) {
	for( var i = 0, len = this.pathsArr.length; i < len; ++i ){
		this.pathsArr[ i ].style.strokeDashoffset = this.lengthsArr[ i ] * ( 1 - val );
	}
}
UIProgressButton.prototype._initEvents = function() {
	var self = this;
	this.button.addEventListener( 'click', function() { self._submit(); } );
}
UIProgressButton.prototype._submit = function() {
	classie.addClass( this.el, 'loading' );
	var self = this,
	onEndBtnTransitionFn = function( ev ) {
		if( support.transitions ) {
			this.removeEventListener( transEndEventName, onEndBtnTransitionFn );
		}

		this.setAttribute( 'disabled', '' );

		if( typeof self.options.callback === 'function' ) {
			self.options.callback( self );
		}
		else {
			self.setProgress(1);
			self.stop();
		}
	};
if( support.transitions ) {
		this.button.addEventListener( transEndEventName, onEndBtnTransitionFn );
	}
else {
		onEndBtnTransitionFn();
	}
}
