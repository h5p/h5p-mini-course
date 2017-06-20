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
    '<div class="inset"></div>' +
  '</div>';

  function ProgressWidget(totalScore, label, showTotal) {
    var self = this;
    var currentScore = 0;

    self.increment = function (score) {
      currentScore += score || 1;
      updateUI();
    };

    self.reset = function () {
      currentScore = 0;
      updateUI();
    };

    self.getScore = function () {
      return currentScore;
    };

    self.appendTo = function ($container) {
      self.$container = $container;

      self.$container.append(progressTemplate);

      // Create label:
      self.$container.append($('<div>', {
        'class': 'h5p-progress-circle-label',
        /*'aria-hidden': true,*/
        text: label
      }));

      // Create textual representation of score/progress
      self.$textualProgress = $('<div>', {
        'class': 'h5p-progress-circle-textual-progress'
      });

      self.$container.append(self.$textualProgress);

      self.$progress = $container.find('.radial-progress');
      self.$fullAndFill = $container.find('.circle .mask.full, .circle .fill');
      self.$fillFix = $container.find('.circle .fill.fix');

      updateUI();
    };

    var updateUI = function () {
      if (currentScore > totalScore) {
        currentScore = totalScore;
      }

      var k = Math.ceil((currentScore/totalScore)*100) * 1.8;

      self.$fullAndFill.css('transform', 'rotate(' + k + 'deg)');
      self.$fillFix.css('transform', 'rotate(' + (k * 2) + 'deg)');
      self.$textualProgress.html(currentScore + '<span class="h5p-progress-circle-textual-progress-divider">/</span>' + totalScore);

      //self.$text.attr('aria-valuenow', currentScore);
    };

  }
  return ProgressWidget;

})(H5P.jQuery);
