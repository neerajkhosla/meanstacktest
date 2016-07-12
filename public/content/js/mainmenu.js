$.extend({
    mainMenu: new function () {
        var _self = this;
        var _course = null;
        var _serializeElements = false;
        var _hasAuraPlayer = false;
        _self.initialize = function () {
            _checkAuraPlayer();
            //load course menu            
            _loadMenu();              
        };
        
        var _checkAuraPlayer = function(){
            _hasAuraPlayer = window.parent.auraplayer && window.parent.auraplayer != "undefined" && window.parent.auraplayer != null && window.parent.auraplayer != "";
            _hasAuraPlayer = true; //remove this line when possible
        };
        
        var _performAuraPlayerTasks = function (){
            if (_hasAuraPlayer)
            {
                _attachTopicsBehavior();
                //_showConfirmationMessage();
                if (window.parent.setProgress)
                {
                    window.parent.setProgress();
                }
            }
        };
        
        var _getTopicParam = function (uIndex, tIndex, id){
            var param = _course.unit[uIndex].topic[tIndex].param;
            for (var i = 0; i < param.length; i++) {
                if (param[i].id === id) 
                    return param[i].value;
            }
            return '';
        };

        var _loadMenu = function () {
                //store json value in _course field
                _course = shift.course;
                $('.course-name').html(_course.name);
                $('.title', $('.units-container')).html(_course.getParam('unit-menu-header-text'));
                $('.title', $('.topics-container')).html(_course.getParam('topic-menu-header-text'));
                var _param = _course.getParam('serializeelements');
                _serializeElements = _param == 'true' ? true : false;
                _setThemeColors();
                _buildMenu();
                _setBulletColors();                
                _performAuraPlayerTasks();
                setTimeout(function(){_resize();setTimeout(function(){$(window).resize()}, 1000);}, 100);
                $(window).resize(function () {
                    _resize();
                });
        };
        
        var _setThemeColors = function(){
            var _gradientStartColor = _course.getParam('background-gradient-start-color');
            var _gradientEndColor = _course.getParam('background-gradient-end-color');
            var _boxGradientStartColor = _course.getParam('box-frame-gradient-start-color');
            var _boxGradientEndColor = _course.getParam('box-frame-gradient-end-color');
            var _boxShadowColor = _course.getParam('box-frame-shadow-color');
            
            $('body').css('background-color', _course.getParam('background-color'))
                     .css('filter', "progid:DXImageTransform.Microsoft.gradient(startColorStr='" + _gradientStartColor + "', EndColorStr='" + _gradientEndColor + "')")
                     .css('background-image', '-moz-linear-gradient(top, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)')
                     .css('background-image', 'linear-gradient(top, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)')
                     .css('background-image', '-o-linear-gradient(top, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)')
                     .css('background-image', '-webkit-linear-gradient(top, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)')
                     .css('background-image', '-ms-linear-gradient(top, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)')
                     .css('background-image', '-webkit-gradient(linear, left top, left bottom, from(' + _gradientStartColor + '), to(' + _gradientEndColor + '))')
                     .css('background-image', 'linear-gradient(to bottom, ' + _gradientStartColor + ' 0%, ' + _gradientEndColor + ' 100%)');
                     
            $('.menu-container').css('filter', "progid:DXImageTransform.Microsoft.gradient(startColorStr='" + _boxGradientStartColor + "', EndColorStr='" + _boxGradientEndColor + "')")
                     .css('background-image', '-moz-linear-gradient(0% 50% 270deg, ' + _boxGradientStartColor + ', ' + _boxGradientEndColor + ' 100%)')
                     .css('background-image', 'linear-gradient(top, ' + _boxGradientStartColor + ' 0%, ' + _boxGradientEndColor + ' 100%)')
                     .css('background-image', '-o-linear-gradient(top, ' + _boxGradientStartColor + ' 0%, ' + _boxGradientEndColor + ' 100%)')
                     .css('background-image', '-webkit-linear-gradient(top, ' + _boxGradientStartColor + '0%, ' + _boxGradientEndColor + ' 100%)')
                     .css('background-image', '-ms-linear-gradient(top, ' + _boxGradientStartColor + ' 0%, ' + _boxGradientEndColor + ' 100%)')
                     .css('background-image', '-webkit-gradient(linear, left top, left bottom, from(' + _boxGradientStartColor + '), to(' + _boxGradientEndColor + '))')
                     .css('background-image', 'linear-gradient(to bottom, ' + _boxGradientStartColor + ' 0%, ' + _boxGradientEndColor + ' 100%)')
                     .css('-moz-box-shadow','0 0 10px ' + _boxShadowColor)
                     .css('-webkit-box-shadow','0 0 10px ' + _boxShadowColor)
                     .css('box-shadow','0 0 10px ' + _boxShadowColor);
        };

        var _setBulletColors = function(){
            $('.status').css('border-color', _course.getParam('bullets-border-color'))
                        .css('background-color', _course.getParam('bullets-background-color'));
            $('span', $('.status')).css('background-color', _course.getParam('bullets-fill-color'));
        };
        
        var _resize = function(){
            var _height = $(window).height();
            var _desktopMenuVisible = $('.desktop-menu:visible').length > 0;
            if (!_desktopMenuVisible || (_desktopMenuVisible && (_height - $('.menu-container').height()) > 98))
            {
                $('body').css('min-height', _height + 'px');
                if (_desktopMenuVisible) _height -= 98;
                $('.page-container').css('min-height', _height + 'px');
            }

            //restore the body width to fix IE bug
            $('body').css('width', '96%');
        };
        
        var _buildMenu = function () {
            _loadUnits();
            _attachMenuBehavior($('.desktop-menu'));
            _attachMenuBehavior($('.mobile-menu'));            
        };

        var _attachTopicsBehavior = function(){            
            $('.topic').each(function(){
                $('a[activated=1]', $(this)).click(function(){
                    var _item = $(this);       
                    //play the first screen
                    var uIndex = _item.attr('unit-index');
                    var tIndex = _item.attr('index');                      
                    var topicIsTest = _getTopicParam(uIndex, tIndex, 'istest');
                    if (topicIsTest == 'true') {
                        showTestStartConfirmation(uIndex, tIndex, 0);
                        return;
                    }
                    shift.screen.show(uIndex, tIndex, 0);
                });
            });            
        };
        
        var showTestStartConfirmation = function(uIndex, tIndex, sIndex){
            var buttons = {};
            buttons[_course.getParam('yes-text')] = function(){ 
                $(this).dialog("close"); 
                shift.screen.show(uIndex, tIndex, sIndex); 
            };
            buttons[_course.getParam('no-text')] = function(){ $(this).dialog("close");};
            MessageBox.alert('', _course.getParam('test-start-confirmation-message'), buttons, null, false);
        };
        
        var _loadUnits = function(){
            var _unitsContainer = $('.units', $('.desktop-menu'));
            var _topicsContainer = $('.topics', $('.desktop-menu'));
            var _mobileUnitsContainer = $('.units', $('.mobile-menu'));            
            if (_course.unit)
            {
                for(var i=0;i<_course.unit.length;i++)
                {
                    var _unitHtml = '<a href="javascript:void(0);" index="' + i + '">' + _getStatusBullet(shift.mainMenu.getUnitStatus(i)) + _course.unit[i].name + '</a>';
                    var _topicsHtml = _getTopicsHtml(i, _course.unit[i])

                    _unitsContainer.append(_unitHtml);
                    _topicsContainer.append(_topicsHtml);

                    _mobileUnitsContainer.append(_unitHtml + _topicsHtml);
                }
            }
            
        };
        
        var _getStatusBullet = function (status){
            return '<span class="status status-' + status + '"><span></span></span>';
        };

        var _getTopicsHtml = function(uIndex, unit){
            var _enableUnit = _canEnableUnit(uIndex);
            var _topicsHtml = '<div class="topic" index="' + uIndex + '" style="display:none;">';
            if (unit.topic)
            {
                for(var i=0;i<unit.topic.length;i++)
                {
                    var _enableTopic = _canEnableTopic(uIndex, i);
                    var _canActivate = _enableUnit && _enableTopic ? '1' : "0";

                    _topicsHtml += '<a href="javascript:void(0);" unit-index="' + uIndex + '" index="' + i + '" activated="'+ _canActivate +'">';
                    _topicsHtml += _getStatusBullet(shift.mainMenu.getTopicStatus(uIndex, i)) + unit.topic[i].name + '</a>';
                }
            }
                
            _topicsHtml += '</div>';
            return _topicsHtml;
        };
        
        var _previousUnitsEnabled = function(index){
            for (var i=0;i<index;i++){
                var _status = shift.mainMenu.getUnitStatus(i);
                if (_status == 0 || _status == 1) return false;
            }                
            return true;            
        };
        
        var _previousTopicsEnabled = function(unitIndex, topicIndex){
            for (var i=0;i<topicIndex;i++){
                var _status = shift.mainMenu.getTopicStatus(unitIndex, i);
                if (_status == 0 || _status == 1) return false;
            }                
            return true;            
        };
        
        var _canEnableUnit = function(unitIndex){
            return !_serializeElements || _previousUnitsEnabled(unitIndex);
        };
        
        var _canEnableTopic = function (unitIndex, topicIndex){
            return !_serializeElements || _previousTopicsEnabled(unitIndex, topicIndex);
        };

        var _attachMenuBehavior = function(container){
            var _unit = $( 'a[index]', $('.units',container));
            _unit.click(function(){
                _openUnit($(this).attr('index'), container);
            });
            _openUnit(shift.screen.path.uIndex, container);
        };

        var _openUnit = function(index, container) {
            if ($('.topic[index=' + index + ']:visible', container).length == 0)
            {
                $('a', $('.units',container)).removeClass('selected');
                $('a[index=' + index + ']', container).addClass('selected');
                $('.topic:visible', container).hide();
                $('.topic a', container).removeClass('selected');
                $('.topic[index=' + index + ']', container).slideDown();                
            }
        };
    }
});

$(function () {
    $.mainMenu.initialize();
    $(window).resize();
});