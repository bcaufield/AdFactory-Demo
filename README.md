# AdFactory-Demo

##Targeting Rules
- An ad is either targeted by Section OR Position but not both.

###SECTION:
- If section targeting is turned on, the target = section.
- Sections come from the feed and are processed to remove any spaces, punctuation and are all lower case.
- Sections have a “sec_” prefix.

###POSITION
- Targets by position have a “pos_” prefix but for now this is only used for app-load.
- Scroll Positions don’t have a prefix (but they should for consistency).

###USER ROLE
- Roles are added to all targets or sections as a suffix, except for “shownews”.

###ANDROID
- On android, a “_droid” suffix is added for Banners and Leaderboards since they need “smart” banners.

##AdFactory Interface
    createAd(options)
           where options = adtype, sectionTargeting, target, startup, scrollPosition and extras

    createInterstitial(options)
           where options = adtype, sectionTargeting, target, startup, scrollPosition and extras

    showInterstitial(options)
        where options = onClose()

###Config Functions:
    setAdUnit(adUnit)
    setUserRole(userRole)
These function expose the config variables for the factory. This approach is more convenient for testing but we may also want to use it in production to make the factory less dependent on the global properties used in previous versions of the app.

##USAGE
###CREATING AN AD
To create a banner ad for the Show News section on a phone:

    var ad = AdFactory.createAd({
        adType : 22, 
        target : “shownews”,
        sectionTargeting : true
    });


###CREATING AN INTERSTITIAL AD

To show an interstitial ad on startup:

    var ad = AdFactory.createInterstitial({
       target : "app-load",
       startup : true,
       sectionTargeting : false,
       error : function(e) {
          Ti.API.info("Could not fetch advert");
       }
    });

Since the section targeting is false, the target is used as-is, without any of the translation associated with a section. The “startup” property is used to indicated that the ad is intended to be shown immediately. The error function allows the app to move on if there are no ads available.

To create an interstitial ad but now show it:

    var ad = AdFactory.createInterstitial({
       target : “shownews”,
       startup : false,
       sectionTargeting : true,
       scrollPosition : 0,
       error : function(e) {
          Ti.API.info("Could not fetch advert");
       }
    });

Then after the user scrolls the required number of times the app would call to show the ad like this:

    AdFactory.showInterstitialAd({
       onClose : function() {
          Ti.API.info("ad closed");
       }
    });

EXTRAS
The extras feature allows an ad to be targeted by a key:value pair. A working example is 

    AdFactory.setAdUnit(“/6236286/DFP-mode”);
    var ad = AdFactory.createAd({
       adType : 22, 
       target : “”,
       sectionTargeting : false
       extras = {"mode":"2"}
    });

According to the ad ops, this feature is used mainly to refine a target that has already been described by an adunit string like:

    /3834/penton_testapp/sec_bav

and then the extras could be used to specify the user role and scroll position like this:

    extras = {
       "scroll" : "first"
       "reg" : "aw"
    }

For now, the AdFactory will accept any extras that are passed in and forward them to the ad module, but if not, it will create an extras object for the current section, user role and scroll position (if supplied).

    extras = {
       "sec":"bav",
       "reg":"aw"
       "scroll":"scrollfirst",
    }

All of these items may not be required, for instance, we could set the section with adunit string and then scroll position and user role via the extras but we will need to check with the ad ops to see what works for them.

