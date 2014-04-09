/*
	Gasotracker v1.0.0 
	Author: Roland Kalocsaven
	Email: rolandka@live.com
*/

(function( window, document, undefined) {

	var defaults,
		build,
		utility,
		gst,
		logger,
		trackerPrototype,
		trackerObjs = {
			facebook: FacebookTracker,
			twitter: TwitterTracker,
			pinterest: PinterestTracker, 
			instagram: InstagramTracker,
		};
		
	/*
	** Default config
	*/		
	defaults = {
		sandbox : false,
		logger : false,
		facebook:{
			enabled : false,
			logger : false,
			appId : '',
			apiEvents : {'like' :'edge.create', 
						  'dislike' : 'edge.remove',
			},
			gstEvents : ['feed']
		},
		twitter:{
			enabled : false,
			logger: false,
			apiEvents: ['click','tweet','retweet','follow','favorite'],
			gstEvents: [],
		},
		pinterest:{
			enabled : false,
			logger: false,
			apiEvents: [],
			gstEvents: ['pin','follow'],
		},
		instagram:{
			enabled : false,
			logger: false,
			apiEvents: [],
			gstEvents: ['badge'],
		}									
	};	
		
	build = function (){
		this.elements = document.querySelectorAll('.gst-event');
		if(document.querySelectorAll('.gst-event').length == 0)
			console.log("Gasotracker: No elements found with class name 'gst-event'");
		for (obj in trackerObjs) {
		  if (trackerObjs.hasOwnProperty(obj)) {
			utility.extendObj(trackerObjs[obj], trackerPrototype);
			var Instance = this[obj] = new trackerObjs[obj](this, this.settings[obj], utility.
			capitalizeFirstChar(obj)+"Tracker");
			if (typeof Instance.initOnLoad() === 'function') {
				Instance.initOnLoad()
			}
		  }
		}
	};
	

	/*
	** Prototypes
	*/	
	trackerPrototype = function(){
		this.name = "";
		this.settings = {};
	}
	trackerPrototype.prototype.initOnLoad = function() {
		if (this.settings && this.settings.enabled === true){
				logger.log(this,'enabled');
			this.init();
		}
	};
	
	/*
	** Miscellaneous
	*/
	logger = {
		stack : {
			enabled: "Tracking is enabled.",
			eventtrack: "Tracking %s event",
			eventfire: "%s event has been triggered and sent to Google Analytics",
		},	
		log : function(tracker, msg, arg){
			if(!tracker.settings.logger) return
			console.log(tracker.name+": "+utility.sprintf( logger.stack[msg]||msg, arg ))
		}
	}
		
	utility = {
		getParameterByName : function(n,p) {
			var match = RegExp('[?&]'+n+'=([^&]*)').exec(p);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		},
		extendObj : function(cObj, pObj) {
			cObj.prototype = pObj.prototype;
		},
		capitalizeFirstChar : function(s){
			return s.charAt(0).toUpperCase() + s.substring(1);	
		},
		sprintf : function (f){
			for(var i=1;i<arguments.length;i++) {
				f = f.replace(/%s/, arguments[i]);
			}
			return f;
		},
		mergeRecursive : function(to, so) {
			for (var p in so) {
				try {
					to[p]=(so[p].constructor == Object)?this.mergeRecursive(to[p],so[p]):so[p]; 
				}catch(e){
					to[p]=so[p];
				}
			}
			return to;	
		},
		mergeSettings : function(to, so) {
			this.settings = utility.mergeRecursive(to,so)
			//As we dont want to merge recursively facebook's apiEvents object
			if (so.facebook && so.facebook.apiEvents) this.settings.facebook.apiEvents = so.facebook.apiEvents;	
			//Global logger config
			if(so.logger){
				for (var p in this.settings) {
					try{this.settings[p].logger = so.logger;}catch(e){}
				}
			}
			//Global sandbox config
			if(so.sandbox){
				for (var p in this.settings) {
					try{this.settings[p].sandbox = so.sandbox;}catch(e){}
				}
			}
			return this.settings;
		}
	}

		
	
	
	/*
	**Tracker objects
	**
	**Facebook tracker
	*/
	function FacebookTracker(obj, settings, name) {
		var _this = this;
		this.name = name;
		this.settings = settings;
		this.init = function(){
			if (!settings.appId || typeof settings.appId !== 'string') 
				throw name+": 'facebook.appId' is not defined";
			
			if (!settings.hasOwnProperty('apiEvents') || typeof settings.apiEvents !== 'object')
				throw name+": 'facebook.apiEvents' has to be an object";	
				
			window.fbAsyncInit = function() {
				FB.init({appId : settings.appId, status : true, xfbml : true, session : {}, cookie : true});
					logger.log(_this,'JS-SDK is loaded and FB initialized.');
				
				FB.Event.subscribe('xfbml.render', function() {
					logger.log(_this,'Social plugins are loaded.');
				});
				
				Object.keys(settings.apiEvents).forEach(function(ae){
					FB.Event.subscribe(settings.apiEvents[ae], function(url, elm) {
						if(!settings.sandbox) ga('send', 'social', 'facebook', ae, url);
						logger.log(_this,'eventfire', ae);
						
					});
					logger.log(_this,'eventtrack', ae);
				});
				
				if (obj.elements!=0) {
					settings.gstEvents.forEach(function(gst){
					for (var i=0;i<obj.elements.length;++i){
						if(obj.elements[i].getAttribute('data-gst-fb')===gst){
							var addEvent = 'attachEvent';
							if(obj.elements[i].addEventListener) addEvent = 'addEventListener';
							obj.elements[i][addEvent]("click", function(e) { 
								e.preventDefault();								
								FB.ui(
								  {
								   method: gst,
								   name: e.target.getAttribute('data-gst-fb-name')||document.title,
								   caption: e.target.getAttribute('data-gst-fb-caption'),
								   description: e.target.getAttribute('data-gst-fb-desc'),
								   link: e.target.href||window.location.href,
								   picture: e.target.getAttribute('data-gst-fb-pic')
								  },
								  function(response) {
									if (response && response.post_id) {
									  if(!settings.sandbox) ga('send', 'social', 'facebook', gst, e.target.href||window.location.href);
									  logger.log(_this,'eventfire',gst);
									}
								  }
								);
							});
							logger.log(_this,'eventtrack',gst);
						};
					}
					});
				}
			};
		};
	};
	
	/*
	**Twitter tracker
	*/
	function TwitterTracker(obj, settings, name) {
		var _this = this;
		this.name = name;
		this.settings = settings;
		this.init = function(){
			if (typeof twttr == 'undefined') 
				throw name+": Please include Twitter's widgets.js before gasotracker.js";
			
			if (!settings.apiEvents || !(settings.apiEvents instanceof Array))
				throw name+": 'twitter.apiEvents' has to be and array";	
			
			twttr.ready(function (twttr) {
				settings.apiEvents.forEach(function(ae){
					twttr.events.bind(ae, function(e){
						if(!e) return;
						this.url = utility.getParameterByName('url', e.target.href)||window.location.href;
						if(!settings.sandbox) ga('send', 'social', 'twitter', e.type, this.url);
						logger.log(_this,'eventfire',e.type);						
					});
					logger.log(_this,'eventtrack',ae);						
				});
			});
		};
		
	};

	
	/*
	**Pinterest tracker
	*/
	function PinterestTracker(obj, settings, name) {
		var _this = this;
		this.name = name;
		this.settings = settings;
		this.init = function(){
			if (!settings.gstEvents || !(settings.gstEvents instanceof Array))
				throw name+": 'pinterest.gstEvents' is not an array";	
		
			if (obj.elements!=0) {
				settings.gstEvents.forEach(function(ge){
					for (var i=0;i<obj.elements.length;++i){
						if(obj.elements[i].getAttribute('data-gst-pin')===ge){
							var addEvent = 'attachEvent';
							if(obj.elements[i].addEventListener) addEvent = 'addEventListener';
							obj.elements[i][addEvent]("click", function(e) { 
									e.preventDefault();
									this.url = utility.getParameterByName('url', e.target.href)
									if(ge=='follow') this.url = e.target.href;
									if(!settings.sandbox) ga('send', 'social', 'pinterest', ge, this.url);
									
									var win = window.open(e.target.href,'Pinterest','scrollbars=no,menubar=no,width=600,height=380,resizable=yes,toolbar=no,location=no,status=no');
									
									logger.log(_this,'eventfire',ge);
							});
							
							logger.log(_this,'eventtrack',ge);
						};
					}
				});
			}
		};
	};
	
	/*
	**Instagram tracker
	*/
	function InstagramTracker(obj, settings, name) {
		var _this = this;
		this.name = name;
		this.settings = settings;
		this.init = function(){
			if (!(settings.gstEvents instanceof Array))
				throw name+": 'instagram.gstEvents' is not an array";	
			
			if (obj.elements!=0) {
				settings.gstEvents.forEach(function(ge){
					for (var i=0;i<obj.elements.length;++i){
						if(obj.elements[i].getAttribute('data-gst-inst')===ge){
							var addEvent = 'attachEvent';
							if(obj.elements[i].addEventListener) addEvent = 'addEventListener';
							obj.elements[i][addEvent]("click", function(e) { 
									this.url = e.target.href;
									if(!settings.sandbox) ga('send', 'social', 'instagram', ge, this.url);
									logger.log(_this,'eventfire',ge);
							});
							
							logger.log(_this,'eventtrack',ge);
						};
					}
				});
			}
		};
	};
	
	
	
	gst = {
		init: function(settings){
			if(typeof ga == 'undefined') 
				throw "Gasotracker: Please include Google's Universal Analytics code. (universal.js)";
			
			this.settings = utility.mergeSettings(defaults, settings||{});
			if(this.settings.sandbox) console.log("Gasotracker: Sandbox mode enabled.");
			
			build.call(this);
			
			return this;
		}	
	}
	
	gasotracker = function(settings) {
		window.gasotracker = gst.init(settings);
	};
	
	
	
}( window, document));