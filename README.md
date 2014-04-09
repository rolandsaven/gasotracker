#gasotracker

gasotracker.js may be freely distributed under the [MIT license](http://opensource.org/licenses/MIT).

###Description:

Gasotracker is a plugin written in JavaScript that observes the social interactions on a website and sends it to Universal Analytics. It supports Facebook, Twitter, Pinterest, and Instragram.

###Features:

- works with Universal Analytics (universal.js)
- facebook: like, dislike, and feed(share) events
- tweet: click, tweet and follow events 
- pinterest: pin and follow events
- instagram: badge event
- sandbox mode
- logger


###Basic Installation

Include the Universal Analytics snippet before the closing head tag. Download and extract the [latest zip package](https://github.com/rolandkal/gasotracker/archive/master.zip) from Github and copy gasotracker.js into your project, then include them using the method specified below that is appropriate. I would recommend to place it just before the closing body tag. By default, everything is disabled.
```html
<script type="text/javascript" src="/js/gasotracker.js"></script>
<script type="text/javascript">gasotracker()</script>
```

####Facebook:
We use Facebook’s API to track events. It is necessary to have an Application ID.
You have to include their javascript snippet manually on the site. They say to place it just after the opening body tag

```html
<div id="fb-root"></div>
<script>
 (function(d, s, id){
         var js, fjs = d.getElementsByTagName(s)[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/en_US/all.js";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
</script>
```

Remember not to call FB.init() as the tracker will do that for you. Just provide a valid Application Id as below.

```javascript
gasotracker({
	facebook:{
		enabled : true,
		appId:'12345678912346679',
	}
});
```

If you would like to track the feed(share) event you have to add the class ‘gst-event’ and the attribute data-gst-fb="feed" to an element you would like to share with. 

This can be further customizable. See the following example
```html
<a class="fb gst-event" data-gst-fb="feed" data-gst-fb-pic="http://sample.com/sample.jpg" target="_blank" href="http://currenturl.com" data-gst-fb-desc="description" data-gst-fb-cap="caption" data-gst-fb-name="name"></a>
```

####Twitter:

We use their API’s to track events. All you have to do is to include Twitter’s widget.js before calling the tracker. You really don’t want to track the "click" event, so you can remove it.

```html
<script type="text/javascript" src="//platform.twitter.com/widgets.js"></script>	
<script type="text/javascript" src="/js/gasotracker.js"></script>
<script type="text/javascript">
	gasotracker({
		twitter:{
			enabled : true,
			apiEvents: ['click','tweet','retweet','follow','favorite'],
		},
});
</script>
```

####Pinterest and Instagram:

Neither of them has API that would support callbacks after an event fired, so we are basically tracking a click event on an element. I know, it doesn’t provide the most accurate information. 

All you have to do is to enable the tracker and add the appropriate class name and data attribute for an element.

for pinterest:
```html
<a class="pin gst-event" data-gst-pin="pin" href="http://www.pinterest.com/pin/create/button/?url=http://currenturl.com&media=http://currenturl.com/img/currentimage.jpg&description=Something to say"></a>
```

for instagram:
```html
<a class="inst gst-event" data-gst-inst="badge" target="_blank" href="http://instagram.com/name?ref=badge"></a>
```

Do not include pinterest's pin.js, it removes the ability to add an event listener to the element.


###Miscellaneous:
Enables logger and sandbox mode.
```javascript
gasotracker({
	sandbox : false,
	logger : false,
	instagram: {
		enabled:true,
	},	
	pinterest: {
		enabled:true,
	}
})
```
###TODO
- Add support for other social networks
- Ability to have a pinmarklet if needed 
- Better way to initialize FacebookTracker after FB loaded
- Support for Classic Google Analytics (ga.js) (not sure)
- Support for other Analytics (e.g.: Flurry Analytics)

###License
This plugin is released under the permissive MIT license. Your contributions are always welcome.
