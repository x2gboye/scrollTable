/*
scrollTable v1.0
https://github.com/x2gboye/scrollTable
*/
;(function ($) {

    var defaults = {
		baseClass: 'ui-scrollTable',
		wrapClass: 'ui-scrollTable-wrapper',
		headerClass: 'ui-scrollTable-header',
		footerClass: 'ui-scrollTable-footer',
		thClass: 'th-inner',
		tfClass: 'tf-inner',
		height: 300,
		bordered: false
    };

    var methods = {

        init: function (options) {

            return this.each(function () {
				
				var self = $(this);
				
				if(self.is('table')) {
				
					var settings = $.extend({}, defaults);
					if (options) {
						settings = $.extend(settings, options);
					}
					
					//so we can use settings in other methods
					self.data('scrollTable-settings', settings);				
					
					if(!self.data('scrollTable-init')) {	
					
						var id,
							base,
							th,
							tf,
							headHeight,
							headBorderTop,
							headBorderBottom;
												
						//add base wrapper div	
						self.wrap('<div class="' + settings.baseClass + '">');					
						base = self.parent();
						if(settings.bordered) {
							base.addClass(settings.baseClass + '-bordered');
						}
						
						//do we have a table footer?
						if(_testTF(self)) {
							//add footer div
							base.prepend('<div class="' + settings.footerClass + '">');	
							tf = self.find('> tfoot td');
							//need to add content inside empty <td></td>
							tf.each(function() {
								if($.trim($(this).html()) === "") {
									$(this).html('&nbsp;');
								}
                        	});
							//wrap td content with div
							tf.wrapInner('<div class="' + settings.tfClass + '">'); 
						}
						
						//do we have a table header?
						if(_testTH(self)) {
							//add header div
							base.prepend('<div class="' + settings.headerClass + '">');	
							th = self.find('> thead th');
							//need to add content inside empty <th></th>
							th.each(function() {
								if($.trim($(this).html()) === "") {
									$(this).html('&nbsp;');
								}
                        	});
							//wrap th content with div
							th.wrapInner('<div class="' + settings.thClass + '">');
						}

						//add table wrapper div
						self.wrap('<div class="' + settings.wrapClass + '">');
						
						
						$(window).resize(function () {
							clearTimeout(id);
							id = setTimeout(resizeCols, 250);
						});	
						
						function resizeCols() {
							methods.resize.apply(self);
						}
						
						self.data('scrollTable-init', true);
						
						methods.resize.apply(self);					
					
					}
					else {	
						
						_updateCss(self, settings);									
						methods.resize.apply(self);
											
					}
				
				}
				else {
					console.log('Cannnot use scrollTable() on a non-TABLE element');
				}
								
			});
        },
		
		resize: function () {
			
			return this.each(function () {				
				
				var self = $(this);
				
				if(self.data('scrollTable-init')) {	
					
					var settings = self.data('scrollTable-settings'),
						el = _el(self, settings),
						border = _pxToInt(el.base.css('border-right-width')),
						headers = new Array(),
						footers = new Array(),
						columns = new Array();
					
					self.find('thead th .' + settings.thClass).each(function () {
						headers.push($(this));
					});
					self.find('tfoot td .' + settings.tfClass).each(function () {
						footers.push($(this));
					});
					self.find('tbody tr:first-child td').each(function () {
						columns.push($(this));
					});
						
					_resizeLoop(headers, columns, border);
					_resizeLoop(footers, columns, border);	
					
					_setHeader(self, settings);
					_setFooter(self, settings);
					_setTableHeight(self, settings);				
										
				}
			
			});
		
		},
		
		destroy: function () {
		
			return this.each(function () {
			
				var self = $(this);
				
				if(self.data('scrollTable-init')) {
				
					var	settings = self.data('scrollTable-settings'),
						el = _el(self, settings);
					
					el.header.remove();
					self.find('.' + settings.thClass).each(function() {
						$(this).replaceWith(this.childNodes);
					});
					el.footer.remove();
					self.find('.' + settings.tfClass).each(function() {
						$(this).replaceWith(this.childNodes);
					});
					self.unwrap();
					self.unwrap().removeData('scrollTable-init');
				
				}
			
			});
		
		}

    };
	
	// private methods
	
	function _testTH(self) {
		return (self.find('> thead th').length > 0) ? true : false;
	};
	
	function _testTF(self) {
		return (self.find('> tfoot td').length > 0) ? true : false;
	};
	
	function _parseHeight(settings) {
		var h = settings.height,
			type = jQuery.type(h);
			
		if(type === "string") {
			h = h.replace('%', '');
			h = parseFloat(h);
			if(isNaN(h) || h > 100) {
				$.error("scrollTable() 'height' setting must be an int or a string with value of '0%' - '100%'");				
			}
			else {
				h = h + '%';
			}
		}
		return { h: h, type: type };
	}
	
	function _setHeader(self, settings) {
		if(_testTH(self)) {
			var el = _el(self, settings),
			headHeight = el.base.find('.' + settings.headerClass).outerHeight(),
			headBorderTop = _pxToInt(el.base.find('.' + settings.headerClass).css('border-top-width')),
			headBorderBottom = _pxToInt(el.base.find('.' + settings.headerClass).css('border-bottom-width'));
			
			self.find('> thead th .' + settings.thClass).css({
				'line-height': headHeight - (headBorderTop + headBorderBottom) + 'px',
				top: headBorderTop + 'px'
			});
			
			el.base.css('padding-top', headHeight + 'px');	
		}
	};
	
	function _setFooter(self, settings) {
		if(_testTF(self)) {
			var el = _el(self, settings),
			footHeight = el.base.find('.' + settings.footerClass).outerHeight(),						
			footBorderTop = _pxToInt(el.base.find('.' + settings.footerClass).css('border-top-width')),
			footBorderBottom = _pxToInt(el.base.find('.' + settings.footerClass).css('border-bottom-width'));
			
			self.find('> tfoot td .' + settings.tfClass).css({
				'line-height': footHeight - (footBorderTop + footBorderBottom) + 'px',
				bottom: footBorderBottom + 'px'
			});
			
			el.base.css('padding-bottom', footHeight + 'px');	
		}
	};
	
	function _setTableHeight(self, settings) {
		var el = _el(self, settings),
			headHeight = el.header.outerHeight(),
			footHeight = el.footer.outerHeight(),
			borderTopBottom = _pxToInt(el.base.css('border-top-width')) +  _pxToInt(el.base.css('border-bottom-width')),
			parent = el.base.parent(),
			p = _parseHeight(settings),
			h = (p.type === "string") ? parent.height() : p.h;
		
		if(self.find('tbody').outerHeight() < (h - headHeight - footHeight - borderTopBottom)) {
			el.base.height(self.find('tbody').outerHeight());
		}
		else {
			if(p.type === "string") {
				el.base.css('height', p.h);
			}
			else {
				el.base.height(settings.height - headHeight - footHeight - borderTopBottom);
			}
		}
	};	
	
	function _updateCss(self, settings) {
		
		var el = _el(self, settings),
			th = self.find('thead th .' + settings.thClass);
			
		el.wrap.add(th).add(el.header).add(el.base).removeAttr('class');
		el.wrap.addClass(settings.wrapClass);
		th.addClass(settings.thClass);
		el.header.addClass(settings.headerClass);
		el.base.addClass(settings.baseClass);
		if(settings.bordered) {
			el.base.addClass(settings.baseClass + '-bordered');
		}
		
	};
	
	function _resizeLoop(arr, columns, border) {
		
		if(arr.length > 0 && columns.length > 0) {
			
			var colspan = 0,
			colIndex = 0,
			w = 0;
			
			for ($i = 0; $i < arr.length; $i++) {	
				
				var pL = columns[$i].css('paddingLeft'),
					pR = columns[$i].css('paddingRight'),
					align = arr[$i].css('textAlign'),
					span = parseInt(arr[$i].parent().attr('colspan'));
				
				if(span > 1) {
					colspan = span;
					for($z = colIndex; $z < colIndex + colspan; $z++) {
						w += columns[$z].outerWidth();
					}
				}
				else {
					w += columns[colIndex].outerWidth();
				}
				
				if (align === 'center') {
					arr[$i].width(w);
				}
				else if (align === 'right') {
					pR = pR.replace('px', ''); 
					arr[$i].width(w - pR);
				}
				else {
					arr[$i].width(w);
					arr[$i].css('padding-left', pL);
				}
				
				if ($i === arr.length - 1) {
					arr[$i].width(w - border);
				}
				
				if(colspan > 0) {
					colIndex = colIndex + colspan;
				}
				else {
					colIndex = colIndex + 1;
				}
				colspan = 0;
				w = 0;
								
			}
		
		}
		
	};
	
	function _el(self, settings) {
		var base = self.closest('.' + settings.baseClass),
			wrap = base.find('.' + settings.wrapClass),
			header = base.find('.' + settings.headerClass),
			footer = base.find('.' + settings.footerClass);
		return	{ base: base, wrap: wrap, header: header, footer: footer }		
	};
	
	function _pxToInt(str) {
		return parseInt(str.replace('px', ''));
	};

    $.fn.scrollTable = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on scrollTable");
        }

    };

})(jQuery);
