/* global jQuery, window */

/**
 * Copyrtight 28/03/2017 
 * Bence Varga <vbence86@gmail.com>
 */

// shims for requestAnimationFrame 
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

// arbitrary closure to freeze the scope of the App components
(function($, window, document) {

  /**
   * Constanst like variables to make the app sightly configurable
   */
  var Constants = {
    TOOLTIP_ON: 'on',
    TOOLTIP_ALL: 'All',
    EVENT_CLICK: 'click',
    EVENT_CHANGE: 'change',
    CONTENT_UPDATE_DELAY_MS: 3000
  };


  // *******************************************************************************
  // ***                              Utility functions                          ***
  // *******************************************************************************

  // Namespace for utility functions
  var Util = Util || {};
  
  /**
   * Immediately returns a first-class object that implements an async loop
   * @return {object} Loop
   * @example 
   * var loop = new Util.Loop({
   *  duration: 3000,
   *  step: function(...) { ... },
   *  complete: function(...) { ... }
   * }) 
   */
  Util.Loop = (function() {

    // reference to any existing loop so that we can reset it
    var raf;

    /**
     * Returns an anonymus object to handle async loops
     * @param {object} config
     * @return {object}
     */
    function Loop(config) {

      var duration = config.duration || 0;
      var timestamp;

      return {
        
        start: function() {
          this.reset();
          timestamp = new Date().getTime();
          raf = requestAnimationFrame(this.update.bind(this));
        },

        update: function update() {
          var current = new Date().getTime();
          var diff = current - timestamp;
          var progress;

          if (diff >= duration) {
            this.stop();
          } else {
            progress = diff / duration;
            config.step(progress);
            raf = requestAnimationFrame(update.bind(this));
          }
        },

        stop: function() {
          config.step(1);
          config.complete();
        },

        reset: function() {
          if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
          }
        }

      };

    };

    return Loop;

  })();   

  /**
   * Triggers an async loop against which custom callbacks can be register
   * @param {object} config 
   * config.duration The duration of the transition in milliseconds
   * config.step Callback that is invoked at every tick
   * config.complete Callback that is invoked when the transition finishes off
   * @return {void}
   */
  Util.transition = function(config) {
    var loop = new Util.Loop(config);
    loop.start();
  }

  /**
   * Immediately returns a first-class object of a self-contained Event listener
   * @return {object}
   * @example 
   * var signal = new Util.Signal();
   * signal.addEventListener('myEvent', function(...) { ... });
   * ...
   * signal.dispatch('myEvent');
   */
  Util.Signal = (function() {

    function Signal() {
      this.events = {};
    }

    Signal.prototype.addEventListener = function(type, listener) {
      if (!this.events[type]) {
        this.events[type] = [];
      }
      this.events[type].push(listener);
      return this;
    };
    
    Signal.prototype.dispatch = function(type, event) {
      if (!this.events[type]) {
        return;
      }
      for (var i in this.events[type]) {
        if (typeof this.events[type][i] === 'function') {
          this.events[type][i](event);
        }
      }
    };

    return Signal;

  })();




  // *******************************************************************************
  // ***                           Presentational Layer                          ***
  // *******************************************************************************

  // namespace for presentational layer
  var View = View || {};

  /**
   * ViewController for an indiviual Tooltip element
   * @param {object} config configuration to dynamically generate the DOM component(s)
   * @return {object}
   * @example 
   * var tooltip = new View.Tooltip({
   *  parent: parentElement,
   *  label: 'myLabel',
   *  selectedByDefault: true
   * });
   */
  View.Tooltip = function(config) {

    var $elm;
    var selected; 
    var signal = new Util.Signal();
    signal.addEventListener(Constants.EVENT_CLICK, config.click);

    function isUnselectingAllTheTooltips() {
      return selected && config.parent.getSelectedTooltips().length === 1;
    }

    return {

      render: function() {
        $elm = $('<div><span>' + this.getLabel() + '</span></div>');
        $elm.click(this.handleClick.bind(this));
        if (config.selectedByDefault) {
          this.select();
        }
        return $elm;
      },

      handleClick: function() {
        // at least one tooltip must be selected
        if (isUnselectingAllTheTooltips()) return;

        if (config.label === Constants.TOOLTIP_ALL) {
          config.parent.unselectAll();
        } else {
          config.parent.unselectByLabel(Constants.TOOLTIP_ALL);
        }
        this.toggle();
        signal.dispatch(Constants.EVENT_CLICK, config.label);
      },

      toggle: function() {
        selected = !selected;
        $elm.toggleClass(Constants.TOOLTIP_ON);
      },

      select: function() {
        selected = true;
        $elm.addClass(Constants.TOOLTIP_ON);
      },

      unselect: function() {
        selected = false;
        $elm.removeClass(Constants.TOOLTIP_ON);
      },

      isSelected: function() {
        return selected;
      },

      getLabel: function() {
        return config.label;
      }

    }

  };

  /**
   * First class object that implements a ViewController for the collection of Tooltip elements
   * @param {object} config configuration to dynamically generate the DOM component(s)
   * @return {object}
   * @example 
   * var toogle = new View.Toolgle();
   * toogle.render({ ... });
   */
  View.Toggle = function() {

    var $elm;
    var tooltips = [];
    var signal = new Util.Signal();

    return {

      render: function(model) {

        $elm = $('<section></section>');
        model.tooltips.reduce(function(container, label) {

          var tooltip = new View.Tooltip({
            parent: this,
            label: label,
            selectedByDefault: label === Constants.TOOLTIP_ALL,
            click: function() {
              signal.dispatch(Constants.EVENT_CHANGE);
            } 
          });

          tooltips.push(tooltip)
          container.append(tooltip.render());
          return container;

        }.bind(this), $elm);

        return $elm;

      },

      unselectByLabel: function(label) {
        tooltips.forEach(function(tooltip) {
          if (tooltip.getLabel() === label) {
            tooltip.unselect();
          }
        });
      },

      unselectAll: function() {
        tooltips.forEach(function(tooltip) {
          tooltip.unselect();
        });
      },

      change: function(callback) {
        signal.addEventListener(Constants.EVENT_CHANGE, callback);
      },

      getSelectedTooltips: function() {
        return tooltips.filter(function(tooltip) {
          return tooltip.isSelected();
        });
      }

    }

  };

  /**
   * First class object that implements a ViewController for the so called YTLikeProgressBar element
   * @return {object}
   * @example 
   * var progressbar = new View.YTLikeProgressBar();
   * progressbar.update(0.34) // 34%
   */
  View.YTLikeProgressBar = function () {

    var $elm;

    return {

      render: function() {
        $elm = $('<section></section>');
        $elm.append($('<figure></figure>'));
        // not visible by default
        $elm.hide();
        return $elm;
      },

      update: function(progress) {
        var percentage = (progress * 100) + '%';
        $elm.find('figure').css({ width: percentage});
      },

      show: function() {
        $elm.show();
      },

      hide: function() {
        $elm.hide();
      }

    }

  };

  /**
   * First class object that implements a ViewController for the Content element that displays the selected Tooltips
   * @return {object}
   * @example 
   * var content = new View.Content();
   * content.updateByToggle(toggle);
   */
  View.Content = function() {

    var $elm;

    return {

      render: function(model) {
        var label = model.content.header;
        $elm = $('<section></section>');
        $elm.append($('<div><h1>' + label + '</h1><h2></h2></div>'));
        return $elm;
      },

      update: function(text) {
        $elm.find('h2').text(text);
      },

      updateByToggle: function(toggleView) {
        var text = toggleView.getSelectedTooltips()
          .map(function(tooltip) {
            return tooltip.getLabel();
          })
          .join(', ');
        this.update(text);
      }

    }

  };

  /**
   * First class object that implements a ViewController for the whole Application
   * it is responsible for generating components that participate in the rendering chain
   * and attaching them to the given root DOM element.
   * @return {object}
   * @example 
   * var appView = new View.App();
   * appView.render(document.body, { ... })
   */
  View.App = function() {
    
    return {
      
      render: function(root, model) {

        var contentView = new View.Content();
        var toggleView = new View.Toggle();
        var progressBarView = new View.YTLikeProgressBar();
        
        toggleView.change(function() {
          
          progressBarView.show();

          Util.transition({
            duration: Constants.CONTENT_UPDATE_DELAY_MS,
            step: function(progress) {
              progressBarView.update(progress);
            },
            complete: function() {
              progressBarView.hide();
              contentView.updateByToggle(toggleView);
            }
          });

        });

        $(root)
          .append(toggleView.render(model))
          .append(progressBarView.render(model))
          .append(contentView.render(model));

        contentView.updateByToggle(toggleView);

      },

    };

  };



  // *******************************************************************************
  // ***                             Controllers                                 ***
  // *******************************************************************************

  /**
   * Immediately invoked function that returns a first class object that is a bridge
   * between the presentational layer and model layer.
   * @return {object} 
   */
  var Orchestrator = (function() {
    
    return {
      run: function(config) {

        if (!config) throw 'Invalid was given configuration to start the application!';

        var root = config.root || document.body;
        var store = config.store;

        var view = new View.App();
        view.render(root, store);

      }
    }

  })();



  // *******************************************************************************
  // ***                               App                                       ***
  // *******************************************************************************

  /**
   * Immediately invoked function that returns an object that is sort of an 
   * Entry point to the application
   * @return {object}
   * @example 
   * App.run();
   */
  var App = (function() {
    
    function getTooltips() {
      var fixedTooltips = [Constants.TOOLTIP_ALL];
      var dynamicTooltips = getTooltipsFromURLHash() || getDefaultTooltips();
      return fixedTooltips.concat(dynamicTooltips);
    }

    function getTooltipsFromURLHash() {
      var tooltips;
      if (window.location.hash && typeof window.location.hash.split === 'function') {
        tooltips = window.location.hash.substring(1).split('|');
        if (tooltips.length < 3) return false;
        return tooltips;
      }
      return false;
    }

    function getDefaultTooltips() {
      return ['Opt1', 'Opt2', 'Opt3'];
    }

    function getRoot() {
      return document.querySelector('#root');
    }

    // the main data model of the application inspired by redux approach
    function getStore() {
      return {
        tooltips: getTooltips(),
        content: {
          header: 'Currently selected:'
        }
      };
    }

    return {

      run: function() {

        var root = getRoot();
        var store = getStore();
        
        Orchestrator.run({
          root: root,
          store: store
        });

      }
    }  

  })();

  // Starts the application once the pageload event is triggered 
  window.addEventListener('load', App.run);

})(jQuery, window, document);
