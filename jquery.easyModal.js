/**
 * easyModal.js v1.3.1
 * A minimal jQuery modal that works with your CSS.
 * Author: Flavius Matis - http://flaviusmatis.github.com/
 * Modified by: Bart Nowak - bnowak@bnowak.com
 * Modified by: Malte Riesch - malteriesch@googlemail.com
 * URL: https://github.com/bartlomn
 */

/*jslint browser: true*/
/*global jQuery*/

(function ($) {
    "use strict";
    var methods = {
        init: function (options) {

            var defaults = {
                keepOnTop : [],
                top: 'auto',
                left: 'auto',
                autoOpen: false,
                overlayOpacity: 0.5,
                overlayColor: '#000',
                overlayClose: true,
                overlayParent: 'body', 
                closeOnEscape: true,
                closeButtonClass: '.close',
                transitionIn: '',
                transitionOut: '',
                onOpen: false,
                onClose: false,
                zIndex: function () {

                    var selectorForIncreasableZIndexes;
                    if (options.keepOnTop.length > 0) {
                        selectorForIncreasableZIndexes = '*:not(' + options.keepOnTop.join(',') + ')';
                    } else {
                        selectorForIncreasableZIndexes = '*';
                    }

                    return (function (value) {
                        return value > -Infinity ? 0 : value + 1;
                    }(Math.max.apply(Math, $.makeArray($(selectorForIncreasableZIndexes).map(function () {
                        return $(this).css('z-index');
                    }).filter(function () {
                        return $.isNumeric(this);
                    }).map(function () {
                        return parseInt(this, 10);
                    })))));
                },
                updateZIndexOnOpen: true
            };

            options = $.extend(defaults, options);

            return this.each(function () {

                var o = options,
                    $overlay = $('<div class="lean-overlay"></div>'),
                    $modal = $(this);

                $overlay.css({
                    'display': 'none',
                    'position': 'fixed',
                    // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                    // because the value would be replaced when opening the modal.
                    'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex()),
                    'top': 0,
                    'left': 0,
                    'height': '100%',
                    'width': '100%',
                    'background': o.overlayColor,
                    'opacity': o.overlayOpacity,
                    'overflow': 'auto'
                }).appendTo(o.overlayParent);

                $modal.css({
                    'display': 'none',
                    'position' : 'fixed',
                    // When updateZIndexOnOpen is set to true, we avoid computing the z-index on initialization,
                    // because the value would be replaced when opening the modal.
                    'z-index': (o.updateZIndexOnOpen ? 0 : o.zIndex() + 1)
                });

                $modal.bind('openModal', function () {
                    var overlayZ = o.updateZIndexOnOpen ? o.zIndex() : parseInt($overlay.css('z-index'), 10),
                        modalZ = overlayZ + 1;

                    if(o.transitionIn !== '' && o.transitionOut !== ''){
                        $modal.removeClass(o.transitionOut).addClass(o.transitionIn);
                    }
                    $modal.css({
                        'display' : 'block',
                        'z-index': modalZ
                    });

                    $overlay.css({'z-index': overlayZ, 'display': 'block'});

                    if (o.onOpen && typeof o.onOpen === 'function') {
                        // onOpen callback receives as argument the modal window
                        o.onOpen($modal[0]);
                    }

                    // disable scroll
                    $('body').css({'overflow': 'hidden'});
                    $('body').on('wheel.modal mousewheel.modal touchmove', function (e) {
                        // todo externalise as a param
                        var $modalWrapper = $('.modal-wrapper.trade-modal');
                        var $target = $(e.target);
                        // we want to allow scrolling for events originating inside the modal-wrapper
                        // as long as the modal content does not fit inside and require scrolling
                        return $modalWrapper.css('overflow-y') === 'scroll' &&
                            $.inArray( $modalWrapper[0], $target.parents() ) > 0;
                    });
                });

                $modal.bind('closeModal', function () {
                    var $body = $('body');
                    if(o.transitionIn !== '' && o.transitionOut !== ''){
                        $modal.removeClass(o.transitionIn).addClass(o.transitionOut);
                        $modal.on('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                            $modal.css('display', 'none');
                            $overlay.css('display', 'none');
                            // enable scroll
                            $body.css({'overflow': 'auto'});
                            $('body').off('wheel.modal mousewheel.modal touchmove');
                        });
                    }
                    else {
                        $modal.css('display', 'none');
                        $overlay.css('display', 'none');
                        $body.css({'overflow': 'auto'});
                        $('body').off('wheel.modal mousewheel.modal touchmove');
                    }
                    if (o.onClose && typeof o.onClose === 'function') {
                        // onClose callback receives as argument the modal window
                        o.onClose($modal[0]);
                    }
                });

                // Close on overlay click
                $overlay.click(function () {
                    // todo: properly implment as isModal param to get passed via open call
                    // if (o.overlayClose) {
                    //     $modal.trigger('closeModal');
                    // }
                });


                $(document).keydown(function (e) {
                    // ESCAPE key pressed
                    if (o.closeOnEscape && e.keyCode === 27) {
                        $modal.trigger('closeModal');
                    }
                });

                // Close when button pressed
                $modal.on('click', o.closeButtonClass, function (e) {
                    $modal.trigger('closeModal');
                    e.preventDefault();
                });

                // Automatically open modal if option set
                if (o.autoOpen) {
                    $modal.trigger('openModal');
                }
            });
        }
    };

    $.fn.easyModal = function (method) {

        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }

        $.error('Method ' + method + ' does not exist on jQuery.easyModal');

    };

}(jQuery));
