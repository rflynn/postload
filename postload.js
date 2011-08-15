/* ex: set ts=4 et: */
/*
 * PostLoad: Prioritize/schedule page asset loading.
 * Improve responsiveness of core elements over secondary and third-party components.
 *
 * Copyright 2011 Ryan Flynn <parseerror@gmail.com>
 *
 */

var PostLoad = {

	tagOrder : {
		'IMG'   : 1,
		'DIV'   : 2,
		'IFRAME': 3,
	},

	prioritize : function (unloaded)
	{
		var wh = $(window).height();
		unloaded.sort(function (a, b) {
			var scriptcmp = (b.tagName == 'SCRIPT') - (a.tagName == 'SCRIPT');
			var aoff = $(a).offset();
			var boff = $(b).offset();
			/*
		 	* how many element pixels are visible on the page?
		 	* elements below the fold (all or partially) are loaded later.
		 	*/
			var pxonscreen = function (node, off)
			{
				var size = $(node).height() * $(node).width();
				var bottom = off.top + $(node).height();
				var belowfold = (bottom - wh) * $(node).width();
				var screenpx = size - belowfold;
				return screenpx;
			}
			var apriority = parseInt($(a).attr('postload-priority')) || 0;
			var bpriority = parseInt($(b).attr('postload-priority')) || 0;
			return bpriority - apriority
				|| scriptcmp
				|| $(b).is(':visible') - $(a).is(':visible')
				|| pxonscreen(b, boff) - pxonscreen(a, aoff)
				|| PostLoad.tagOrder[a.tagName] - PostLoad.tagOrder[b.tagName]
				|| aoff.left - boff.left
				;
		});
		return unloaded;
	},

	load_node : function (node, opts)
	{
		$(node.attributes).each(function(i, attr) {
			if (/^postload-/.test(attr.name))
			{
				if (attr.name !== 'postload-priority')
				{
					$(node).attr(attr.name.substr(9), attr.value);
					$(node).removeAttr(attr.name);
				}
			}
		});
	},

	/*
	 * load 'unloaded' DOM elements in order according to 'opts'
	 */
	load : function (unloaded, opts)
	{
		var node = unloaded.shift();
		if (node)
		{
			if (opts.load_delay)
			{
				PostLoad.load_node(node);
				setTimeout(function() {
					PostLoad.load(unloaded, opts);
				}, opts.load_delay);
			} else {
				for (node in unloaded)
				{
					PostLoad.load_node(node);
				}
			}
		}
	},

	run : function (opts)
	{
		if (!opts)
		{
			opts = {};
		}
		var plselect = opts.plselect || '.postload';
		var unloaded = PostLoad.prioritize($.makeArray($(plselect)));
		setTimeout(function() {
			PostLoad.load(unloaded, opts);
		}, opts.load_delay || 0);
	},

};

