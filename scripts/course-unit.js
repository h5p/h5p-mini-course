H5P.MiniCourse.CourseUnit = (function ($, EventDispatcher) {

  function HeaderButton(dictionary) {
    var self = this;
    var state = 'skip';

    EventDispatcher.call(self);

    // Create dom element
    var $action = $('<a>', {
      'class': 'header-button skip-lesson',
      'text': dictionary.skipLabel,
      click: function () {
        self.trigger(state);
      }
    });

    self.getDomElement = function () {
      return $action;
    };

    self.setState = function (newState) {
      state = newState;
      $action.toggleClass('h5p-joubelui-button continue', state === 'continue')
             .toggleClass('skip-lesson', state === 'skip')
             .text(state === 'skip' ? dictionary.skipLabel : dictionary.continueLabel);
    };

    self.skip = function () {
      self.setState('skip');
    };

    self.continue = function () {
      self.setState('continue');
    };
  }

  // Inheritance
  HeaderButton.prototype = Object.create(EventDispatcher.prototype);
  HeaderButton.prototype.constructor = HeaderButton;

  function UnitHeader(maxScore, dictionary) {
    var self = this;
    // States: ready, completed
    var hasScore = !!maxScore;

    var $element = $('<div>', {
      'class': 'h5p-mini-course-unit-header'
    });

    var $label = $('<div>', {
      'class': 'h5p-mini-course-unit-header-label'
    }).appendTo($element);

    var $value = $('<div>', {
      'class': 'h5p-mini-course-unit-header-value'
    }).appendTo($element);

    self.getDomElement = function () {
      return $element;
    }

    self.setState = function (state, score) {
      $label.text(hasScore ? (state === 'ready' ? dictionary.maxScoreLabel : dictionary.youGotLabel) : dictionary.infoLessonLabel);
      $value.text(hasScore ? (state === 'ready' ? maxScore + ' points' : score + ' of ' + maxScore + ' points') : dictionary.infoLessonValue);
    }

    // Initial setups
    self.setState('ready');
  }

  function CourseUnit(options, contentId, index, dictionary) {
    var self = this;
    EventDispatcher.call(self);

    var instance;
    var enabled = false;

    var libraryMeta = H5P.libraryFromString(options.action.library);
    var machineName = libraryMeta.machineName.toLowerCase().replace('.', '-');

    self.appendTo = function ($container) {
      $unitPanel.appendTo($container);
    };

    self.hasScore = function () {
      console.log(options.maxScore);
      return (options.maxScore !== 0);
    };

    self.getMaxScore = function () {
      return options.maxScore ? options.maxScore : 0;
    };

    self.enable = function () {
      enabled = true;
      $unitPanel.removeClass('locked').addClass('enabled');
      $beginButton.html(dictionary.lessonStartLabel).removeAttr('disabled').attr('data-state', 'ready');

      setTimeout(function () {
        $beginButton.focus();
      },1);
    };

    self.show = function () {
      if (!enabled) {
        return;
      }

      if (instance === undefined) {
        instance = H5P.newRunnable(options.action, contentId);

        instance.on('xAPI', function (event) {
          var stmt = event.data.statement;
          var isParent = (stmt.context.contextActivities.parent === undefined);

          if (isParent && stmt.result !== undefined && stmt.result.completion === true) {
            self.score = event.getScore();
            self.headerButton.continue();
          }
        });


        var $h5pContent = $('<div>', {
          'class': 'h5p-sub-content'
        });

        instance.attach($h5pContent);

        self.headerButton = new HeaderButton(dictionary);
        if (!self.hasScore()) {
          self.headerButton.continue();
        }

        var $header = $('<div>', {
          'class': 'header',
          text: options.header,
          append: self.headerButton.getDomElement()
        });

        //$unitPopup.prepend($header);
        //$


        self.headerButton.on('skip', function (event) {
          var confirmDialog = new H5P.ConfirmationDialog({headerText: 'Are you sure?', dialogText: 'If quiting this lesson, no score will be given.'});
          confirmDialog.appendTo($unitPopup.get(0));
          confirmDialog.on('confirmed', function () {
            self.hide();
          });
          confirmDialog.show();
        });

        self.headerButton.on('continue', function (event) {
            self.hide(self.score);
        });

        /*$unitPopup.find('.quit-lesson').click(function () {
          if (self.hasScore()) {
            var confirmDialog = new H5P.ConfirmationDialog({headerText: 'Are you sure?', dialogText: 'If quiting this lesson, no score will be given.'});
            confirmDialog.appendTo($unitPopup.get(0));
            confirmDialog.on('confirmed', function () {
              self.hide();
            });
            confirmDialog.show();
          }
          else {
            self.hide();
          }
        });*/
      }

      // Attach popup to body:
      //$('body').append($unitPopupBg);
      //$popupContainer.append($unitPopupBg);

      // Hide if ESC is pressed
      /*$('body').on('keyup.h5p-escape', function (event) {
        if (event.keyCode == 27) {
          $unitPopup.find('.quit-lesson').click();
        }
      });*/

      /*setTimeout(function () {
        $unitPopup.addClass('visible');
      }, 200);*/

      self.trigger('open-popup', {
        popupContent: [
          $header,
          $h5pContent
        ],
        index: index
      });
      instance.on('resize', function () {
        self.trigger('resize');
      });
      instance.trigger('resize');
      self.trigger('resize');
    };

    self.setWidth = function (width) {
      $unitPanel.css({width: width + '%'});
    };

    self.hide = function (score) {
      $('body').off('keyup.h5p-escape');

      self.trigger('closing-popup');

      // Set score in unit-header
      unitHeader.setState('completed', score);

      setTimeout(function () {
        self.trigger('finished', {index: index, score: score, maxScore: self.getMaxScore()});
      }, 1000);
    };

    self.done = function () {
      $beginButton.html(dictionary.lessonCompletedLabel).attr('disabled', 'disabled');
      $unitPanel.removeClass('enabled').addClass('done');
    };

    self.reset = function () {
      if (instance && instance.resetTask) {
        instance.resetTask();
      }
      $beginButton.html(dictionary.lessonLockedLabel);
      self.headerButton.skip();
      $unitPanel.removeClass('done').addClass('locked');
    };

    /*var $unitPopup = $('<div>', {
      'class': 'h5p-mini-course-popup ' + machineName
    });*/

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-unit-panel locked'
    });

    var $unitPanelInner = $('<div>', {
      'class': 'h5p-mini-course-unit-panel-inner ' + machineName,
      tabIndex: 0
    }).appendTo($unitPanel);

    var unitHeader = new UnitHeader(self.getMaxScore(), dictionary);
    unitHeader.getDomElement().appendTo($unitPanelInner);

    $('<div>', {
      'class': 'h5p-mini-course-unit-title',
      html: options.header
    }).appendTo($unitPanelInner);

    var $unitIntro = $('<div>', {
      'class': 'h5p-mini-course-unit-intro',
      html: options.intro
    }).appendTo($unitPanelInner);

    var $beginButton = $('<button>', {
      'class': 'h5p-mini-course-unit-begin',
      html: dictionary.lessonLockedLabel,
      disabled: 'disabled',
      click: function () {
        self.show();
      }
    }).appendTo($unitPanelInner);
  }

  // Inheritance
  CourseUnit.prototype = Object.create(EventDispatcher.prototype);
  CourseUnit.prototype.constructor = CourseUnit;

  return CourseUnit;

})(H5P.jQuery, H5P.EventDispatcher);
