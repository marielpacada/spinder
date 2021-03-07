var Cookies = {
	set: function (name, value, options) {
		var data = [encodeURIComponent(name) + '=' + encodeURIComponent(value)];
		if (options) {
			if ('expiry' in options) {
				if (typeof options.expiry == 'number') {
					options.expiry = new Date(options.expiry * 1000 + +new Date);
				}
				data.push('expires=' + options.expiry.toGMTString());
			}
			if ('domain' in options) data.push('domain=' + options.domain);
			if ('path' in options) data.push('path=' + options.path);
			if ('secure' in options && options.secure) data.push('secure');
		}
		document.cookie = data.join('; ');

	},
	get: function (name, keepDuplicates) {
		var values = [];
		var cookies = document.cookie.split(/; */);
		for (var i = 0; i < cookies.length; i++) {
			var details = cookies[i].split('=');
			if (details[0] == encodeURIComponent(name)) {
				values.push(decodeURIComponent(details[1].replace(/\+/g, '%20')));
			}
		}
		return (keepDuplicates ? values : values[0]);
	},
	clear: function (name, options) {
		if (!options) options = {};
		options.expiry = -86400;
		this.set(name, '', options);
	}
};

$(function () {
    var likes = [];
    var animating = false;
    var cardsCounter = 0;
    var numOfCards = 6;
    var decisionVal = 80;
    var pullDeltaX = 0;
    var deg = 0;
    var $card, $cardReject, $cardLike;

    function pullChange() {
        animating = true;
        deg = pullDeltaX / 10;
        $card.css("transform", "translateX(" + pullDeltaX + "px) rotate(" + deg + "deg)");

        var opacity = pullDeltaX / 100;
        var rejectOpacity = (opacity >= 0) ? 0 : Math.abs(opacity);
        var likeOpacity = (opacity <= 0) ? 0 : opacity;
        $cardReject.css("opacity", rejectOpacity);
        $cardLike.css("opacity", likeOpacity);
    };

    function release() {
        if (pullDeltaX >= decisionVal) {
            $card.addClass("to-right");
            likes.push($card.attr("id"));
        } else if (pullDeltaX <= -decisionVal) {
            $card.addClass("to-left");
        }

        if (Math.abs(pullDeltaX) >= decisionVal) {
            $card.addClass("inactive");

            setTimeout(function () {
                $card.addClass("done");
                cardsCounter++;
                if (cardsCounter === numOfCards) {
                    cardsCounter = 0;
                    $(".artist-card").removeClass("below");
                }
            }, 300);
        }

        if (Math.abs(pullDeltaX) < decisionVal) {
            $card.addClass("reset");
        }

        setTimeout(function () {
            $card.attr("style", "").removeClass("reset")
                .find(".card-choice").attr("style", "");

            pullDeltaX = 0;
            animating = false;
        }, 300);
    };

    $(document).on("mousedown touchstart", ".artist-card:not(.inactive)", function (e) {
        if (animating) return;

        $card = $(this); // current card
        $cardReject = $(".card-choice.reject", $card);
        $cardLike = $(".card-choice.like", $card);
        var startX = e.pageX || e.originalEvent.touches[0].pageX;

        $(document).on("mousemove touchmove", function (e) {
            var x = e.pageX || e.originalEvent.touches[0].pageX;
            pullDeltaX = (x - startX);
            if (!pullDeltaX) return;
            pullChange();
        });

        $(document).on("mouseup touchend", function () {
            $(document).off("mousemove touchmove mouseup touchend");
            if (!pullDeltaX) return; // prevents from rapid click events
            release();
            if ($card.hasClass("last-card")) {
                Cookies.set("likes", likes);
            }
        });
    });
});

// when the button to go to playlists is active, then send the array of artists or songs to server???????
// set a cookie? of the array but also a boolean saying all the 50 has been swiped through

