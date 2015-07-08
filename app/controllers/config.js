var AdFactory = require('AdFactory');
var position = "app-load";

if (Alloy.isTablet) {
	firstLoadInterstitial();
}

function handleLoadAd(adType) {
	Ti.API.info("handleLoadAd");
	
	// initialize the adunit and user role
	AdFactory.setAdUnit($.adunit.value);
	AdFactory.setUserRole($.userRole.value.toUpperCase());
	
	var extras = {};
	if ($.useKeyValue.value === true) {
		extras[$.key.value] = $.value.value;
	}
	Ti.API.info("extras = " + JSON.stringify(extras));
	
	var ad = AdFactory.createAd({
		adType : adType, 
		target : $.target.value.toLowerCase(),
		sectionTargeting : $.targetsection.value,
		extras : extras,
	});
	return ad;	
}
Alloy.Globals.handleLoadAd = handleLoadAd;

function handleLoadInterstitial() {
	Ti.API.info("handleLoadInterstitial");
	
	// initialize the adunit and user role
	AdFactory.setAdUnit($.adunit.value.toLowerCase());
	AdFactory.setUserRole($.userRole.value.toUpperCase());
	
	var extras = {};
	if ($.useKeyValue.value === true) {
		extras[$.key.value] = $.value.value;
	}
	Ti.API.info("extras = " + JSON.stringify(extras));
	
	var ad = AdFactory.createInterstitial({
	    target : $.target.value.toLowerCase(),
	    startup : false, 
	    sectionTargeting : $.targetsection.value,
	    scrollPosition : $.scrollposition.value,
	    extras : extras,
		error : function(e) {
	        Ti.API.info("Could not fetch advert: " + JSON.stringify(e));
	    }
	});
}
Alloy.Globals.handleLoadInterstitial = handleLoadInterstitial;

function firstLoadInterstitial() {
	Ti.API.info("firstLoadInterstitial, target = app-load");
	
	// initialize the adunit and user role
	AdFactory.setAdUnit($.adunit.value.toLowerCase());
	AdFactory.setUserRole($.userRole.value.toUpperCase());
	
	var ad = AdFactory.createInterstitial({
	    target : "app-load",
	    startup : true,
	    sectionTargeting : false,
	    error : function(e) {
	        Ti.API.info("Could not fetch advert: " + JSON.stringify(e));
	    }
	});
}

