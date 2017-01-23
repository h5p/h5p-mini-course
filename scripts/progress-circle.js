H5P.MiniCourse.ProgressCircle = (function ($) {

  var progressTemplate = '<div class="radial-progress" data-progress="0">' +
    '<div class="circle">' +
      '<div class="mask full">' +
      '	<div class="fill"></div>' +
      '</div>' +
      '<div class="mask half">' +
      '	<div class="fill"></div>' +
      '	<div class="fill fix"></div>' +
      '</div>' +
      '<div class="shadow"></div>' +
    '</div>' +
    '<div class="inset">' +
    ' <div class="percentage" role="progressbar" aria-live="polite">' +
    '	</div>' +
    '</div>' +
  '</div>';

  function ProgressWidget(totalScore, header) {
    var self = this;
    var currentScore = 0;
    //var $ui = $('.h5p-lections-score');
    //$ui.empty();
    //$ui.append('<div class="h5p-score-header" aria-hidden="true">Score</div>');
    //$ui.append(progressTemplate);
    //var $progress = $ui.find('.radial-progress');
    //var $text = $ui.find('.percentage');



    self.increment = function (score) {
      currentScore += score || 1;
      updateUI();
    };

    self.reset = function () {
      currentScore = 0;
      updateUI();
    };

    self.appendTo = function ($container) {
      self.$container = $container;

      self.$container.append($('<div>', {
        'class': 'h5p-progress-circle-header',
        'aria-hidden': true,
        html: header
      }));

      self.$container.append(progressTemplate);

      self.$progress = $container.find('.radial-progress');
      self.$text = $container.find('.percentage');

      self.$text.attr({
        'aria-valuemin': 0,
        'aria-valuemax': totalScore,
        'aria-label': 'Score'
      });

      updateUI();
    };

    var updateUI = function () {
      self.$text.html(currentScore + ' / ' + totalScore);
      self.$progress.attr('data-progress', Math.ceil((currentScore/totalScore)*100));
      self.$text.attr('aria-valuenow', currentScore);
    };

  }
  return ProgressWidget;

})(H5P.jQuery);
