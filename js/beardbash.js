var beardbash_instances =[];
var beardbash_blinker = false;
function start_beard(beard_selector) {
    if(beard_selector==undefined) {
        for (var sel in beardbash_instances) {
            beardbash_instances[sel].start();
            beardbash_instances[sel].kickoff();
        }
    } else if(beardbash_instances[beard_selector]!=undefined)
        beardbash_instances[beard_selector].start();
}
function BeardBash(selector, send_callback, receive_callback) {
    this.selector = selector;
    this.cursorspeed = 500;
    this.cursortimer = false;
    this.always_focus = false;
    this.mode = 'off';
    this.send_callback = send_callback;
    if(receive_callback==undefined)
        this.receive_callback = this.output;
    else
        this.receive_callback = receive_callback;
    this.buildhtml = function() {
        html = '';
        html += '';
        html += '<div class="output-wrapper">';
        html += '<div class="line output"><label class="prefix">&nbsp;</label><div class="verbose">Loading...</div></div>';
        html += '<noscript>';
        html += '<div class="line output"><label class="prefix"></label><div class="verbose">Failed, please enable Javascript to run this application</div></div>';
        html += '</noscript>';
        html += '</div>';
        html += '<div class="input-wrapper line input" class="line"><label class="prefix">&gt;&gt;</label><div style="position: relative;"><input type="text" class="type" /><p class="faux_input"></p><span class="cursor" style="display: inline-block;">&nbsp;</span></div></div>';
        $(this.selector).html(html).addClass('beardbash');
    }
    this.bindclicks = function() {
        var sel = this.selector;
        
        // handle hyperlinks
        $(document).on('click', this.selector+' a', function(e) {
            input = $(this).data('input');
            beardbash_instances[sel].focus();
            if($(this).hasClass('no-takeover')) {
            } else if(input) {		
                    e.preventDefault();
                    beardbash_instances[sel].send(input);
            } else {
                    e.preventDefault();
                    beardbash_instances[sel].send('/redirect '+$(this).attr('href'));
            }
        });
        
        // focus on terminal on click
        $(this.selector).on('click', function(e) {
            beardbash_instances[sel].focus();
            console.log('Focus on terminal '+beardbash_instances[sel].selector, beardbash_instances[sel]);
            //e.stopPropagation();
        });
        $(this.selector+' .type').blur(function() {
            console.log(sel+' lost focus');
            $(sel).removeClass('focus');
        });
    }
    
    this.send = function(input) {
        this.focus();
        if(input==undefined)
            input = $(this.selector+' .faux_input').html();
        if(input=='') return;
        this.mode = 'off';
        $(this.selector).removeClass('available');
        if(input=='/clear') $(this.selector+' .output-wrapper').html('');
        $(this.selector+' .type').val('');
        $(this.selector+' .faux_input').html('');
        if(input=='/clear') {
            this.resume();
        } else {
            this.send_callback(input);
        }
    }
    this.receive = function(response) {
        this.receive_callback(response);
    }
    
    this.output = function(m, p, c) {
        if(m==undefined||m==null||m=='') return;
        if(p==undefined) p = '&nbsp;';
        if(c==undefined) c = 'line output'; else c = 'line '+c;
        $(this.selector+' .output-wrapper').append('<div class="'+c+'"><label class="prefix">'+p+'</label><div class="verbose">'+m+'</div></div>');
    }
    
    this.blink = function(start) {
        el = $('.cursor');
        if(start==undefined) {
            el.toggle();
            sel = this.selector;
            beardbash_blinker = window.setTimeout(function() { beardbash_instances[sel].blink(); }, this.cursorspeed);
        } else {
            el.show();
            sel = this.selector;
            window.clearTimeout(beardbash_blinker);
            beardbash_blinker = window.setTimeout(function() { beardbash_instances[sel].blink(); }, this.cursorspeed);
        }
    }
    this.resume = function() {
        $(this.selector+' .type').val('');
        $(this.selector+' .faux_input').html('');
        this.mode = 'start';
        $(this.selector).addClass('available');
        window.scrollTo(0, document.body.scrollHeight);
    }

    this.focus = function() {
        $(this.selector+' .type').focus();
        if(!$(this.selector).hasClass('focus')) {
            this.blink(true);
            $('.beardbash.focus').removeClass('focus');
            $(this.selector).addClass('focus');
            if(this.mode!='off') {
                this.mode = 'on';
            }
        }
    }
    this.escape = function(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    this.start = function() {
        console.log('starting');
        this.buildhtml();
        this.bindclicks();
        this.resume();
    }
    this.kickoff = function() {
        this.focus();
        $(this.selector).children('.verbose').append(' OK!');
    }
    this.input = function(e, input_content) {
        if(e.keyCode==13) {
            this.send(input_content);
            input_content = '';
        }
        if(input_content==false||input_content==undefined) input_content = '';
        $(this.selector+' .faux_input').html(input_content);
        $(this.selector+' .cursor').css('left', $(this.selector+' .faux_input').width());
    }
    if(beardbash_blinker==false) this.blink();
    beardbash_instances[this.selector+''] = this;
}

$(document).ready(function(){
    $(document).bind('keydown', function(e) {
        f = $('.beardbash.focus');
        if(f.length===1) {
            sel = '#'+f.attr('id');
            window.setTimeout(function() {
                if(beardbash_instances[sel]!=undefined)
                    beardbash_instances[sel].input(e, $(sel+' .type').val()+'');
            }, 1);
        }
    });
    
});