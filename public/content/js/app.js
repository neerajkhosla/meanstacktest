if (!window.console) console = { log: function () { } };
var shift = {
    mainMenu: {
        show: function () {
            shift.screen.stop();//stop current screen                
            if (typeof $.mainMenu == 'undefined') delete $.mainMenu;
            $("#viewport").html('<div id="content"></div>');
            $.getCSS('css/mainmenu.css', function () {
                $("#content").load('views/mainmenu.html', function () {
                    //  $("#viewport").show();
                    $('.topic').find('a').click(); $("#mydiv").hide(); // Click on the link to execute the P0.html file directly
                });
            });
        },
        getUnitStatus: function (u) {
            return shift.trackers.current.getUnitStatus(u);
        },
        getTopicStatus: function (u, t) {
            return shift.trackers.current.getTopicStatus(u, t);
        }
    },
    screen: {
        isIOS: navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false,
        isAndroid: navigator.userAgent.match(/(Android)/i) ? true : false,
        isTest: function () { return shift.screen.getParamBool('istest', false) },
        show: function (uIndex, tIndex, sIndex) {
            shift.screen.stop();//stop current screen
            //set parent attributes
            window.parent.currLPath = parseInt(uIndex) + 1;
            window.parent.currLObject = parseInt(tIndex) + 1;
            window.parent.currLPoint = parseInt(sIndex) + 1;
            window.parent.currScreenQuantity = shift.course.unit[uIndex].topic[tIndex].screen.length;

            if (shift.screen.isIOS === true) {
                shift.screen.resetAudio();
            }
            var isFirstScreen = false;
            if ($(".toolbar", "#viewport").length == 0) {
                $("#viewport").hide();
                shift.screen.unbindPreviousEvents();
                shift.screen.unbindPreviousCss();
                $.getCSS('css/screenheader.css');
                $.getCSS('css/screenfooter.css');
                $("#viewport").html(shift.screen.header + '<div id="screen"><div id="content" class="ajax-loader"></div></div>' + shift.screen.footer);
                isFirstScreen = true;
            }
            else {
                $(".toolbar-button").unbind('click').unbind('keypress');//unbind toolbar buttons
                shift.screen.unbindPreviousEvents();
                $("#content").empty();
                $('#content').addClass('ajax-loader');
                $("#screen-css-container").empty();
            }
            if (isFirstScreen) {
                if (shift.trackers.current.getUnitStatus(uIndex) != '2') {
                    shift.trackers.current.setUnitStatus(uIndex, '1');
                }
                if (shift.trackers.current.getTopicStatus(uIndex, tIndex) != '2') {
                    shift.trackers.current.setTopicStatus(uIndex, tIndex, '1');
                }
            }
            if (sIndex == shift.course.unit[uIndex].topic[tIndex].screen.length - 1) {
                shift.trackers.current.setTopicStatus(uIndex, tIndex, '2');
                shift.trackers.current.commit();
            }
            $('html, body').scrollTop(0);
            shift.screen.resizeContent();
            shift.screen.removeAnimation();
            var s = shift.course.unit[uIndex].topic[tIndex].screen[sIndex];
            shift.screen.path = { uIndex: uIndex, tIndex: tIndex, sIndex: sIndex }; //store the current creen path
            $(".button-go-forward").attr("src", "img/toolbar/rightarrow.png");
            $('#screen-css-container').append('<style type="text/css" media="screen"></style>');
            $('style', '#screen-css-container').load('css/p' + s.type + '.css?_=' + new Date().getTime(), function () {
                if (isFirstScreen) $('#viewport').show();
                $('body').removeAttr('style');
                $.getJSON('data/' + s.id + '.json', { '_': new Date().getTime() }, function (data) {
                    shift.screen.rawdata = data;
                    shift.screen.name = shift.screen.rawdata.name;
                    //hide navigation controls if screen is a Test
                    if (shift.screen.isTest()) {
                        $('.button-go-menu, .button-go-back').hide();
                        $('.button-go-forward').addClass('is-test');
                    }
                    else {
                        $('.button-go-menu, .button-go-back').show();
                        $('.button-go-forward').removeClass('is-test');
                    }
                    //$('#course-name').text(shift.course.name);                                 
                    shift.screen.status = shift.screenStatus.incomplete;
                    var currentScreen = sIndex + 1;
                    $('#pointer').html(currentScreen + ' / ' + shift.course.unit[uIndex].topic[tIndex].screen.length);
                    $("#content").load('views/p' + s.type + '.html', function () {
                        //UI functions
                        $('.content-clear-both', '#content').remove();
                        $('#content').append('<div class="content-clear-both"></div>');
                        $('#content').removeClass('ajax-loader');
                        $('body').removeAttr('style');
                        shift.screen.attachToolbarBehavior();
                        shift.screen.resizeContent();
                    });
                    if (!shift.screen.isTest()) shift.trackers.current.setBookmark();
                }).error(function () { console.log("Error loading screen data.") });
            });
        },
        showNext: function (uIndex, tIndex, sIndex) {
            var quantity = shift.course.unit[uIndex].topic[tIndex].screen.length;
            if (quantity > 0 && sIndex < quantity - 1) {
                shift.screen.show(uIndex, tIndex, sIndex + 1);
            }
            else {
                shift.screen.reportScoreToTracker(function () { shift.mainMenu.show(); });
            }
        },
        showPrevious: function (uIndex, tIndex, sIndex) {
            var quantity = shift.course.unit[uIndex].topic[tIndex].screen.length;
            if (quantity > 0 && sIndex > 0) {
                shift.screen.show(uIndex, tIndex, sIndex - 1);
            }
            else shift.mainMenu.show();
        },
        resizeContent: function () {
            var difference = $('#screen-footer').is(':visible') ? 157 : 100;//show toolbar when possible
            $("#content").css('min-height', $(window).height() - difference);
        },
        attachToolbarBehavior: function () {
            $(".button-glossary").click(function () {
                window.open("glossary.htm", "vglos", "channelmode=no,directories=no,fullscreen=no,height=600,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,width=800");
            });
            $('.button-toggle-audio').click(function () {
                shift.screen.pause();
            });
            $('.button-print').click(function () {
                print();
            });
        },
        attachNavigationBehavior: function (path, bindForward) { //bindForward is false by default
            if (!shift.screen.pathEqualTo(path)) return; //prevent calls from other screens
            bindForward = bindForward === true;
            var _isTest = shift.screen.isTest();
            if (!_isTest || bindForward) {
                $('.button-go-forward').click(function () {
                    shift.screen.showNext(path.uIndex, path.tIndex, path.sIndex);
                }).keypress(function (e) {
                    if (e.keyCode == 13)
                        shift.screen.showNext(path.uIndex, path.tIndex, path.sIndex);
                });
            }
            if (!_isTest) {
                $('.button-go-menu').click(function () {
                    shift.mainMenu.show();
                });
                $('.button-go-back').click(function () {
                    shift.screen.showPrevious(path.uIndex, path.tIndex, path.sIndex);
                });
            }
        },
        play: function () { },
        loaded: function (screenPath) {
            shift.screen.attachNavigationBehavior(screenPath);
            shift.screen.resizeContent();
        },
        path: { uIndex: 0, tIndex: 0, sIndex: 0 }, //store the current screen path (uIndex, tIndex, sIndex)
        pathEqualTo: function (path) {
            return shift.screen.path.uIndex == path.uIndex &&
                shift.screen.path.tIndex == path.tIndex &&
                shift.screen.path.sIndex == path.sIndex;
        },
        end: function (path) {
            if (shift.screen.pathEqualTo(path) && shift.screen.status != shift.screenStatus.completed) {
                shift.screen.status = shift.screenStatus.completed;
                var _screen = shift.course.unit[path.uIndex].topic[path.tIndex].screen[path.sIndex];
                if (shift.screen.isTest() && typeof (_screen.score) == 'undefined') {
                    shift.screen.attachNavigationBehavior(path, true);
                }
                shift.screen.blinkForwardButton(path);
            }
        },
        pause: function () {
            if (shift.screen.status != shift.screenStatus.completed) {
                if (shift.screen.status != shift.screenStatus.paused) {
                    shift.screen.status = shift.screenStatus.paused;
                } else {
                    shift.screen.status = shift.screenStatus.incomplete;
                }
                if (shift.screen.status == shift.screenStatus.paused) {
                    shift.screen.toggleAudioButton(shift.screen.audioStatus.play);
                    shift.screen.currentAudio().pause();
                    console.log('pause audio');
                } else {
                    shift.screen.toggleAudioButton(shift.screen.audioStatus.pause);
                    shift.screen.currentAudio().play();
                    console.log('play audio');
                }
            }
            else {
                shift.screen.toggleAudioButton(shift.screen.audioStatus.play);
                shift.screen.currentAudio().pause();
            }
        },
        toggleAudioButton: function (toStatus) {
            var button = $('.button-toggle-audio');
            if (button.length > 0) {
                if (shift.screen.status != shift.screenStatus.completed)
                    button.attr('src', 'img/toolbar/audio' + toStatus + '.png');
                else button.attr('src', 'img/toolbar/audioplay.png');
                console.log(button.attr('src'));
            }
        },
        audioStatus: { pause: 'pause', play: 'play' },
        resetAudio: function () {
            var audio = shift.screen.currentAudio();
            audio.removeEventListener("ended", arguments.callee, false);
            if (audio.canPlayType('audio/mpeg'))
                audio.src = 'audio/silence.mp3';
            else audio.src = 'audio/silence.ogg';
            audio.play();
            audio.pause();
        },
        currentAudio: function (id) {
            var audioObj = document.getElementById('screenAudio');
            if (id == undefined)
                return audioObj;
            else {
                if (shift.screen.isIOS) shift.screen.resetAudio();
                var source = { src: '', type: '' };
                var type; var s = 0; var found = false;
                if (audioObj.canPlayType('audio/mpeg')) type = 'audio/mpeg'; else type = 'audio/ogg';
                var audio = shift.screen.getAudio(id);
                if (audio != null) {
                    while (!found && s < audio.source.length) {
                        if (audio.source[s].type == type) {
                            found = true;
                            source.type = audio.source[s].type;
                            source.src = audio.source[s].src;
                            if (!source.src.startsWith('audio/')) source.src = 'audio/' + audio.source[s].src;
                        }
                        s++;
                    }
                }

                audioObj.src = source.src;
                return audioObj;
            }
        },
        stopCurrentAudio: function () {
            if (shift.screen.isIOS)
                shift.screen.resetAudio();
            else {
                var audio = shift.screen.currentAudio();
                audio.removeEventListener("ended", arguments.callee, false);
                audio.pause();
            }
        },

        playAudio: function (audioId, callback) {
            if (audioId != null) {
                var audio = shift.screen.currentAudio(audioId);
                audio.addEventListener("ended", function () {
                    shift.screen.currentAudio().removeEventListener("ended", arguments.callee, false);
                    shift.screen.toggleAudioButton(shift.screen.audioStatus.play);
                    if (typeof (callback) == 'function') callback();
                }, false);
                shift.screen.toggleAudioButton(shift.screen.audioStatus.pause);
                audio.play();
            }
            else if (typeof (callback) == 'function') callback();
        },
        stop: function () {

            shift.screen.stopCurrentAudio();

            $('.audio-progress').css({ 'width': '1%' });
            shift.screen.toggleAudioButton(shift.screen.audioStatus.play);
            if (shift.screen.status != shift.screenStatus.completed)
                shift.screen.status = shift.screenStatus.incomplete;
            shift.screen.clearTimeOuts();
        },
        getAudio: function (id) {
            if (shift.screen.rawdata.audio == undefined)
                return null;

            for (var i = 0; i < shift.screen.rawdata.audio.length; i++) {
                if (shift.screen.rawdata.audio[i].id === id)
                    return shift.screen.rawdata.audio[i];
            }
            return null;
        },
        getImage: function (id) {
            if (shift.screen.rawdata.image == undefined)
                return null;

            for (var i = 0; i < shift.screen.rawdata.image.length; i++) {
                if (shift.screen.rawdata.image[i].id === id) {
                    var image = shift.screen.rawdata.image[i];
                    if (!image.source[0].src.startsWith('img/'))
                        image.source[0].src = 'img/' + image.source[0].src;
                    return image;
                }
            }
            return null;
        },
        getParam: function (id) {
            for (i = 0; i < shift.screen.rawdata.param.length; i++) {
                if (shift.screen.rawdata.param[i].id === id)
                    return shift.screen.rawdata.param[i];
            }
            return null;
        },
        getParamBool: function (id, defaultValue) {
            defaultValue = defaultValue ? true : false;
            var _param = shift.screen.getParam(id);
            return _param != null ? (_param.value == 'true') ? true : false : defaultValue;
        },
        getParamNumber: function (id, defaultValue) {
            defaultValue = (defaultValue != null && !isNaN(defaultValue)) ? defaultValue : 0;
            var _param = shift.screen.getParam(id);
            return (_param != null && !isNaN(_param.value)) ? _param.value : defaultValue;
        },
        getParamString: function (id, defaultValue) {
            defaultValue = defaultValue != null ? defaultValue : '';
            var _param = shift.screen.getParam(id);
            return _param != null ? _param.value : defaultValue;
        },
        getText: function (id) {
            if (shift.screen.rawdata.text == undefined)
                return null;
            for (var i = 0; i < shift.screen.rawdata.text.length; i++) {
                if (shift.screen.rawdata.text[i].id === id)
                    return shift.screen.rawdata.text[i];
            }
            return null;
        },
        getVideo: function (id) {
            if (shift.screen.rawdata.video == undefined)
                return null;
            for (var i = 0; i < shift.screen.rawdata.video.length; i++) {
                var video = shift.screen.rawdata.video[i];
                if (video.id === id) {
                    for (var j = 0; j < video.source.length; j++) {
                        if (!video.source[j].src.startsWith('video/'))
                            video.source[j].src = 'video/' + video.source[j].src;
                    }
                    return video;
                }
            }
            return null;
        },
        getAnimation: function (id) {
            var _image = shift.screen.getImage(id);
            var _animationId = shift.screen.rawdata.id + '_' + id;
            var _animationExists = _image != null && _image.isanimation == 'True';
            var _filePath = 'animations/' + _animationId + '/' + _animationId + '_edgePreload.js';
            return _animationExists ?
                {
                    id: _animationId,
                    filePath: _filePath,
                    play: function (callback, container, cssAttributes) {
                        var startEdgeAnimation = function (animationId, callback) {
                            var _callTimeOut = true;
                            if (AdobeEdge && AdobeEdge.getComposition) {
                                var comp = $.Edge.getComposition(animationId);
                                if (comp != undefined) {
                                    comp.callReadyList();
                                    var stage = comp.getStage();
                                    stage.play(0);
                                    _callTimeOut = false;
                                    if (callback != null) callback();
                                }
                            }
                            if (_callTimeOut) setTimeout(function () { startEdgeAnimation(animationId, callback); }, 100);
                        };
                        if (container == null || container == undefined) container = $('#' + id);
                        if (cssAttributes == null || cssAttributes == undefined) cssAttributes = {};
                        container.append($("<div>").attr({ "id": "Stage" }).css(cssAttributes).addClass(_animationId));
                        $('#screen-css-container').append('<script src="' + _filePath + '"></script>');
                        startEdgeAnimation(_animationId, callback);
                    },
                    stop: function () {
                        var stopEdgeAnimation = function (animationId) {
                            var _callTimeOut = true;
                            if (AdobeEdge && AdobeEdge.getComposition) {
                                var comp = $.Edge.getComposition(animationId);
                                if (comp != undefined) {
                                    var stage = comp.getStage();
                                    stage.stop();
                                    _callTimeOut = false;
                                }
                            }
                            if (_callTimeOut) setTimeout(function () { stopEdgeAnimation(animationId); }, 100);
                        };
                        stopEdgeAnimation(_animationId);
                    }
                } : null;
        },
        removeAnimation: function () {
            if (shift.screen.rawdata != undefined && shift.screen.rawdata != null)
                $('script').each(function () {
                    var script = $(this);
                    if (script.attr('src').startsWith('animations/' + shift.screen.rawdata.id))
                        script.remove();
                });
            if (typeof (AdobeEdge) != "undefined") {
                delete window.AdobeEdge;
                delete $.Edge;
                window.AdobeEdge = {};
            }
        },
        setScore: function (path, n) {
            if (!shift.screen.pathEqualTo(path) && !shift.screen.isTest()) return;
            shift.course.unit[path.uIndex].topic[path.tIndex].screen[path.sIndex].score = n;
            shift.screen.attachNavigationBehavior(path, true);
        },
        reportScoreToTracker: function (callback) {
            var screen = shift.course.unit[shift.screen.path.uIndex].topic[shift.screen.path.tIndex].screen;
            if (shift.screen.path.sIndex != screen.length - 1) return; //verify that current screen is the last one.
            var quantity = 0;
            var totalScore = 0;
            for (var i = 0; i < screen.length; i++) {
                if (typeof (screen[i].score) != "undefined") {
                    quantity++;
                    totalScore += screen[i].score;
                }
            }
            if (quantity > 0) {
                var average = totalScore / quantity;
                if (shift.course.getParamBool('showtestmessages', true)) {
                    var masteryScore = shift.trackers.current.getMasteryScore();
                    var message = shift.course.getParam(average >= masteryScore ? 'passmessage' : 'failmessage');
                    MessageBox.alert('', message.replace('_SCORE_', average), { 'OK': function () { $(this).dialog("close"); callback(); } }, callback, false);
                    shift.trackers.current.setScore(average);
                }
                else {
                    shift.trackers.current.setScore(average);
                    callback();
                }
            }
            else callback();
        },
        blinkForwardButton: function (path) {
            if (!shift.screen.pathEqualTo(path)) return;
            $(".button-toggle-audio").attr("src", "img/toolbar/audioplay.png");
            var blinkButton = function (path) {
                var button = $(".button-go-forward");
                if (button.length == 0 || !shift.screen.pathEqualTo(path)) return;
                button.attr("src").indexOf("rightarrowblink") > 0
                    ? button.attr("src", "img/toolbar/rightarrow.png")
                : button.attr("src", "img/toolbar/rightarrowblink.png");
                setTimeout(function () { blinkButton(path); }, 1000);
            };
            $(".button-go-forward").attr('blink', shift.screen.rawdata.id);
            blinkButton(path);
        },
        clearTimeOuts: function () {
            var x = setTimeout('alert("x");', 100000);
            for (var i = 0; i <= x; i++)
                clearTimeout(x);
        }
    }
};
shift.screen.addAudioPlayer = function () {
    $('.audio-player-container').append('<audio id="screenAudio" preload="auto"></audio>');
    $("audio").bind('timeupdate', function () {
        var audio = document.getElementById('screenAudio');
        var progress = (audio.currentTime / audio.duration) * 100;
        $('.audio-progress').css({ 'width': progress + '%' });
    });
};
shift.screen.eventType = ('ontouchstart' in window) ? "touch" : "mouse";
shift.screen.layout = ($(window).width() > $(window).height()) ? "horizontal" : "vertical";
shift.screenStatus = { "notAttempted": 0, "incomplete": 1, "paused": 2, "completed": 3 };
shift.screen.transitionSpeed = 50;
shift.screen.unbindPreviousCss = function () {
    $('#css-container').empty();
    $('#screen-css-container').empty();
    $('body').removeAttr('style');
};
shift.screen.unbindPreviousEvents = function () {
    $(window).unbind("resize");//unbind resize event 
    $(window).unbind("scroll");//unbind scroll event 
    $(window).resize(function () {
        shift.screen.resizeContent();
    });
    attachWindowEventsBehavior();//attach dialogs behavior from jquery.utilities.js
};

//trackers
shift.trackers = {
    startTime: new Date().getTime(),
    current: {
        id: "plain",
        api: null,
        init: function () {
        },
        browse: false,
        getBookmark: function () {
            return '';
        },
        setBookmark: function (n) {

        },
        getUnitStatus: function (u) {
            return '2';
        },
        setUnitStatus: function (u, v) {

        },
        getTopicStatus: function (u, t) {
            return '2';
        },
        setTopicStatus: function (u, t, v) {

        },
        setScore: function (n) {
            console.log('Score was set to: ' + n);
        },
        getMasteryScore: function () {
            return shift.course.getParamNumber('masteryscore');
        },
        commit: function () {

        },
        finish: function () {

        }
    },
    scorm: {
        id: "scorm",
        api: null,
        data: {},
        init: function () {
            shift.trackers.scorm.api.LMSInitialize('');
            shift.trackers.scorm.browse = shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_mode').substring(0, 1).toLowerCase() === 'b';
            if (!shift.trackers.scorm.browse) {
                if (shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status').substring(0, 1).toLowerCase() === 'a' || shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status').substring(0, 1).toLowerCase() === 'n') {
                    shift.trackers.scorm.api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
                }
            }
            var s = shift.trackers.scorm.api.LMSGetValue('cmi.suspend_data');
            if (s == '') s = '{}';
            shift.trackers.scorm.data = JSON.parse(s);
            if (typeof shift.trackers.scorm.data != 'object') shift.trackers.scorm.data = {};
            if (shift.trackers.scorm.data.u == undefined) {
                shift.trackers.scorm.data.u = [];
                shift.trackers.scorm.data.t = [];
                for (u = 0; u < shift.course.unit.length; u++) {
                    shift.trackers.scorm.data.u.push('0');
                    shift.trackers.scorm.data.t[u] = [];
                    for (t = 0; t < shift.course.unit[u].topic.length; t++) {
                        shift.trackers.scorm.data.t[u].push('0');
                    }
                }
            }
        },
        browse: false,
        getBookmark: function () {
            var s = shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_location');
            return (s != '' && s.length === 15) ? s : '';
        },
        setBookmark: function (n) {
            shift.trackers.scorm.api.LMSSetValue('cmi.core.lesson_location', parseInt(shift.screen.path.uIndex, 10).zeroPad('00000') + parseInt(shift.screen.path.tIndex, 10).zeroPad('00000') + parseInt(shift.screen.path.sIndex, 10).zeroPad('00000'));
        },
        getUnitStatus: function (u) {
            return shift.trackers.scorm.data.u[u];
        },
        setUnitStatus: function (u, v) {
            v = String(v);
            if (v === '0' || v === '1' || v === '2') {
                shift.trackers.scorm.data.u[u] = v;
                var isCourseFinished = true;
                for (i = 0; i < shift.course.unit.length; i++) {
                    if (shift.trackers.current.getUnitStatus(i) != '2')
                        isCourseFinished = false;
                }
                if (isCourseFinished) {
                    var s = shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status').substring(0, 1).toLowerCase();
                    if (s != 'c' && s != 'p' && s != 'f')
                        shift.trackers.scorm.api.LMSSetValue('cmi.core.lesson_status', 'completed');

                }
            }
        },
        getTopicStatus: function (u, t) {
            return shift.trackers.scorm.data.t[u][t];
        },
        setTopicStatus: function (u, t, v) {
            v = String(v);
            if (v === '0' || v === '1' || v === '2') {
                shift.trackers.scorm.data.t[u][t] = v;

                if (v === '2') {
                    var isUnitFinished = true;
                    for (i = 0; i < shift.course.unit[u].topic.length; i++) {
                        if (shift.trackers.current.getTopicStatus(u, i) != '2')
                            isUnitFinished = false;
                    }
                    if (isUnitFinished)
                        shift.trackers.current.setUnitStatus(u, '2');
                }
            }

        },
        setScore: function (n) {
            n = parseInt(n, 10);
            if (!isNaN(n)) {
                shift.trackers.scorm.api.LMSSetValue('cmi.core.score.min', '0');
                shift.trackers.scorm.api.LMSSetValue('cmi.core.score.max', '100');
                shift.trackers.scorm.api.LMSSetValue('cmi.core.score.raw', n + '');
            }
            shift.trackers.scorm.api.LMSSetValue('cmi.core.lesson_status', (n >= shift.trackers.scorm.getMasteryScore() ? 'passed' : 'failed'));
        },
        getMasteryScore: function () {
            var iMasteryScore = parseInt(shift.trackers.scorm.api.LMSGetValue('cmi.student_data.mastery_score'), 10);
            if (isNaN(iMasteryScore))
                iMasteryScore = parseInt(shift.course.getParamNumber('masteryscore'), 10);
            if (isNaN(iMasteryScore))
                iMasteryScore = 70;
            return iMasteryScore;
        },
        commit: function () {
            shift.trackers.scorm.api.LMSSetValue('cmi.suspend_data', JSON.stringify(shift.trackers.scorm.data));
            return shift.trackers.scorm.api.LMSCommit('');
        },
        finish: function () {
            shift.trackers.scorm.api.LMSSetValue('cmi.suspend_data', JSON.stringify(shift.trackers.scorm.data));
            shift.trackers.scorm.api.LMSSetValue('cmi.core.session_time', shift.MillisecondsToCMIDuration((new Date()).getTime() - shift.trackers.startTime));
            if (shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status') === 'completed' || shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status') === 'passed' || shift.trackers.scorm.api.LMSGetValue('cmi.core.lesson_status') === 'failed')
                shift.trackers.scorm.api.LMSSetValue('cmi.core.exit', 'logout');
            else
                shift.trackers.scorm.api.LMSSetValue('cmi.core.exit', 'suspend');
            return shift.trackers.scorm.api.LMSFinish('');
        }
    },
    find: function () {
        //search for SCORM API
        var iFindAPITries = 0;
        var win = window;
        while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
            iFindAPITries++;
            if (iFindAPITries > 500)
                break;
            win = win.parent;
        }
        if (win.API == null) {
            iFindAPITries = 0;
            while ((win.API == null) && (win.opener != null) && (win.opener != win)) {
                iFindAPITries++;
                if (iFindAPITries > 500)
                    break;
                win = win.opener;
            }
        }
        if (win.API != null) {
            //asign current tracker to scorm
            shift.trackers.scorm.api = win.API;
            shift.trackers.current = shift.trackers.scorm;
            $(window).unload(shift.trackers.current.finish);
        }
        console.log('Using tracker: "' + shift.trackers.current.id + '"');
    }
};

//utilities
if (typeof String.prototype.startsWith != 'function') { String.prototype.startsWith = function (str) { return this.slice(0, str.length) == str; }; }
if (typeof String.prototype.endsWith != 'function') { String.prototype.endsWith = function (str) { return this.slice(-str.length) == str; }; }
if (typeof Number.prototype.zeroPad != 'function') { Number.prototype.zeroPad = function (base) { var len = (String(base).length - String(this).length) + 1; return len > 0 ? new Array(len).join('0') + this : this } }
jQuery.getCSS = function (url, media, appendTo) { jQuery(document.createElement('link')).attr({ href: url, media: media || 'screen', type: 'text/css', rel: 'stylesheet' }).appendTo(appendTo || '#css-container'); }
shift.MillisecondsToCMIDuration = function (n) {
    var hms = "";
    var dtm = new Date(); dtm.setTime(n);
    var h = "000" + Math.floor(n / 3600000);
    var m = "0" + dtm.getMinutes();
    var s = "0" + dtm.getSeconds();
    var cs = "0" + Math.round(dtm.getMilliseconds() / 10);
    hms = h.substr(h.length - 4) + ":" + m.substr(m.length - 2) + ":";
    hms += s.substr(s.length - 2) + "." + cs.substr(cs.length - 2);
    return hms
};

$(document).ready(function () {
    //load main structure data
    if ($.url().param('u') == null || $.url().param('t') == null || $.url().param('s') == null) {
        shift.trackers.find();
    }

    $.getJSON('data/app.json', { '_': new Date().getTime() }, function (data) {
        shift.course = data;
        shift.course.getParam = function (id) {
            for (var i = 0; i < shift.course.param.length; i++) {
                if (shift.course.param[i].id === id)
                    return shift.course.param[i].value;
            }
            return '';
        };
        shift.course.getParamBool = function (id, defaultValue) {
            defaultValue = defaultValue ? true : false;
            var _param = shift.course.getParam(id);
            return _param != '' ? (_param == 'true') ? true : false : defaultValue;
        };
        shift.course.getParamNumber = function (id, defaultValue) {
            defaultValue = (defaultValue != null && !isNaN(defaultValue)) ? defaultValue : 0;
            var _param = shift.course.getParam(id);
            return (_param != '' && !isNaN(_param)) ? _param : defaultValue;
        };
        shift.trackers.current.init();
        $('#viewport').load('views/screenheader.html', function (header) {
            shift.screen.header = header;
            $('#viewport').load('views/screenfooter.html', function (footer) {
                shift.screen.footer = footer;
                shift.screen.addAudioPlayer();
                $('#viewport').empty();
                if ($.url().param('u') == null || $.url().param('t') == null || $.url().param('s') == null) {
                    var isPreview = shift.course.getParam('is-preview');
                    if (isPreview == 'true')
                        shift.screen.show(0, 0, 0);
                    else shift.mainMenu.show();
                    var bookmark = shift.trackers.current.getBookmark();
                    if (bookmark != '') {
                        var buttons = {};
                        buttons[shift.course.getParam('yes-text')] = function () {
                            $(this).dialog("close");
                            shift.screen.show(parseInt(bookmark.substr(0, 5), 10), parseInt(bookmark.substr(5, 5), 10), parseInt(bookmark.substr(10, 5), 10));
                        };
                        buttons[shift.course.getParam('no-text')] = function () { $(this).dialog("close"); };
                        MessageBox.alert('', shift.course.getParam('return-to-bookmark-prompt'), buttons, null, false);
                    }
                }
                else {
                    //go to a specific screen using URL parameters
                    //for example app.html?u=1&t=1&s=1 goes to unit 1, topic 1, screen 1
                    shift.screen.show(parseInt($.url().param('u'), 10) - 1, parseInt($.url().param('t'), 10) - 1, parseInt($.url().param('s'), 10) - 1)
                }
            });
        });
    })
    .error(function () { console.log("Error loading course data.") });
});
//end document ready