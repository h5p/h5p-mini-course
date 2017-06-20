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

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-units'
    });

    var courseUnits = [];
    var results = [];
    var popup;
    // Create course units
    var i=0;

    // TODO do this in a function
    options.units.forEach(function (unit) {

      // TODO - Avoid this index thing - this is a symptom that something is wrong!
      // Will also work bad when course units make be taken in a non-linear order
      var courseUnit = new H5P.MiniCourse.CourseUnit(unit, contentId, i, options.dictionary);
      i++;
      maxScore += courseUnit.getMaxScore();
      courseUnit.appendTo($unitPanel);
      courseUnits.push(courseUnit);

      console.log(options);
      if (options.behaviour.forceSequential === false) {
        courseUnit.enable();
      }

      // TODO - handle this in a function
      courseUnit.on('finished', function (event) {

        self.$container.css('min-height', '');
        self.trigger('resize');

        //$popupBg.removeClass('visible');
        //$popupBg.detach();

        courseUnit.done();
        progress.increment();
        if (event.data.score) {
          score.increment(event.data.score);
        }

        // Save the score
        results[event.data.index] = {
          title: unit.header,
          score: event.data.score,
          maxScore: event.data.score
        };

        if (event.data.index + 1 < courseUnits.length) {
          courseUnits[event.data.index + 1].enable();
        }
        else {
          showSummary();
        }
      });

      courseUnit.on('open-popup', function (event) {
        showPopup(event.data.popupContent);

        var progressedEvent = self.createXAPIEventTemplate('progressed');
        progressedEvent.data.statement.object.definition.extensions['http://id.tincanapi.com/extension/ending-point'] = event.data.index + 1;
        self.trigger(progressedEvent);
      });

      courseUnit.on('closing-popup', function (event) {
        //$popupBg.removeClass('visible');
        popup.hide();
      });
    });

    var $results = $('<div>', {
      'class': 'h5p-mini-course-results'
    });

    // Add minimize fullscreen icon:
    $results.append($('<span>', {
      'class': 'h5p-mini-course-exit-fullscreen',
      click: function () {
        H5P.exitFullScreen();
      }
    }));

    var maxScoreWidget = new H5P.MiniCourse.MaxScoreWidget(maxScore, options.dictionary);
    maxScoreWidget.getElement().appendTo($results);

    var $scorePanel = $('<div>', {
      'class': 'h5p-mini-course-score h5p-mini-course-result-panel'
    }).appendTo($results);

    var $progressPanel = $('<div>', {
      'class': 'h5p-mini-course-progress h5p-mini-course-result-panel'
    }).appendTo($results);

    var score = new H5P.MiniCourse.ProgressCircle(maxScore, 'Your Score', false);
    var progress = new H5P.MiniCourse.ProgressCircle(options.units.length, 'Lessons Completed', true);

    var currentPlacement;
    var placementExceptions = {};
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

    self.reset = function () {
      progress.reset();
      score.reset();

      // Reset all units
      courseUnits.forEach(function (unit) {
        unit.reset();
      })

      // Enable first unit:
      courseUnits[0].enable();

      //$endScreen.removeClass('visible');
      setTimeout(function () {
        $unitPanel.removeClass('finished');
      }, 600);
    };


    var showPopup = function ($elements, extraClass) {
      popup.show($elements, extraClass);
      /*$popupBg.append($content).appendTo(self.$container);
      setTimeout(function () {
        $popupBg.addClass('visible');
      }, 200);*/
    };

    var showSummary = function () {
      // Create summary page:
      for (var i = 0; i < 50; i++) {
        results[i] = {
          title: 'tittel',
          score: 10,
          maxScore: 20
        };
      }
      var summary = new H5P.MiniCourse.Summary(score.getScore(), maxScore, results);
      var $summaryElement = summary.getElement();

      summary.on('retry', function (event) {
        popup.hide();
        $summaryElement.detach();
        self.reset();
      });

      showPopup([$summaryElement], 'summary');
    };

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

      // If popup is showing

      // self.$container.css('min-height', '600px');

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

    /**
     * Attach to container
     * @param  {[type]} $container [description]
     * @return {[type]}
     */
    self.attach = function ($container) {
      self.$container = $container;
      popup = new H5P.MiniCourse.Popup(1, self.$container); // TODO - use options

      // Something strange about the order here:
      score.appendTo($scorePanel);
      progress.appendTo($progressPanel);

      $results.appendTo($container);

      courseUnits[0].enable();
      $unitPanel.appendTo($container);
      $fullscreenOverlay.appendTo($container);

      updateFullScreenButtonVisibility();
    };
  }
  return MiniCourse;
})(H5P.jQuery);
