/*!
 * jQuery lightweight plugin boilerplate
 * Author: Vince Russell @wvincerussell
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

 // Configurable settings
 // Difficulty Level: {Number}
 // i.e. difficultyLevel: 2
 // The higher the number the faster the moles change
 // Game time limit: {Number}
 // i.e. gameTimeLimit: 60
 // The number of seconds the round will last


;(function ( $, window, document, undefined ) {

    var whackAMole = "whackAMole",
        defaults = {
            counter: '',
            difficultyLevel: 1,
            gameTimeLimit: 60,
            timeLeft: '',
            $currentMole: '',
            score: 0
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.$element = $(element);

        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = whackAMole;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            this.options.moles = $('.mole');
            this.options.scoreBox = $('.score-box');
            this.options.score = 0;
            this.options.timeBox = $('.time-left');
            this.options.impactText = $('.impact-text');
            this.options.clicksText = $('.clicks-text');
            this.options.clicks = 0;
            this.options.gameOverText = $('.game-over-text');
            this.attachEvents().startTimer();
        },

        /**
         * Set up events
         */
        attachEvents: function(){
            var that = this;

            // setup event listener for click on mole event
            this.options.moles.on('click', function(e){
                // run mole clicked event
                that.moleClicked(e);
            });

            // return for chaining of functions to run async
            return this;
        },

        /**
         * Game timer runs for amount of time set in options
         */
        startTimer: function(){
            // set time left for display
            this.options.timeLeft = this.options.gameTimeLimit;

            // start game countdown timer and run update timer once per second
            this.options.timer = setInterval(this.updateTimer, 1000, this);

            // start random mole generator
            this.randomizeMole();
        },

        /**
         * Runs whenever a mole is clicked
         */
        moleClicked: function(event){
            // add to clicks
            this.updateClicks();

            // set current mole
            this.options.$currentMole = $(event.currentTarget);

            // test if mole is active or has been clicked and if not then fail fast
            if(!this.options.$currentMole.hasClass('active') || this.options.$currentMole.hasClass('clicked')){ return; }

            // add hit indicators
            this.indicateHit();

            // update score
            this.updateScore();

            // set clicked class on mole to prevent continuous scoring on same mole
            this.options.$currentMole.addClass('clicked');

        },

        updateClicks: function(){
            // increment counter
            this.options.clicks++;

            // show score in view
            this.options.clicksText.html(this.options.clicks);
        },

        /**
         * Indicate to user that a successful hit on a mole has occurred
         */
        indicateHit: function(){
            // get coordinates of mouse
            var that = this, position = this.options.$currentMole.offset();

            // set position and active class of impact text
            this.options.impactText.addClass('active').css({
                left: Math.round(position.left),
                top: Math.round(position.top)
            });

            // remove impact text after specified time limit
            setTimeout(function () {
                that.options.impactText.removeClass('active');
            }, 300);
        },

        /**
         * Update time left display
         */
        updateTimer: function(that){
            // set timer text to time left
            that.options.timeBox.html(that.options.timeLeft);

            // subtract one from time left
            that.options.timeLeft--;

            // stop timer when timeLeft reaches 0
            if(that.options.timeLeft < 0){
                clearInterval(that.options.timer);
                that.endGame();
            }

        },

        /**
         * Add to score for each successful hit on a mole
         */
        updateScore: function(){
            // increment counter
            this.options.score++;

            // show score in view
            this.options.scoreBox.text(this.options.score);

        },

        /**
         * Function to set a random mole to active
         */
        randomizeMole: function(){
            var that = this;

            this.clearMoles();

            // pick random mole
            var randomMoleNumber = Math.round(Math.random()*9);

            // set random mole class to active
            this.options.moles.eq(randomMoleNumber).addClass('active');

            // pick between 0.5 and 1.5 seconds to let mole stay active
            var randomActiveTime = ((Math.random()*(2/this.options.difficultyLevel))+0.5).toFixed(2);

            // randomize mole based on random amount of time generated
            setTimeout(function () {

                // if game is over don't continue randomizing the moles
                if(that.options.gameOver){return;}

                // if not then set another random mole after the timer runs out
                that.randomizeMole();
            }, randomActiveTime * 1000);
        },

        /**
         * Reset all moles to state before impact
         */
        clearMoles: function(){
            this.options.moles.removeClass('active').removeClass('clicked');
        },

        /**
         * Run end game functions
         */
        endGame: function(){
            // calculate accuracy
            var accuracy = Math.round((this.options.score/this.options.clicks) * 100);

            // if player never clicks
            accuracy = isNaN(accuracy) ? 0 : accuracy;

            // reset all moles
            this.clearMoles();

            // remove event handler from moles
            this.options.moles.off();

            // set gameOver variable to true
            this.options.gameOver = true;

            // show game over text
            this.options.gameOverText.addClass('active').find('.accuracy span').text(accuracy);
        }
    };

    $.fn[whackAMole] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + whackAMole)) {
                $.data(this, "plugin_" + whackAMole,
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

$('.board').whackAMole({
    difficultyLevel: 2,
    gameTimeLimit: 30
});
