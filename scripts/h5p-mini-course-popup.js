H5P.MiniCourse.Popup = (function ($, EventDispatcher) {

  function Popup(popupZIndex, $container) {
    var self = this;
    EventDispatcher.call(self);

    var currentPopupClass;

    // The semi-transparent background
    var $popupBg = $('<div>', {
      'class': 'h5p-mini-course-popup-bg',
      zIndex: popupZIndex
    });

    // the popup container
    var $popup = $('<div>', {
      'class': 'h5p-mini-course-popup' /* + machineName*/
    }).appendTo($popupBg);

    self.show = function ($elements, popupClass) {
      $elements.forEach(function ($element) {
        $popup.append($element);
      })
      if (popupClass) {
        $popup.addClass(popupClass);
        currentPopupClass = popupClass;
      }
      $container.append($popupBg);

      $popupBg.addClass('visible');

      setTimeout(function () {
        $popup.addClass('visible');
      }, 200);
    };

    self.hide = function () {

      $popup.removeClass('visible');
      $popupBg.removeClass('visible');

      setTimeout(function () {
        if (currentPopupClass) {
          $popup.removeClass(currentPopupClass);
          delete currentPopupClass;
        }
        $popup.empty();
        $popupBg.detach();

      }, 1000);
    }

    // The close button
    $('<div>', {
      'class': 'h5p-mini-course-popup-close',
      click: self.hide.bind(this)
    }).appendTo($popup);
  }

  Popup.prototype = Object.create(EventDispatcher.prototype);
  Popup.prototype.constructor = Popup;

  return Popup;

})(H5P.jQuery, H5P.EventDispatcher);
