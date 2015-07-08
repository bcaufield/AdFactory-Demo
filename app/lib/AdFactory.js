/*
 * Ad Targeting Rules

- A page is either targeted by Section OR Position but not both.

SECTION:
- If section targeting is turned on, the target = section.
- Sections come from the feed and are processed to remove any spaces and punctuation and are all lower case.
- Sections have a “sec_” prefix.

POSITION
- Targets by position have a “pos_” prefix but for now this is only used for app-load.
- Scroll Positions don’t have a prefix (but they should for consistency).

USER ROLE
- Roles are added to all targets or sections as a suffix, except for “shownews”.

ANDROID
- On android, a “_droid” suffix is added for Banners and Leaderboards since they need “smart” banners.

 */

var Alloy = require('alloy'), _ = require("alloy/underscore")._, Backbone = require("alloy/backbone"), Dfp = require('ti.dfp'), Util = require('Util'),
	inter_received = false,
	ad,
	interstitialAd,
	//baseAdUnit = "/3834/penton_testapp",
	baseAdUnit = "/3834/m.app.aviationweek_2.home",
	logoContainerView,
	userRolesArray = Ti.App.Properties.getObject("awinUserRoles", []),
	userRolesString = '',
	closeAdCallback,
	isStartup = false;

/* These are the public ad type constants */
var adTypes = {
    BANNER_HANDHELD : 22,
    BANNER_TABLET : 23,
    BOX_TABLET : 24,
    INTERSTITIAL : 25,
    LOGO_AD : 26
};
exports.adTypes = adTypes;

/* These function expose the config variables for the factory 
 * This approach is more convenient for testing but we may want to
 * use it to make the factory less dependent on global properties
 * */ 
exports.setAdUnit = function(adUnit) {
	baseAdUnit = adUnit;
};

exports.setUserRole = function(userRole) {
	// we are limiting the user to one role for testing
	userRolesArray = [];
	if (userRole !== "") {
		userRolesArray.push(userRole);	
	}
};

/* This function is one of the main interfaces for the factory:
 * options = (adtype, sectionTargeting, target, startup, scrollPosition, extras)
 */
exports.createAd = function(options) {
	ad = null;
    var adUnit = setAdUnit(options);
    if (!options.extras) {
		options.extras = {};
	}
	var extras = setExtras(options);
	switch(options.adType) {
        case adTypes.BANNER_HANDHELD:
            ad = Dfp.createView({
            	width: Ti.UI.FILL,
				height : Ti.UI.SIZE,
                adWidth : 320,
                adHeight : 50,
                adUnitId: adUnit,
                extras : extras                
            });
            ad.addEventListener('receivead',function(e){
				Ti.API.info("BANNER_HANDHELD receivead, e = " + JSON.stringify(e));
				if (e.error) {
					Ti.API.info("BANNER_HANDHELD Error receiving ad" + JSON.stringify(e.error));
					ad.applyProperties({
						width : "320dp",
						height : "50dp",
						backgroundImage : "/images/defaultAd_tablet_600.png",
					});								
				} else {
                	Ti.API.info("BANNER_HANDHELD receivead OK");
					ad.applyProperties({
	            		width : '320dp',
	                	height : '50dp',
	                });
				}				
			});
            break;
        case adTypes.BANNER_TABLET:
			ad = Dfp.createView({
                width: Ti.UI.FILL,
				height : Ti.UI.SIZE,
                adWidth: Alloy.Globals.is7inch ? 600 : 728,
				adHeight: Alloy.Globals.is7inch ? 90 : 90,
                adUnitId: adUnit,
                extras : extras,
            });
            ad.addEventListener('receivead',function(e){
				Ti.API.info("BANNER_TABLET receivead, e = " + JSON.stringify(e));
				if (!e.error) {
					Ti.API.info("BANNER_TABLET receivead OK");									
				}
				if (Alloy.Globals.is7inch) {
					if (e.error) {
	                	Ti.API.info("BANNER_TABLET Error receiving ad" + JSON.stringify(e.error));
						ad.applyProperties({
							width : "600dp",
							height : "90dp",
							backgroundImage : "/images/defaultAd_tablet_600.png",
						});
                    } else {
                    	ad.applyProperties({
                    		// commented out for demo
	                		//top : "6dp",
	                    	width : '600dp',
	                    	height : '90dp',
	                    });
					}
				} else {
					if (e.error) {
						Ti.API.info("BANNER_TABLET Error receiving ad" + JSON.stringify(e.error));
						ad.applyProperties({
							width : "728dp",
							height : "90dp",
							backgroundImage : "/images/defaultAd_tablet.png",
						});
                   	} else {
                   		ad.applyProperties({
                   			// commented out for demo
							//top : "19dp",
	                    	width : '728dp',
	                    	height : '90dp',
	                   	});
					}
				}
            });           	
            break;
        case adTypes.BOX_TABLET:
           	ad = Dfp.createView({
           		width: Ti.UI.FILL,
				height : Ti.UI.SIZE,
                adWidth : 300,
                adHeight : 250,
                adUnitId: adUnit,
                extras : extras,                
            });
            ad.addEventListener('receivead',function(e){
				Ti.API.info("BOX_TABLET receivead, e = " + JSON.stringify(e));
				if (e.error) {
					ad.applyProperties({
						width : "300dp",
						height : "250dp",
						backgroundImage : "/images/defaultAd_box.png",
					});
					Ti.API.info("BOX_TABLET Error receiving ad: " + JSON.stringify(e.error));								
				} else {
					Ti.API.info("BOX_TABLET receivead OK");
					ad.applyProperties({
		        		width : '300dp',
		            	height : '250dp',
		            });
				}				
			});
            break;
        case adTypes.LOGO_AD:
           	ad = Dfp.createView({
       		    width: Ti.UI.FILL,
				height : Ti.UI.SIZE,
                adWidth : 120,
                adHeight : 50,
                adUnitId: adUnit,
                extras : extras
           	});
           	ad.addEventListener('receivead',function(e){
				Ti.API.info("LOGO receivead, e = " + JSON.stringify(e));
				if (e.error) {
					ad.applyProperties({
						width : "120dp",
						height : "50dp",
						backgroundImage : "/images/defaultAd_logo.png",
					});
					Ti.API.info("LOGO Error receiving ad: " + JSON.stringify(e.error));									
				} else {
					Ti.API.info("LOGO receivead OK");
					ad.applyProperties({
	            		width : '120dp',
	                	height : '50dp',
	                });
				}	
      		});
            break;
    }
	
	ad.addEventListener('present',function(){
		Ti.API.info("ad is opened");
	});
	ad.addEventListener('dismiss',function(){
		Ti.API.info("ad is closed");
	});	
    return ad;
};

/* This function other main interfaces for the factory for requesting interstitial ads
 * options = (adtype, sectionTargeting, target, startup, scrollPosition, extras)
 */
exports.createInterstitial = function(options) {
    var sectionTargeting = ( _.isUndefined(options.sectionTargeting) ) ? "/3834/m.app.aviationweek_2.home" : options.sectionTargeting;
    var ad = null;
    var errorCallback = options.error;
    var isPortrtait = true;
    var adUnit = setAdUnit(options);
    if (!options.extras) {
		options.extras = {};
	}
    var extras = setExtras(options);
    
    
    /**
     * We are only supporting the portrait version of the ad for now
     */
    interstitialAd = Dfp.createInterstitial();
    
	if (interstitialAd) {
		if (extras.length) {
			// we have turned off the extras handling for now since the ads are not using them
			//interstitialAd.extras = extras;
		}
		if (options.startup) {
			isStartup = true;
		}
		interstitialAd.loadInterstitial(baseAdUnit);
	} else {
		interstitialAd = null;
		hideInterView(interstitialAd);
   		return interstitialAd;
	}
   	
    interstitialAd.addEventListener('receivead',function(e){
		Ti.API.info("interstitial ad received, e = " + JSON.stringify(e));
		if (e.error) {
			Ti.API.info("====>Interstitial ads failed to receive any ads ErrorCode===>" + JSON.stringify(e));
			hideInterView();
			if (options.error) {
				options.error();
			}	
		} else {
			Ti.API.info("====>Interstitial ads received and ready to be shown");
			//An interstitial ads has been received and is cached.
			//It is now save to show the interstitial ads
			setInterReceived({
				admobView : interstitialAd
			});				
		}
	});
	
	interstitialAd.addEventListener('dismiss',function(){
		Ti.API.info("====>Interstitial ads is closed");
		hideInterView();
		inter_received = false;
	});
	return interstitialAd;
};

/* This function builds the full adunit string with any appropriate targets
 * if sectionTargeting = true, it assumes the target IS the section,
 * if the section is ommited, it will use the global ad target
 * options = (adtype, sectionTargeting, target, startup, scrollPosition)
 */
setAdUnit = function (options) {
	Ti.API.info("setAdUnit, options = " + JSON.stringify(options));
	
	//var adUnit = Alloy.Globals.ThemeConfig.adUnit;
	// use local adUnit for testing - production uses the global one
    var adUnit = baseAdUnit;
    
    // default to baseAdUnit and no section
    var targetedAdUnit = adUnit;
    var section = "";
    
    // check to see if we are targeting by section
	var sectionTargeting = ( _.isUndefined(options.sectionTargeting) ) ? Alloy.Globals.ThemeConfig.sectionAdTargeting : options.sectionTargeting;
	if (sectionTargeting) {
		
		// if the section targeting is turned on, assume the target = section
		if (options.target) {
			section = Util.removePunctionationAndSpaces(options.target).toLowerCase();
	        if (section != '') {		
				options.section = Util.removePunctionationAndSpaces(options.target).toLowerCase();
			}
		}		
	}		    
      	
	var targets = setAdUnitTargets(options);
	
    if (targets.length) {
    	targetedAdUnit += '/' + setAdUnitTargets(options);
    }
	
    Ti.API.info("setAdUnit returned: " + targetedAdUnit);
    return targetedAdUnit;
};

/* This function is called by setAdUnit and does the bulk of the work building the adUnit target string
 * Options are the same as setAdUnit with the addition of "section" if the sectionTargeting is turned on
 */
setAdUnitTargets = function(options) {
	Ti.API.info("*** setAdUnitTargets options = " + JSON.stringify(options));
	var targets = '';
	var userRolesString = '';
	var sectionKey = '';	
	
	// Check to see if we were handed a section (only happens when section targeting is turned on)
	if (options.section) {
		sectionKey = setSectionKey(options.section);
		if (sectionKey.length) {
			// Adunit targets expect a "sec_" prefix - extras 
			targets = "sec_" + sectionKey; 
		}
		Ti.API.info("** section targets = " + targets);
	} else {
		switch (options.target) {
			case "app-load" :
				targets = "pos_app-load";
				break;
			default :
				targets = options.target;
				break;		
		}
		Ti.API.info("** position targets = " + targets);
	} 	
	
	// if there is a scroll position, it supercedes the section
	if (typeof options.scrollPosition != 'undefined' && options.scrollPosition != "") {
		Ti.API.info("options.scrollPosition = " + options.scrollPosition);
	
	    targets = setScrollPositionTargets(options.scrollPosition);
	    
	    // this is some exception handling for shownews, which isn't a section in the traditional sense
	    if (options.section == "shownews") {
	    	targets = targets + "_shownews";
	    }
		Ti.API.info("** scrollPosition targets = " + targets);
	}
    
    // check to see if we have any roles
    if (userRolesArray.length && options.section !== "shownews") {
    	var AWRoles = _.intersection(userRolesArray, ["AWST", "STU", "MRO", "DTE", "DTI"]); 
    	if (AWRoles.length) {   	
	    	piscesRolesString = AWRoles[0].toString();
	    	userRolesString = translatePiscesRoles(piscesRolesString);
	    }
    	if (userRolesString.length) {
    		var rolesKey = '';
    		if (targets.length) {	
	    		targets = targets + "_" + userRolesString;
			}
		}
    }
    
    if (OS_ANDROID) {
    	// we only need to ad the droid suffix for regular banners and leaderboards
	    if (options.adType === adTypes.BANNER_HANDHELD || options.adType === adTypes.BANNER_TABLET) {  	
	    	targets = targets + "_droid";
	    }
	}
    
    Ti.API.info("** end setUnitAdTargets = " + targets);
    return targets; 
};

/* This function creates an array of key:value pairs that can be sent with an ad request to filter targets
 * The usage for this is still under development - it should be used to filter/refine an adUnit target string
 * Business Cases for this feature need to be further defined
 * options (target, section, sectionTargeting, scrollPosition, extras)
 */
setExtras = function(options) {
	Ti.API.info("*** setExtras options = " + JSON.stringify(options));
	var extras = {};
	
	// check to see if we have been handed extras
	if (_.isEmpty(options.extras) === false) {
		Ti.API.info("using passed in extras");		
		extras = options.extras;
	} else {
		Ti.API.info("creating extras");
		// check to see if section targeting is turned on
	    var sectionTargeting = ( _.isUndefined(options.sectionTargeting) ) ? Alloy.Globals.ThemeConfig.sectionAdTargeting : options.sectionTargeting;
		
		if (sectionTargeting) {
			Ti.API.info("sectionTargeting is true");
			var section = "";
	    	var sectionKey = "";
	    	
	    	// if the section targeting is turned on, assume the target = section
			if (options.target) {
				Ti.API.info("target was supplied");
		        section = Util.removePunctionationAndSpaces(options.target).toLowerCase();
		        if (section != '') {
		        	sectionKey = setSectionKey(section);
		        	Ti.API.info("sectionKey = " + sectionKey);
			    }
			}
			
			// if using the target doesn't return a section key, try the global ad target
			if (sectionKey === "") {
				Ti.API.info("trying the global ad target");
		    	section = Util.removePunctionationAndSpaces(Alloy.Globals.currentAdTarget).toLowerCase();
		    	if (section != '') {
		    		sectionKey = setSectionKey(options.target);
		    		Ti.API.info("Global sectionKey = " + sectionKey);
		    	}
			}
			if (sectionKey !== "") {
	        	extras['sec'] = sectionKey;
	       	}
	    }    	
	    
	    if (typeof options.scrollPosition != 'undefined') {
	    	
	    	var position = setScrollPositionTargets(options.scrollPosition);
	    	Ti.API.info("scrollPosition = " + position);
	    	if (position) {
	    		extras['scroll'] = position;
	    	}	    
		} 
		
    	if (userRolesArray) {
			if (userRolesArray.length && section !== "hometoday" && section !== "homeleader" && section !== "home" && section !== "shownews") {
				var AWRoles = _.intersection(userRolesArray, ["AWST", "STU", "MRO", "DTE", "DTI"]);    	
		    	var piscesRolesString = AWRoles[0].toString();
		    	userRolesString = translatePiscesRoles(piscesRolesString);
		    	Ti.API.info("userRolesString = " + userRolesString);
		    	if (userRolesString !== "") {
		    		extras['reg'] =  userRolesString;
		    	}
		    }
		}
	}    
	Ti.API.info("** end setExtras = " + JSON.stringify(extras));
	return extras; 
};

/* This function returns a url-safe string that is used to target html ads
 * The use case for this is also less defined - it is currently not used to my knowledge and is included here
 * mostly as a reminder for how the characters are escaped
 * Options = (target, section)
 */
setTargets = function(options) {
	Ti.API.info("*** setTargets options = " + JSON.stringify(options));
	var extras = '';
	var userRolesString = '';
	
	// Check to see if we were handed a target
	if (options.target) {
		extras = options.target;
	} else {
		if (options.extras) {
			extras = options.extras;
		}	
	}
	if (options.section) {
		var sectionKey = "keyvalue%3D" + options.section;
		if (extras.length) {
			extras = extras + "%26" + userRolesString;
		} else {
			extras = sectionKey; 
		}
	}
	
    // check to see if we have any roles
    if (userRolesArray.length) {
    	userRolesString =  "reg%3D" + userRolesArray.toString().replace(/,/g ,"%26reg%3D");    		
    }
	
	if (userRolesString.length) {
    	if (extras.length) {
    		extras = extras + "%26" + userRolesString;
		} else {
			extras = userRolesString;
		}
	} 
    return extras; 
};


/* This is called by a view when it is time to show an interstitial
 * Options = (onClose())
 */
exports.showInterstitial = function(options) {
	if (inter_received) {
		
		// pass the local ad object to the function  
		options.admobView = interstitialAd;
	
		//show interstitial ads but only when it is ready to be shown
		showInterView(options);
	} else {
		
		// if the ad has not been received, call the onClose event to do any cleanup
		if (options.onClose) {
			options.onClose({
				error : "No ad received"
			});
		}
	}
};

/* This function is called by the ad received event listener   
 * Options = (admobView)
 * NOTE: isStartUp is a module level variable that is set when the initial ad request is sent
 */
function setInterReceived(options) {
	inter_received = true;
	if (isStartup) {
		showInterView({admobView : options.admobView});		
	}
}

/* This is the local functon for showing an interstital ad
 * it assumes that the ad has been received
 * Options = (admobView)
 */ 
function showInterView(options) {
	Ti.API.info("Tablet.showInterView(), inter_received = " + inter_received);
	Ti.API.info("options = " + JSON.stringify(options));
    var admobView;
    
    if (options) {
    	if (options.admobView) {
    		admobView = options.admobView;
    	}
    	if (options.onClose) {
	    	closeAdCallback = options.onClose; 	
	    }
    }
    if (admobView) {
    	admobView.showInterstitial();
		isStartup = false;
    }    
}

/* This is called by the ad closed event listener
 * The main purpose is to reset local vars and call any on close function
 */
function hideInterView(interstitialAd) {
	Ti.API.info("Tablet.hideInterView()");
	appLoad = false;
   	inter_received = false;
   	interstitialAd = null;
    if (closeAdCallback) {
    	Ti.API.info("closeAdCallback");
    	closeAdCallback();
    } 
}

/* This function takes the legacy role strings and translates them to the new pisces style
 * Ad Ops *should* migrate to using these new strings 
 */
function translatePiscesRoles(piscesRolesString) {
	var userRolesString = "";
	
	switch (piscesRolesString) {
		case "AWST" :
			userRolesString = "aw";
			break;
		case "STU" :
			userRolesString = "aw_stu";
			break;
		case "MRO" :
			userRolesString = "aw_mro";
			break;
		case "DTE" :
			userRolesString = "aw_dt";
			break;
		case "DTI" :
			userRolesString = "aw_dt";
			break;    			
	}
	return userRolesString;
}

/* This function takes the current section string minus any punctuation and spaces and
 * translates it to the ad ops-friendly string
 */ 
function setSectionKey(section) {
	var sectionKey = "";
	
	switch (section) {
		case "defense" :
			sectionKey = "defense";
			break;
		case "space" :
			sectionKey = "space";
			break;	
		case "technology" :
			sectionKey = "tech";
			break;
		case "mro" :
			sectionKey = "mro";
			break;
		case "businessaviation" :
			sectionKey = "bav";
			break;
		case "commercialaviation" :
			sectionKey = "cav";
			break;
		case "hometoday" :
			sectionKey = "home_today";
			break;
		case "home" :
			sectionKey = "homeleader";
			break;
		case "weeklyroundup" :
			sectionKey = "weeklyroundup";
			break;
		case "homepagedaytopics" :
			sectionKey = "weeklyroundup";
			break;					
		case "weeklyarchives" :
			sectionKey = "weeklyarchives";
			break;
		case "washingtonoutlook" :
			sectionKey = "opwash";
			break;
		case "grahamwarwick" :
			sectionKey = "warwick";
			break;
		case "billsweetman" :
			sectionKey = "sweetman";
			break;
		case "guynorris" :
			sectionKey = "norris";
			break;
		case "frankmorringjr" :
			sectionKey = "morring";
			break;
		case "amybutler" :
			sectionKey = "butler";
			break;
		case "joeanselmo" :
			sectionKey = "anselmo";
			break;
		case "jensflottau" :
			sectionKey = "flottau";
			break;										
		case "shownews" :
			sectionKey = "shownews";
			break;									
	}
	return sectionKey;
	
}

/* This function translates the position integer to an ad ops friendly string */
function setScrollPositionTargets(scrollPosition) {
	Ti.API.info("setScrollPositionTargets, scrollPosition = " + scrollPosition);
	
	var targets = "";
	
	// check for the scroll position
    switch (scrollPosition) {
    	case "0" :
    		targets = "scrollfirst";
    		break;
    	case "1" :
    		targets = "scrollsecond";
    		break;
    	case "2" :
    		targets = "scrollthird";
    		break;
    	case "3" :
    		targets = "scrollfourth";
    		break;
    	case "4" :
    		targets = "scrollfifth";
    		break;
    	case "5" :
    		targets = "scrollsixth";
    		break;	    		
    }
    Ti.API.info("setScrollPositionTargets returned: " + targets);
	return targets;
}

