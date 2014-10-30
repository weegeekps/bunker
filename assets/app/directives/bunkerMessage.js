/* global app, _ */

app.directive('bunkerMessage', function ($compile, emoticons) {
	'use strict';

	function replaceAll(str, find, replace) {
		return str.split(find).join(replace);
	}

	//function extractVideoID(url){
	//	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
	//	var match = url.match(regExp);
	//	if ( match && match[7].length == 11 ){
	//		return match[7];
	//	}else{
	//		alert("Could not extract video ID.");
	//	}
	//}

	return {
		template: '<span ng-bind-html="formatted"></span>',
		scope: {
			text: '@bunkerMessage'
		},
		link: function (scope, elem) {
			scope.$watch('text', function (text) {
				var formatted = text,
					replacedEmotes = {},
					replacedLinks = {};

				// Parse bold
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(\*[A-Za-z0-9\s]+\*)(?:[^A-Za-z0-9]|$)/g), function (bold) {
					formatted = replaceAll(formatted, bold, '<strong>' + bold.replace(/\*/g, '') + '</strong>');
				});

				// Parse italics
				_.each(text.match(/(?:[^A-Za-z0-9]|^)(_[A-Za-z0-9\s]+_)(?:[^A-Za-z0-9]|$)/g), function (italics) {
					formatted = replaceAll(formatted, italics, '<em>' + italics.replace(/_/g, '') + '</em>');
				});

				// Parse emoticons
				_.each(text.match(/:\w+:/g), function (emoticonText) {
					var knownEmoticon = _.find(emoticons.files, function (known) {
						return new RegExp(known.replace(/\.\w{1,4}$/, '') + '$', 'i').test(emoticonText.replace(/:/g, ''));
					});
					if (knownEmoticon && !replacedEmotes[knownEmoticon]) {
						formatted = replaceAll(formatted, emoticonText,
								'<img class="emoticon" title="' + emoticonText + '" src="/assets/images/emoticons/' + knownEmoticon + '"/>');
						replacedEmotes[knownEmoticon] = true;
					}
				});

				// Parse links
				var attachedMedia;
				_.each(text.match(/https?:\/\/\S+/gi), function (link) {
					if (/\.(gif|png|jpg|jpeg)$/i.test(link) && !attachedMedia) {
						// Image link
						attachedMedia = angular.element('<div bunker-media="' + link + '"><img src="'+link+'"/></div>');
					}

					if (/(www\.youtube\.com|youtu\.?be)/i.test(link)){
						//var videoId = extractVideoID(link);
						attachedMedia = angular.element('' +
						'<div bunker-media="' + link + '">' +
						'<youtube-video video-url="\''+ link + '\'"></youtube-video>' +
						'</div>');
					}

					if (!replacedLinks[link]) {
						formatted = replaceAll(formatted, link, '<a href="' + link + '" target="_blank">' + link + '</a>');
						replacedLinks[link] = true;
					}
				});

				// If we made an image, attach it now
				if (attachedMedia) {
					angular.element(elem).append(attachedMedia);
					$compile(attachedMedia)(scope.$new());
				}

				scope.formatted = formatted;
			});
		}
	};
});
