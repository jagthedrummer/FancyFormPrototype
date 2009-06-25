/*
  Here are a few function borrowed from the mootools code to make the FanyForm work.
  I tried to use prototype.js equivalents for as many things as I could.
 */


/*
Function: $merge
	merges a number of objects recursively without referencing them or their sub-objects.

Arguments:
	any number of objects.

Example:
	>var mergedObj = $merge(obj1, obj2, obj3);
	>//obj1, obj2, and obj3 are unaltered
*/

function $merge(){
	var mix = {};
	for (var i = 0; i < arguments.length; i++){
		for (var property in arguments[i]){
			var ap = arguments[i][property];
			var mp = mix[property];
			if (mp && $type(ap) == 'object' && $type(mp) == 'object') mix[property] = $merge(mp, ap);
			else mix[property] = ap;
		}
	}
	return mix;
};


/*
Function: $defined
	Returns true if the passed in value/object is defined, that means is not null or undefined.

Arguments:
	obj - object to inspect
*/

function $defined(obj){
	return (obj != undefined);
};

/*
Function: $pick
	Returns the first object if defined, otherwise returns the second.

Arguments:
	obj - object to test
	picked - the default to return

Example:
	(start code)
		function say(msg){
			alert($pick(msg, 'no meessage supplied'));
		}
	(end)
*/

function $pick(obj, picked){
	return $defined(obj) ? obj : picked;
};

/*

Function: $type
	Returns the type of object that matches the element passed in.

Arguments:
	obj - the object to inspect.

Example:
	>var myString = 'hello';
	>$type(myString); //returns "string"

Returns:
	'element' - if obj is a DOM element node
	'textnode' - if obj is a DOM text node
	'whitespace' - if obj is a DOM whitespace node
	'arguments' - if obj is an arguments object
	'object' - if obj is an object
	'string' - if obj is a string
	'number' - if obj is a number
	'boolean' - if obj is a boolean
	'function' - if obj is a function
	'regexp' - if obj is a regular expression
	'class' - if obj is a Class. (created with new Class, or the extend of another class).
	'collection' - if obj is a native htmlelements collection, such as childNodes, getElementsByTagName .. etc.
	false - (boolean) if the object is not defined or none of the above.
*/

function $type(obj){
	if (!$defined(obj)) return false;
	if (obj.htmlElement) return 'element';
	var type = typeof obj;
	if (type == 'object' && obj.nodeName){
		switch(obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	}
	if (type == 'object' || type == 'function'){
		switch(obj.constructor){
			case Array: return 'array';
			case RegExp: return 'regexp';
			case Class: return 'class';
		}
		if (typeof obj.length == 'number'){
			if (obj.item) return 'collection';
			if (obj.callee) return 'arguments';
		}
	}
	return type;
};



/*
  My own function to merge two arrays
 */

function mergeArray(first,second){
    for (var i = 0, l = second.length; i < l; i++){
	first.push(second[i]);
    }
    return first;
}


/*
* FancyFormPrototype 0.95
* Prototype compatibility enhancements by
* Jeremy Green, webeprint.com
*
* Adapted from  
* FancyForm 0.95
* By Vacuous Virtuoso, lipidity.com
*
* ---
* Checkbox and radio input replacement script.
* Toggles defined class when input is selected.
*/

var FancyForm = {
	start: function(elements, options){
		if(FancyForm.initing != undefined) return;
		if($type(elements)!='array') elements = $$('input');
		if(!options) options = [];
		FancyForm.onclasses = ($type(options['onClasses']) == 'object') ? options['onClasses'] : {
			checkbox: 'checked',
			radio: 'selected'
		}
		FancyForm.offclasses = ($type(options['offClasses']) == 'object') ? options['offClasses'] : {
			checkbox: 'unchecked',
			radio: 'unselected'
		}
		if($type(options['extraClasses']) == 'object'){
			FancyForm.extra = options['extraClasses'];
		} else if(options['extraClasses']){
			FancyForm.extra = {
				checkbox: 'f_checkbox',
				radio: 'f_radio',
				on: 'f_on',
				off: 'f_off',
				all: 'fancy'
			}
		} else {
			FancyForm.extra = {};
		}
		FancyForm.onSelect = $pick(options['onSelect'], function(el){});
		FancyForm.onDeselect = $pick(options['onDeselect'], function(el){});
		FancyForm.chks = [];
		FancyForm.add(elements);
		$$('form').each( function(x) {
			x.observe('reset', function(a) {
				window.setTimeout(function(){FancyForm.chks.each(function(x){FancyForm.update(x);x.inputElement.blur()})}, 200);
			});
		});
	},
	add: function(elements){
		if($type(elements) == 'element')
			elements = [elements];
		FancyForm.initing = 1;
		var keeps = [];

		var newChks = elements.filter(function(chk){
			if($type(chk) != 'element' || chk.inputElement || (chk.tagName.toLowerCase() == 'input' && chk.parentNode.inputElement))
				return false;
			if(chk.tagName.toLowerCase() == 'input' && (FancyForm.onclasses[chk.getAttribute('type')])){
				var el = chk.parentNode;
				if(el.getElementsBySelector('input')[0]==chk){
					el.type = chk.getAttribute('type');
					el.inputElement = chk;
					this.push(el);
				} else {
					chk.observe('click',function(f){
						if(f.event.stopPropagation) f.event.stopPropagation();
					});
				}
			} else if((chk.inputElement = chk.getElementsBySelector('input')[0]) && (FancyForm.onclasses[(chk.type = chk.inputElement.getAttribute('type'))])){
				return true;
			}
			return false;
		}.bind(keeps));

		newChks = mergeArray(newChks,keeps);
		newChks.each(function(chk){
			var c = chk.inputElement;
			c.setStyle({position:'absolute'});
			c.setStyle({left:'-9999px'});
			chk.observe('selectStart', function(f){f.stop()});
			chk.name = c.getAttribute('name');
			FancyForm.update(chk);
		});
		newChks.each(function(chk){
			var c = $(chk.inputElement);
			chk.observe('click', function(f){
				console.log('chk = ' + chk + ' and c = ' + c)				
				f = Event.extend(f);
				f.stop(); //f.type = 'prop';
				//c.fire('click');
				c.click();
			        });
			chk.observe('mousedown', function(f){
				if($type(c.onmousedown) == 'function')
					c.onmousedown();
				f.preventDefault();
			});
			chk.observe('mouseup', function(f){
				if($type(c.onmouseup) == 'function')
					c.onmouseup();
			});
			c.observe('focus', function(f){
				if(FancyForm.focus)
					chk.setStyle('outline', '1px dotted');
			});
			c.observe('blur', function(f){
				chk.setStyle('outline', 0);
			});
			c.observe('click', function(f){

				if(f.stopPropagation) f.stopPropagation();
				if(c.getAttribute('disabled')) // c.getStyle('position') != 'absolute'
					return;
				if (!chk.hasClassName(FancyForm.onclasses[chk.type])){
					c.setAttribute('checked', 'checked');
				}else if(chk.type != 'radio'){
					c.setAttribute('checked', false);
				}
				if(f.type == 'prop')
					FancyForm.focus = 0;
				FancyForm.update(chk);
				FancyForm.focus = 1;
				if(f.type == 'prop' && !FancyForm.initing && $type(c.onclick) == 'function')
					 c.onclick();
			});
			c.observe('mouseup', function(f){
				if(f.stopPropagation) f.stopPropagation();
			});
			c.observe('mousedown', function(f){
				if(f.stopPropagation) f.stopPropagation();
			});
			if(extraclass = FancyForm.extra[chk.type])
				chk.addClassName(extraclass);
			if(extraclass = FancyForm.extra['all'])
				chk.addClassName(extraclass);
		});
		FancyForm.chks = mergeArray(newChks,FancyForm.chks);
		
		FancyForm.initing = 0;
	},
	update: function(chk){
		if(chk.inputElement.getAttribute('checked')=='checked') {
			chk.removeClassName(FancyForm.offclasses[chk.type]);
			chk.addClassName(FancyForm.onclasses[chk.type]);
			if (chk.type == 'radio'){
				FancyForm.chks.each(function(other){
					if (other.name == chk.name && other != chk) {
						other.inputElement.setAttribute('checked', false);
						FancyForm.update(other);
					}
				});
			}
			if(extraclass = FancyForm.extra['on'])
				chk.addClassName(extraclass);
			if(extraclass = FancyForm.extra['off'])
				chk.removeClassName(extraclass);
			if(!FancyForm.initing)
				FancyForm.onSelect(chk);
		} else {
			chk.removeClassName(FancyForm.onclasses[chk.type]);
			chk.addClassName(FancyForm.offclasses[chk.type]);
			if(extraclass = FancyForm.extra['off'])
				chk.addClassName(extraclass);
			if(extraclass = FancyForm.extra['on'])
				chk.removeClassName(extraclass);
			if(!FancyForm.initing)
				FancyForm.onDeselect(chk);
		}
		if(!FancyForm.initing)
			chk.inputElement.focus();
	},
	all: function(){
		FancyForm.chks.each(function(chk){
			chk.inputElement.setAttribute('checked', 'checked');
			FancyForm.update(chk);
		});
	},
	none: function(){
		FancyForm.chks.each(function(chk){
			chk.inputElement.setAttribute('checked', false);
			FancyForm.update(chk);
		});
	}
};


Event.observe(window, 'load', function() {
  FancyForm.start();
  });

