var AdFactory = require('AdFactory');

function handleLoadBanner() {
	var bannerad = null;
	if (Alloy.isHandheld) {
		bannerad = Alloy.Globals.handleLoadAd(AdFactory.adTypes.BANNER_HANDHELD);
	} else {
		bannerad = Alloy.Globals.handleLoadAd(AdFactory.adTypes.BANNER_TABLET);
	}
	if (bannerad) {
		$.adContainer.add(bannerad);
	}	
}

function handleLoadInterstitial() {
	Alloy.Globals.handleLoadInterstitial();
}

function handleLoadLogo() {
	var logoad = Alloy.Globals.handleLoadAd(AdFactory.adTypes.LOGO_AD);
	if (logoad) {
		$.logoContainer.add(logoad);
	}
}

function handleLoadBlock() {
	var blockad = Alloy.Globals.handleLoadAd(AdFactory.adTypes.BOX_TABLET);
	if (blockad) {
		$.blockContainer.add(blockad);
	}
}

function handleShowInterstitial() {
	AdFactory.showInterstitial({
		onClose : function() {
			Ti.API.info("ad closed");
		}
	});
}


