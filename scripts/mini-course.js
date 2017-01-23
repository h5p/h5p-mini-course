H5P.MiniCourse = (function ($) {
  /**
   * @constructor
   * @extends Question
   * @param {object} options Options for single choice set
   * @param {string} contentId H5P instance id
   * @param {Object} contentData H5P instance data
   */
  function MiniCourse(options, contentId, contentData) {
    var self = this;

    var fullscreen = false;
    var maxScore = 0;

    console.log(options);

    var $results = $('<div>', {
      'class': 'h5p-mini-course-results'
    });

    var $progressPanel = $('<div>', {
      'class': 'h5p-mini-course-progress'
    }).appendTo($results);

    var $scorePanel = $('<div>', {
      'class': 'h5p-mini-course-score'
    }).appendTo($results);

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units'
    });

    var courseUnits = [];
    // Create course units
    var i=0;
    options.units.forEach(function (unit) {

      var courseUnit = new H5P.MiniCourse.CourseUnit(unit, contentId, i, self.$container);
      i++;
      maxScore += courseUnit.getMaxScore();

      courseUnit.appendTo($unitPanel);
      courseUnits.push(courseUnit);

      courseUnit.on('finished', function (event) {

        $popupBg.removeClass('visible');
        $popupBg.detach();

        courseUnit.done();
        progress.increment();
        if (event.data.score) {
          score.increment(event.data.score);
        }

        if (event.data.index + 1 < courseUnits.length) {
          courseUnits[event.data.index + 1].enable();
        }
        else {
          $unitPanel.parent().append($endScreen);

          $unitPanel.addClass('finished');

          setTimeout(function () {
            $endScreen.addClass('visible');
          }, 300);
          // finished !!
          // Do something cool!
        }
      });

      courseUnit.on('open-popup', function (event) {
        console.log('JALLA', event);
        $popupBg.append(event.data.popup).appendTo(fullscreen ? self.$container : $('body'));

        setTimeout(function () {
          $popupBg.addClass('visible');
        }, 200)
      });

      courseUnit.on('closing-popup', function (event) {
        $popupBg.removeClass('visible');
      });
    });

    var progress = new H5P.MiniCourse.ProgressCircle(options.units.length, 'Progress', options.theme.fontColorResults, options.theme.progressCircleDefaultColor, options.theme.progressCircleActiveColor);
    var score = new H5P.MiniCourse.ProgressCircle(maxScore, 'Score', options.theme.fontColorResults, options.theme.progressCircleDefaultColor, options.theme.progressCircleActiveColor);
    var currentPlacement;
    var placementExceptions = {}
    if (options.layout.resultsPlacement.exceptions) {
      options.layout.resultsPlacement.exceptions.forEach(function (exception) {
        placementExceptions[exception.columns] = exception.placement;
      });
    }

    self.on('enterFullScreen', function () {
      fullscreen = true;
    });

    // Respond to exit full screen event
    self.on('exitFullScreen', function () {
      fullscreen = false;
    });



    var $fullscreenOverlay = $('<div>', {
      'class': 'h5p-mini-course-overlay',
      html: '<div class="h5p-mini-course-go-fullscreen">Open mini course</div>',
      click: function () {
        H5P.semiFullScreen(self.$container, self, function () {
          $fullscreenOverlay.removeClass('hide');
        });
        $fullscreenOverlay.addClass('hide');
      }
    });

    var $endScreen = $('<div>', {
      'class': 'h5p-mini-course-endscreen',
      'html': 'Mini course finished, wanna try once more?'
    }).append(H5P.JoubelUI.createButton({
      'class': 'h5p-mini-course-unit-restart',
      html:  'Try again', // TODO - translate
      click: function () {
        self.reset();
      }
    }));

    var $popupBg = $('<div>', {
      'class': 'h5p-mini-course-unit-popup-bg',
      zIndex: options.layout.popupZIndex
    });

    self.reset = function () {

      progress.reset();
      score.reset();


      // Reset all units
      courseUnits.forEach(function (unit) {
        unit.reset();
      })

      // Enable first unit:
      courseUnits[0].enable();

      $endScreen.removeClass('visible');
      setTimeout(function () {
        $unitPanel.removeClass('finished');
      }, 600);
    };

  /*  var injectStyleTag = function () {

      H5P.MiniCourse.Theme.generate(self.getLibraryFilePath('styles/theme-template.css'), options.theme.theme, undefined, contentId, function (css) {
        self.$container.append(
          '<style>' +
          css +
          options.theme.css +
          '</style>'
        );
      })
    };*/

    var updateFullScreenButtonVisibility = function () {
      // If already in full screen, do nothing
      if (fullscreen) {
        return;
      }

      var forceFullscreen = false;
      if (options.layout.fullScreen.fullScreenMode === 'always') {
        forceFullscreen = true;
      }
      else if (options.layout.fullScreen.fullScreenMode === 'dynamic') {
        forceFullscreen = (self.$container.width() < options.layout.fullScreen.forceFullScreenWidthThreshold);
      }

      self.$container.toggleClass('h5p-mini-course-force-fullscreen', forceFullscreen);
    };

    self.resize = function () {

      // If results widget is on top, we need to place it on right side to check
      // how many columns there will be
      $results.css('min-height', '');
      updateResultsPlacement(options.layout.resultsPlacement.default);

      var width = Math.floor($unitPanel.innerWidth());
      var columns = Math.floor(width / options.layout.minimumWidth);
      columns = (columns === 0 ? 1 : columns);

      // If more place, and single row, fill it up
      if (columns > courseUnits.length) {
        columns = courseUnits.length;
      }

      var columnsWidth = Math.floor(100 / columns);

      // iterate course units:
      var widestUnit = 0;
      courseUnits.forEach(function (unit) {
        unit.setWidth(columnsWidth);
      });

      updateResultsPlacement(placementExceptions[columns] ? placementExceptions[columns] : options.layout.resultsPlacement.default)

      if (currentPlacement === 'right' || currentPlacement === 'left') {
        $results.css('min-height', $results.parent().height() + 'px');
      }

      updateFullScreenButtonVisibility();
    };
    self.on('resize', self.resize);

    function updateResultsPlacement(placement) {
      if (currentPlacement) {
        self.$container.removeClass('results-placement-' + currentPlacement);
      }
      self.$container.addClass('results-placement-' + placement);
      currentPlacement = placement;
    }

    self.attach = function ($container) {
      self.$container = $container;

      progress.appendTo($progressPanel);
      score.appendTo($scorePanel);

      $results.appendTo($container);

      //injectStyleTag();


      courseUnits[0].enable();
      $unitPanel.appendTo($container);
      $fullscreenOverlay.appendTo($container);

      updateFullScreenButtonVisibility();
    };
  }
  return MiniCourse;
})(H5P.jQuery);
