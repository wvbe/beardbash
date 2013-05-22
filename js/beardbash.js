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
        html += '<input type="text" class="type" />';
        html += '<div class="output-wrapper">';
        html += '<div class="line output"><label class="prefix">&nbsp;</label><p>Loading...</p></div>';
        html += '<noscript>';
        html += '<div class="line output"><label class="prefix"></label><p>Failed, please enable Javascript to run this application</p></div>';
        html += '</noscript>';
        html += '</div>';
        html += '<div class="input-wrapper line input" class="line"><label class="prefix">&gt;&gt;</label><p class="faux_input"></p><span class="cursor" style="display: inline-block;">&nbsp;</span></div>';
        $(this.selector).html(html).addClass('beardbash');
    }
    this.bindclicks = function() {
        workaround = this;
        document.addEventListener('click', function() { workaround.focus(); });
        document.removeEventListener('click');
    
        $(document).on('click', this.selector+' a', function(e) {
            input = $(this).data('input');
            if($(this).hasClass('no-takeover')) {

            } else if(input) {		
                    e.preventDefault();
                    workaround.send(input);
            } else {
                    e.preventDefault();
                    workaround.send('/redirect '+$(this).attr('href'));
            }
        });
    }
    this.bindpresses = function() {
        workaround = this;
        
        document.addEventListener('keyup',function(e) {
            workaround.focus();
            if(e.keyCode==13) { // [enter]
                if(workaround.mode=='off') return;
                workaround.send();
            }
        });
        document.removeEventListener('keyup');


        
        $(this.selector+' .type').bind('input', function(e) {
            if(workaround.mode=='off') return;
            $(workaround.selector+' .faux_input').html($(this).val()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")); // get the current value of the input field.
            workaround.mode = 'start';
            workaround.blink();
        });
    }
    
    this.send = function(input) {
        if(input==undefined)
            input = $(this.selector+' .faux_input').html();
        if(input=='') return;
        this.mode = 'off';
        this.blink();
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
        $(this.selector+' .output-wrapper').append('<div class="'+c+'"><label class="prefix">'+p+'</label><p>'+m+'</p></div>');
    }
    
    this.blink = function() {
        el = $(this.selector+' .cursor');
        if(this.mode=='on') {
            el.show();
            window.clearTimeout(this.cursortimer);
        } else if(this.mode=='off') {
            el.hide();
            window.clearTimeout(this.cursortimer);
        } else if(this.mode=='blink') {
            el.toggle();
            workaround = this;
            workaround.cursortimer = window.setTimeout(function() { workaround.blink(); }, this.cursorspeed);
        } else if(this.mode=='start') {
            el.show();
            this.mode = 'blink';
            workaround = this;
            window.clearTimeout(workaround.cursortimer);
            workaround.cursortimer = window.setTimeout(function() { workaround.blink(); }, this.cursorspeed);
        }
    }
    this.resume = function() {
        $(this.selector+' .type').val('');
        $(this.selector+' .faux_input').html('');
        this.mode = 'start';
        this.blink();
        this.focus();
        window.scrollTo(0, document.body.scrollHeight);
    }

    this.focus = function() {
        $(this.selector+' .type').focus();
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
        
        this.buildhtml();
        this.bindclicks();
        this.bindpresses();
        this.resume();
    }
}