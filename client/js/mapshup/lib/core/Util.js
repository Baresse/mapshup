/*
 * mapshup - Webmapping made easy
 * http://mapshup.info
 *
 * Copyright Jérôme Gasperi, 2011.12.08
 *
 * jerome[dot]gasperi[at]gmail[dot]com
 *
 * This software is a computer program whose purpose is a webmapping application
 * to display and manipulate geographical data.
 *
 * This software is governed by the CeCILL-B license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-B
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-B license and that you accept its terms.
 */
(function(window, msp, document) {
    
    /*
     * Initialize msp
     */
    msp = msp || {};
    
    /*
     * Initilaze msp.Util
     */
    msp.Util = {
        
        /**
         * abc is added to proxyURL KVP (see scripts/proxy.php)
         */
        abc: (function() {
            var a = Math.round(Math.random()*865),
            b = Math.round(Math.random()*757);
            return '&a='+a+'&b='+b+'&c='+((a+17) - (3*(b-2)));
        })(),
        
        /*
         * Cookie object
         */
        Cookie: {
            
            /**
             * Get cookie
             */
            get: function(name) {
                var nameEQ = name + "=",
                ca = document.cookie.split(';'),
                i,
                l,
                c;
                for(i = 0, l = ca.length; i < l; i++) {
                    c = ca[i];
                    while (c.charAt(0)===' ') c = c.substring(1,c.length);
                    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
                }
                return null;
            },
            
            /**
             * Delete cookie "name"
             */
            remove:function(name) {
                this.set(name,"",-1);
            },
            
            /*
             * Set cookie "name=value" valid for days
             */
            set: function(name,value,days) {

                var expires,
                date = new Date();
                if (days) {
                    date.setTime(date.getTime()+(days*24*60*60*1000));
                    expires = "; expires="+date.toGMTString();
                }
                else {
                    expires = "";
                }
                document.cookie = name+"="+value+expires+"; path=/";
            }
        },

        device:(function() {

            /**
             * Initialize user agent string to lower case
             */
            var device,
            touch,
            uagent = navigator.userAgent.toLowerCase();

            /**
             * android ?
             */
            if (uagent.indexOf("android") !== -1) {
                device = "android";
                touch = true;
            }
            /**
             * iphone ?
             */
            else if (uagent.indexOf("iphone") !== -1) {
                device = "iphone";
                touch = true;
            }
            /**
             * ipod ?
             */
            else if (uagent.indexOf("ipod") !== -1) {
                device = "ipod";
                touch = true;
            }
            /**
             * ipad ?
             */
            else if (uagent.indexOf("ipad") !== -1) {
                device = "ipad";
                touch = true;
            }
            /**
             * Normal device
             */
            else {
                device = "normal";
                touch = false;
            }

            return {
                type:device,
                touch:touch
            };
        })(),

        /**
         * Escapable and meta character protection
         * See https://github.com/douglascrockford/JSON-js/blob/master/json2.js
         *
         */
        escapable: /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
          
        meta: {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        
        /**
         * Sequence number to guarantee unique IDs
         */
        sequence:0,
        
        /**
         * Internationalisation i18n function.
         * Each displayed message are translated through
         * this function
         */
        _: function(s) {
            if (msp.i18n === undefined) {
                return s;
            }
            var i18nized = msp.i18n[s];
            return i18nized === undefined ? s : i18nized;
        },

        /**
         * Create the div "divname" under "context" and return it
         * If this div already exist, jsut return it
         *
         * Nota : if "context" is not specified, "divName" is created under "body"
         */
        $$: function(divName, context) {
            context = context || 'body';
            var div = $(divName, context);
            if (div.length === 0) {
                var type = divName.substring(0,1) === "." ? "class" : "id";
                $(context).append('<div '+type+'="'+divName.substring(1,divName.length)+'"></div>');
                div = $(divName);
            }
            return div;
        },
        
        /**
         * Add a close button to the input div
         * A close button just hide the input div when it is clicked
         * If specified, it triggers action before hiding the div
         *
         * @input {jQuery div Object} : input div
         * @input {function} : action // optional
         */
        addCloseButton: function(div, action) {
            
            if (div) {
                
                var $id,
                id = msp.Util.getId();
                div.append('<div id="'+id+'" class="act actne icnclose" jtitle="'+this._("Close")+'"></div>');
                
                $id = $('#'+id);
                
                /*
                 * Add tooltip
                 */
                msp.tooltip.add($id, 'w');

                /*
                 * Close window
                 */
                $id.click(function() {
                    
                    /*
                     * Hide tooltip
                     */
                    msp.tooltip.remove();
                    
                    if ($.isFunction(action)) {
                        action();
                    }
                    div.hide();
                });
            }
        },
        
        /**
         * Clone object
         * 
         * Code from Keith Devens
         * (see http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone)
         */
        clone: function(srcInstance) {
            if(typeof(srcInstance) != 'object' || srcInstance == null) {
                return srcInstance;
            }
            var i, newInstance = srcInstance.constructor();
            for(i in srcInstance) {
                newInstance[i] = this.clone(srcInstance[i]);
            }
            return newInstance;
        },
        
        /**
         * Return a unique title from layerDescription
         * 
         * @input typeName : input layerDescription object
         */
        getTitle: function(layerDescription) {
            layerDescription = layerDescription || {};
            return layerDescription.title ? layerDescription.title : (layerDescription.type || "Unknown") + "#" + this.sequence++;
        },
        
        /**
         * Add a "display image" action to the given jquery 'a'
         * A click on 'a' will open the image within a fullscreen popup
         */
        showPopupImage:function(href, title) {

            /*
             * Popup reference
             */
            var popup = new msp.Popup({
                modal:true,
                resize:false,
                expand:true,
                noHeader:true,
                cssClose:{
                    'top':'-8px',
                    'right':'-8px'
                }
            }),
            image = new Image();

            /*
             * Show Activity
             */
            msp.activity.show();

            /*
             * Clear popup
             */
            popup.hide();

            /*
             * Show parent Mask
             */
            popup.$m.show();

            /*
             * Create image object
             */
            image.src = href;

            /*
             * Compute image after load
             */
            $(image).load(function() {

                /*
                 * Array of size :
                 *      0 => Image width
                 *      1 => Image height
                 *      2 => 80% of Window width
                 *      3 => 80% of Window height
                 */
                var sizes = [image.width, image.height, window.innerWidth * 0.8, window.innerHeight * 0.8],
                width = sizes[0],
                height = sizes[1];

                /*
                 * Image width is bigger than window width
                 * => reduce width/height to the window width preserving ratio
                 */
                if (width > sizes[2]) {
                    width = sizes[2];
                    height = (height * width) / sizes[0];
                }

                /*
                 * Image height is bigger than window height
                 * => reduce width/height to the window height preserving ratio
                 */
                if (height > sizes[3]) {
                    height = sizes[3];
                    width = (width * height) / sizes[1];
                }

                popup.$b.html('<div class="imageContent"><div class="padded"><img src="'+href+'" height="'+height+'" width="'+width+'"/><div class="innerTitle" style="width:'+width+'px;">'+title+'</div></div></div>');
                popup.$d.css({
                    'left':(window.innerWidth - popup.$d.width()) / 2,
                    'top':(window.innerHeight - popup.$d.height()) / 2
                });

                /*
                 * Hide Activity
                 */
                msp.activity.hide();

                /*
                 * Show popup image
                 */
                popup.show();
            }).error(function () {
                
                /*
                 * Hide activity/popup
                 */
                msp.activity.hide();
                popup.hide();
                
                msp.Util.message("Error loading image");
                
            });

        },
        
        /**
         * Add a "display video" action to the given jquery 'a'
         * A click on 'a' will open the within within a fullscreen popup
         * 
         * @input video : object describing video i.e. 
         *                  {
         *                      title://Video title
         *                      url://url to the video
         *                      type://video type - one of mp4, ogg or webm
         *                      img://url to an image
         *                      w://width of the player (default 640)
         *                      h: height of the player (default 264)
         *                  }
         *                     
         */
        showPopupVideo: function(video) {
            
            /*
             * Popup reference
             */
            var type,w,h,img,codec,content,
            popup = new msp.Popup({
                modal:true,
                resize:false,
                expand:true,
                noHeader:true,
                cssClose:{
                    'top':'-8px',
                    'right':'-8px'
                }
            });

            /*
             * Paranoid mode
             */
            video = video || {};
            if (!video.url) {
                this.message(this._("Error : url is not defined"));
                return false;
            }
            
            /*
             * Initialize default values
             */
            w = video.w || 640;
            h = video.h || 264;
            img = video.img || "";
            type = video.type;
            
            /*
             * Try to guess the video type from url if not specified
             */
            if (!type) {
                type = video.url.substring(video.url.length - 3,video.url.length).toLowerCase();
            }
            
            /*
             * Get codec from type
             */
            switch (type) {
                case "ogg":
                    codec = "video/ogg";
                    break;
                case "webm":
                    codec = "video/webm";
                    break;
                default:
                    codec = "video/mp4";
                    break;
            };
  
            /*
             * Show parent Mask
             */
            popup.$m.show();

            /*
             * Create videocontent
             * See http://camendesign.com/code/video_for_everybody for more information
             */
            content = '<video width="'+w+'" height="'+h+'" controls>'
            +'<source src="'+video.url+'" type="'+codec+'" />'
            +'<object width="'+w+'" height="'+h+'" type="application/x-shockwave-flash" data="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf">'
            +'<param name="movie" value="http://releases.flowplayer.org/swf/flowplayer-3.2.1.swf" />'
            +'<param name="allowfullscreen" value="true" />'
            +'<param name="flashvars" value="controlbar=over&amp;image='+img+'&amp;file='+video.url+'" />'
            +'<img src="'+img+'" width="'+w+'" height="'+h+'" alt="'+video.title+'" title="'+video.title+'"/>'
            +'</object>'
            +'</video>'
            +'<p class="vjs-no-video"><a href="'+video.url+'" target="_blank">'+this._("Download Video")+'</a></p>'
            +'</div>';
            popup.$b.html('<div class="imageContent"><div class="padded">'+content+'</div></div>');
            popup.$d.css({
                'left':(window.innerWidth - popup.$d.width()) / 2,
                'top':(window.innerHeight - popup.$d.height()) / 2
            });

            /*
             * Show popup image
             */
            popup.show();

            return true;
        },
        
        /**
         * Launch an ajax call
         * This function relies on jquery $.ajax function
         */
        ajax: function(obj, options) {

            var ajax;
            
            /*
             * Paranoid mode
             */
            if (typeof obj !== "object") {
                return null;
            }

            /*
             * Ask for a Mask
             */
            if (options) {
                
                var id = this.getId();
                
                obj['complete'] = function(c) {
                    msp.mask.abort(id);
                }
                
                ajax = $.ajax(obj);
                
                /**
                 * Add information about loading
                 */
                msp.mask.add({
                    title:options.title || this._("Processing"),
                    cancel:options.cancel === true ? options.cancel : false,
                    id:id,
                    request:ajax
                });
            }
            else {
                ajax = $.ajax(obj);
            }

            return ajax;
        },
        
        /**
         * Display a modal popup to ask user for
         * a particular value
         */
        askFor:function(title, description, type, value, callback) {
          
            var id,
            self = this,
            input = [],
            popup = new msp.Popup({
                modal:true,
                header:'<p>'+title+'</p>'
            }); // Create popup
            
            /*
             * Switch type. Can be one of :
             *  - date
             *  - text
             *  - list
             */
            if (type === "date" || type === "text" || type === "bbox") {
                
                /*
                 * Get unique ids
                 */
                id = this.getId();
                
                /*
                 * Append input text box to body
                 */
                popup.$b.append('<input id="'+id+'" type="text"/>');
                
                /*
                 * Set default value if defined
                 * Input value is encoded to avoid javascript code injection
                 */
                input = $('#'+id);
                if (value) {
                    input.val(this.htmlEntitiesEncode(value));
                }
                /*
                 * Or set input text box placeholder
                 */
                else if (description) {
                    input.attr('placeholder', description);
                }
                
                /*
                 * Add action on input text box (see fct above)
                 */
                input.keypress(function(e){
                    
                    /*
                     * Input value is encoded to avoid javascript code injection
                     */   
                    var v = self.htmlEntitiesEncode($(this).val());
                    
                    /*
                     * Return or tab keys
                     */
                    if (e.keyCode === 13 || e.keyCode === 9) {
                        
                        if (type === "date") {
                            if (self.isDateOrInterval(v) || self.isISO8601(v)) {
                                callback(v);
                                popup.remove(); 
                            }
                            else {
                                self.message(self._("Expected format is YYYY-MM-DD for a single date or YYYY-MM-DD/YYYY-MM-DD for a date interval"));
                            }
                        }
                        else if (type === "bbox") {
                            if (self.isBBOX(v)) {
                                callback(v);
                                popup.remove(); 
                            }
                            else {
                                self.message(self._("Expected format is lonmin,latmin,lonmax,latmax"));
                            }
                        }
                        else {
                            callback(v);
                            popup.remove(); 
                        }

                        return false;
                    }
                });
                
            }
            /*
             * Cas list - value should be an array of object
             * {
             *      title: Display item title
             *      value: Value returned on click
             *      icon: // optional
             * }
             */
            else if (type === "list") {
                
                var el,
                icon,
                count = 0,
                $p = popup.$b.append((description ? '<p class="center">'+description+'</p>' : '') + '<p class="center"></p>').children().last();
                
                /*
                 * Roll over items
                 */
                for (i in value) {
                    id = this.getId();
                    el = value[i];
                    icon = el.icon ? '<img class="middle" src="'+el.icon+'"/>&nbsp;' : '';
                    $p.append('<a href="#" class="button marged" id="'+id+'">'+icon+el.title+'</a>');
                    
                    /*
                     * Return item value to callback on click
                     */
                    (function(d, a, c, v){
                        a.click(function(e){
                            c(v);
                            d.remove();
                            return false;
                        });
                    })(popup, $('#'+id), callback, el.value);
                
                    count++;
                }
                
            }
            
            /*
             * Show the modal window
             */
            popup.show();
            
            /*
             * Set focus on input box if defined
             */
            if (input.length > 0) {
                input.focus();
            }
            
            return popup;
            
        },
        
        /**
         * Checksum function
         * Used to generate unique mspID based on layer description
         * Get from http://noteslog.com/post/crc32-for-javascript/
         * (c) 2006 Andrea Ercolino http://www.opensource.org/licenses/mit-license.php
         */
        crc32: function(str,crc) {
            if ( crc === window.undefined ) {
                crc = 0;
            }
            var n = 0;
            // number between 0 and 255
            var x = 0;
            // hex number
            crc = crc ^ (-1);
            for( var i = 0, iTop = str.length; i < iTop; i++ ) {
                n = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
                x = "0x" + "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D".substr( n * 9, 8 );
                crc = ( crc >>> 8 ) ^ x;
            }
            return crc ^ (-1);
        },
        
        /**
         * Update html content of #message div and display it during "duration" ms
         * css('left') is computed each time to reflect map resize
         */
        message: function(content, duration) {
            
            var $d,
            id = this.getId(),
            parent = this.$$('#message', msp.$container).show(),
            m = "&nbsp;"+decodeURIComponent(content)+"&nbsp;";

            /*
             * Add a new message
             */
            parent.append('<div id="' + id + '" class="message shadow"></div>');
            $d = $('#' + id);
                
            /*
             * duration is set to -1
             * In this case, jMessage is not automatically closed
             * and a close button is added to manually close it
             */
            if (duration && duration === -1) {
                $d.html(m).fadeIn('slow');
                this.addCloseButton($d, function(){
                    $d.remove();
                });
            }
            else {
                $d.html(m).fadeIn('slow').delay(duration || 2000).fadeOut('slow', function(){
                    $(this).remove();
                });
            }
            parent.css({
                'left': (msp.$container.width() - $d.width()) / 2
            });

            return $d;
        },
        
        /**
         * Replace all ',",. and # characters from "str" by "_"
         */
        encode: function(str) {
            return str.replace(/[',", ,\.,#]/g,"_");
        },
        
        /**
         * Extract Key/Value pair from an url like string
         * (e.g. &lon=123.5&lat=2.3&zoom=5)
         */
        extractKVP: function(str) {
            var c = {};
            str = str || "";
            str.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                c[key] = (value === undefined) ? true : value;
            });
            return c;
        },
        
        /**
         * Return an absolute URL.
         * If input url starts with '/', it is assumed that input url
         * is relative to the Config.general.serverRootUrl
         */
        getAbsoluteUrl: function(url) {

            /*
             * url is absolute => return url
             * else return absolute url
             */
            if (url && msp.Config["general"].serverRootUrl) {

                /*
                 * Be carefull of array of url !
                 */
                if (typeof url === "object") {
                    return url;
                }
                
                /*
                 * If url does not start with '/' then returns it without modification
                 */
                return (this.isUrl(url) || url.substr(0,1) !== '/') ? url : msp.Config["general"].serverRootUrl + url;
                
            }
            
            return url;
        },

        /**
         * Return a unique id
         */
        getId: function() {
            return "id"+this.sequence++;
        },
        
        /**
         * Return a unique id
         * 
         * @input string : f - fileName
         */
        getImgUrl: function(f) {
            
            /*
             * fileName is returned as is if it is :
             *  - null
             *  - a fully qualified url (i.e. starts with http:)
             *  - a base64 encoded image stream (i.e. starts with data:)
             */
            return (!f || f.substr(0,5) ==='http:' || f.substr(0,5) ==='data:') ? f : msp.Config["general"].themeUrl+"/img/"+f;
        },
        
        /**
         * Return the obj.property value if defined or value if not
         */
        getPropertyValue: function(obj, property, value) {
            
            /*
             * This should never happened...
             */
            if (obj === undefined || property === undefined) {
                return undefined;
            }
            
            /*
             * Property is set, returns its value
             */
            if (obj.hasOwnProperty(property)) {
                return obj[property];
            }
            
            /*
             * Returns the input value
             */
            return value;
        },
        
        /**
         * Remove the < and > character to avoid script injection
         * // 60 3C && // 62 3E
         */
        htmlEntitiesEncode: function(str) {
            
            /*
             * Paranoid mode
             */
            if (!str) {
                return null;
            }
            
            return str.replace(/</g,'&lt;').replace(/>/g,'&gt;'); 
        },
         
        /**
         * Dirty hack to decode htmlentities
         * and get true length of string
         */
        htmlEntitiesDecode: function(str) {
            
            /*
             * Paranoid mode
             */
            if (!str) {
                return null;
            }
            
            var ta = document.createElement("textarea");
            ta.innerHTML = str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            var decodedStr = ta.value;
            ta = null;
            return decodedStr;
        },
        
        /**
         * Check if a string is a valid BBOX
         * A valid BBOX is :
         *   - 4 decimal values comma separated A,B,C,D
         *   - A < C
         *   - B < D
         */
        isBBOX: function (str) {
            if (!str || str.length === 0) {
                return false;
            }
            var arr = str.split(',');
            if (arr.length !== 4) {
                return false;
            }
            for (var i=0;i<3;i++) {
                if (!$.isNumeric(arr[i])) {
                    return false;
                }
            }
            if (parseFloat(arr[0]) > parseFloat(arr[2]) || parseFloat(arr[1]) > parseFloat(arr[3])) {
                return false;
            }
            return true;
        },

        /**
         * Check if a string is a valid date i.e. YYYY-MM-DD
         */
        isDate: function(str) {

            /*
             * Paranoid mode
             */
            if (!str || str.length === 0) {
                return false;
            }

            /*
             * Days in month
             */
            var daysInMonth = [31,29,31,30,31,30,31,31,30,31,30,31],
            elements = str.split('-');
            
            /*
             * Format is YYYY-MM-DD
             */
            if (elements.length !== 3) {
                return false;
            }

            var y = parseInt(elements[0], 10),
            m = parseInt(elements[1], 10),
            d = parseInt(elements[2], 10);

            /*
             * February has 29 days in any year evenly divisible by four,
             * EXCEPT for centurial years which are not also divisible by 400.
             */
            var daysInFebruary = ((y % 4 === 0) && ( (!(y % 100 === 0)) || (y % 400 === 0))) ? 29 : 28;

            if (elements[0].length !==4 || y < 1900 || y > 2100) {
                return false;
            }
            if (elements[1].length !==2 || m < 1 || m > 12) {
                return false;
            }
            if (elements[2].length !==2 || d < 1 || d > 31 || (m === 2 && d > daysInFebruary) || d > daysInMonth[m]) {
                return false;
            }

            return true;
        },
        
        /**
         * Check if a string is a valid date or date interval
         * i.e. YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD
         */
        isDateOrInterval:function(str) {
            
            /*
             * Paranoid mode
             */
            if (str === undefined || str.length === 0) {
                return false;
            }
            
            /*
             * Input strDate can be a date or an interval
             * YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD
             */
            var dates = str.split('/'),
            empty = 0,
            i,
            l;
                
            if (dates.length > 2) {
                return false;
            }
            
            /*
             * Roll over dates
             */
            for (i = 0, l = dates.length; i < l; i++) {
                
                /*
                 * Date is not valid return false
                 * unless it is empty (see below)
                 */
                if (!this.isDate(dates[i])) {
                    if (dates[i] === "") {
                        empty++;
                    }
                    else {
                        return false;
                    }
                }
            }
            
            /*
             * We want to allow unclosed interval
             * i.e. YYYY-MM-DD/ and /YYYY-MM-DD
             * so if only one empty is present the 
             * interval is still valid
             */
            if (dates.length - empty < 1) {
                return false;
            } 
            
            return true

        },
        
        /**
         * Check if a string is a valid email adress
         */
        isEmailAdress: function (str) {
            if (!str || str.length === 0) {
                return false;
            }
            var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$/;
            return pattern.test(str);
            
        },
        
        /**
         * Check if a string is a valid ISO8601 date or interval
         * i.e. YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss/YYYY-MM-DDTHH:mm:ss
         */
        isISO8601: function (str) {

            /*
             * Paranoid mode
             */
            if (str === undefined || str.length === 0) {
                return false;
            }
            
            /*
             * Input strDate can be a date or an interval
             * YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss/YYYY-MM-DDTHH:mm:ss
             */
            var isos = str.split('/');
            if (isos.length > 2) {
                return false;
            }

            var arr;

            /*
             * Roll over iso8601s
             */
            for (var i = 0, l = isos.length; i < l; i++) {
                arr = isos[i].split('T');
                if (arr.length !== 2) {
                    return false;
                }
                if (!this.isDate(arr[0])) {
                    return false;
                }
                if (!this.isTime(arr[1])) {
                    return false;
                }
            }

            return true;

        },
        
        /**
         * Check if a string is a valid time i.e. HH:mm:ss or HH:mm:ssZ
         */
        isTime: function(str) {

            /*
             * Paranoid mode
             */
            if (!str || str.length === 0) {
                return false;
            }

            /*
             * Remove last character if it's a Z
             */
            if (str.indexOf('Z') === str.length - 1) {
                str = str.substring(0,str.length - 1);
            }

            /*
             * Format is HH:mm:ss.mmm
             */
            var elements = str.split(':');
            if (elements.length !== 3) {
                return false;
            }

            var h = parseInt(elements[0], 10),
            m = parseInt(elements[1], 10),
            s = parseInt(elements[2], 10);
            
            if (elements[0].length !==2 || h < 0 || h > 23) {
                return false;
            }
            if (elements[1].length !==2 || m < 0 || m > 59) {
                return false;
            }
            if (elements[2].length !==2 || s < 0 || s > 59) {
                return false;
            }

            return true;
        },
        
        /*
         * Return true if input string is a valid url
         */
        isUrl: function(str) {
            
            if (str && typeof str === "string") {
                
                var s = str.substr(0,7);
                
                if (s === 'http://' || s === 'https:/' || s === 'ftp://') {
                    return true;
                }
            }
                
            return false;
            
        },
        
        /**
         * Return a "proxified" version of input url
         *
         * @input {String} url : url to proxify
         * @input {String} returntype : force HTTP header to the return type //optional
         */
        proxify: function(url, returntype) {
            return this.getAbsoluteUrl(msp.Config["general"].proxyUrl)+this.abc+(returntype ? "&returntype="+returntype : "")+"&url="+encodeURIComponent(url);
        },
        
        /**
         * Return a random color hex value
         */
        randomColor: function(){
            var colors = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"],
            d1 = "",
            d2 = "",
            d3 = "",
            i;
            for (i=0;i<2;i++) {
                d1=d1+colors[Math.round(Math.random()*15)];
                d2=d2+colors[Math.round(Math.random()*15)];
                d3=d3+colors[Math.round(Math.random()*15)];
            }
            return '#'+d1+d2+d3;
        },

        /**
         * Parse a string containing keys between brackets {} and replace these
         * keys with obj properties.
         * Example :
         *      str = "Hello my name is {name} {surname}"
         *      obj = {name:"Jerome", surname:"Gasperi"}
         *
         *      will return "Hello my name is Jerome Gasperi"
         *
         * @input {String} str : string with keys to process
         * @input {Object} obj : object containing the property keys
         */
        replaceKeys: function (str, obj) {

            /*
             * Paranoid mode
             */
            obj = obj || {};

            /*
             * Be sure that str is a string
             */
            if (typeof str === "string") {

                /*
                 * Replace all {key} within string by obj[key] value
                 */
                return str.replace(/{+([^}])+}/g, function(m,key,value) {
                    return obj[m.replace(/[{}]/g, '')];
                });
            }

            return str;

        },
        
        /**
         * Repare a wrong URL regarding the following principles :
         *
         *  - If no "?" character is found, returns url+"?"
         *  - else if last character is "?" or "&", returns url
         *  - else if a "?" character is found but the last character is not "&", returns url+"&"
         */
        repareUrl: function(url) {
            if (!url) {
                return null;
            }
            var questionMark = url.indexOf("?");
            if (questionMark === -1) {
                return url+"?";
            }
            else if (questionMark === url.length - 1 || url.indexOf("&",url.length - 1) !== -1) {
                return url;
            }
            else {
                return url+"&";
            }
        },

        /**
         * Return a string*ified* version of
         * a jSON object
         */
        serialize: function(obj) {

            var t = typeof (obj);
            if (t !== "object" || obj === undefined) {
                if (t === "string") obj = '"'+obj+'"';
                return String(obj);
            }
            else {
                var n, v, json = [], arr = (obj && obj.constructor === Array);
                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (t === "string") {

                        /*
                         * "If the string contains no control characters, no quote characters, and no
                         * backslash characters, then we can safely slap some quotes around it.
                         * Otherwise we must also replace the offending characters with safe escape
                         * sequences."
                         *
                         * JSON.js - Douglas Crockford : https://github.com/douglascrockford/JSON-js/blob/master/json2.js
                         * 
                         */
                        v = '"'+v.replace(this.escapable, function (a) {
                            var c = msp.Util.meta[a];
                            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                        }) +'"';

                    }
                    else if (t === "object" && v !== undefined) {
                        v = msp.Util.serialize(v);
                    }
                    if (t !== "function") {
                        json.push((arr ? "" : '"' + n + '":') + String(v));
                    }
                }
                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },

        /**
         * Reduce the length of a string "str" to "sizemax"
         *
         * @input {String} str : String to reduce
         * @input {Integer} sizemax : maximum length of the returned string
         * @input {boolean} end : 'true'  the end of str is shrinked
         *                        'false' the middle of str is shrinked
         */
        shorten: function(str,sizemax,end) {
            str = this.htmlEntitiesDecode(str);
            end = end || false;
            if (str) {
                var size = str.length;
                
                /*
                 * Input string length is lower than sizemax.
                 * Return input string
                 */
                if (size <= sizemax) {
                    return str;
                }

                /*
                 * Shrink the end of the input string
                 */
                if (end) {
                    return str.substring(0,sizemax - 3)+"...";
                }

                /*
                 * Default : shrink the middle of input string
                 */
                var halfsize = Math.round(sizemax/2);
                return str.substring(0,halfsize-1)+"..."+str.substring(size-halfsize+3);
            }
            return str;
        },
        
        /**
         * Sort input array in alphabetical order
         * using key property
         */ 
        sortArray:function(arr, key) {
            if (typeof arr === "object" && arr.length && key) {
                var scope = this;
                arr.sort(function(a,b){
                    var nameA = scope._(a[key]).toLowerCase();
                    var nameB = scope._(b[key]).toLowerCase();
                    if (nameA < nameB) {
                        return -1
                    }
                    if (nameA > nameB) {
                        return 1
                    }
                    return 0
                });
            }   
        },

        /**
         * Eval a stringified jSON string
         * (see serialize)
         */
        unserialize: function(str) {
            //return new Function("return " + str === "" ? '""' : str)();
            return eval("(" + (str === "" ? '""' : str) + ")");
        },
        
        /*
         * Return the following html string
         *  <div id="i" class="l">c</div>
         *  
         *  TODO : remove this function ??
         */
        w: function(o) {
            if (typeof o !== "object") {
                return '';
            }
            return '<div' + (o.id ? ' id="' + o.id + '"' : '') + (o.cl ? ' class="' + o.cl + '"' : '') +'>' + o.co + '</div>';
            
        }
    };

})(window, window.msp, window.document);