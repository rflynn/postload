/* ex: set ts=4 et: */
/*
 * PostLoad: Prioritize/schedule page asset loading.
 * Improve responsiveness of core elements over secondary and third-party components.
 *
 * Copyright 2011 Ryan Flynn <parseerror@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
            /*
             * how many element pixels are visible on the page?
             * favors elements by being above the fold and by size
             */
            var pxonscreen = function (node, off)
            {
                var size = $(node).height() * $(node).width();
                var bottom = off.top + $(node).height();
                var belowfold = (bottom - wh) * $(node).width();
                var screenpx = size - belowfold;
                return screenpx;
            }
            var apriority = parseInt($(a).attr('postload-priority')) || 99;
            var bpriority = parseInt($(b).attr('postload-priority')) || 99;
            var aoff = $(a).offset();
            var boff = $(b).offset();
            var abovethefoldcmp = (boff.top < wh) - (aoff.top < wh);
            return abovethefoldcmp
                || $(b).is(':visible') - $(a).is(':visible')
                || apriority - bpriority
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

