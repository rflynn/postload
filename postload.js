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
                || aoff.left - boff.left
                ;
        });
        return unloaded;
    },

    load_node : function (node)
    {
        if (node.tagName == 'LINK')
        {
            $(node).attr('href', $(node).attr('postload-href'));
        } else {
            $(node).attr('src', $(node).attr('postload-src'));
        }
    },

    /*
     * load 'unloaded' DOM elements in order according to 'opts'
     */
    load : function (unloaded, opts)
    {
        var node = unloaded.shift();
        if (node)
        {
            PostLoad.load_node(node);
            if (opts.delay_each)
            {
                setTimeout(function() {
                    PostLoad.load(unloaded, opts);
                }, opts.delay_each);
            } else {
                $.map(unloaded, PostLoad.load_node);
            }
        }
    },

    run : function (opts)
    {
        if (!opts)
        {
            opts = {};
        }
        var selector = opts.selector || '(img,script,iframe,embed)[postload-src],link[postload-href]';
        var unloaded = PostLoad.prioritize($.makeArray($(selector)));
        setTimeout(function() {
            PostLoad.load(unloaded, opts);
        }, opts.delay_each || 0);
    }

};

