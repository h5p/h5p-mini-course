H5P.MiniCourse.MaxScoreWidget = (function ($) {

  function MaxScoreWidget(maxScore, dictionary) {
    var self = this;

    var $element = $('<div>', {
      'class': 'h5p-mini-course-max-score-widget h5p-mini-course-result-panel',
      'html':
        '<div class="max-score-widget-title">' + dictionary.maxScoreLabel + '</div>' +
        '<div class="max-score-widget-bg">' +
          '<div class="max-score-widget-score">' + maxScore + '</div>' +
        '</div>'
    });

    self.getElement = function () {
      return $element;
    };
  }

  return MaxScoreWidget;
})(H5P.jQuery);
