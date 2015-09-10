//following global comments are so jshint doesn't freak out

/* global imagesLoaded */
/* global eventie */
/* global Isotope */

'use strict';

(function () {
    //'use strict' is supplied by the babel transpiler;

    //grab content area - have it available for initial and refresh layouts
    var contentArea = document.getElementById('filterable-content');
    //grab refresh button
    var refreshButton = document.getElementById('refreshContent');
    //grab spinner div
    var spinnerDiv = document.getElementById('loading-spinner');

    //searches for and replaces hashtags in body copy
    function hashtagMatcher(string) {
        var hashRegEx = /([#][A-Za-z0-9\.\!]+\S)/g;
        var newString = string.replace(hashRegEx, '<span class="hashtag">$1</span>');
        return newString;
    }

    //searches for and replaces mentions in body copy
    function mentionMatcher(string) {
        var hashRegEx = /((@)([A-Za-z0-9\_\.\-]+))/g;
        var newString = string.replace(hashRegEx, '<a href="http://twitter.com/$3" target="_blank">$1</a>');
        return newString;
    }

    //searches for and replaces links in body copy
    function linkMatcher(string) {
        var linkRegEx = /([http]+:\/{0,2}[A-Za-z0-9\.\/]+\S)/g;
        var newString = string.replace(linkRegEx, '<a href="$1" target="_blank">$1</a>');
        return newString;
    }

    //function sets up initial layout, calls objectBuilder and passes it
    //the content-container and ajax response argument
    function initialLayout(obj) {
        //create content container
        var contentContainer = document.createElement('div');
        //set content container class
        contentContainer.setAttribute('class', 'content-container');
        //append content content-container to content area
        contentArea.appendChild(contentContainer);
        //call objectBuilder, passing content container and ajax data
        objectBuilder(contentContainer, obj);
    }

    //handles the refresh content layout, then calls objectBuilder etc
    function refreshLayout(obj) {
        //check DOM to see if a div with class name content-container
        var el = document.getElementsByClassName('content-container');
        if (el) {
            var existing = el[0];
            //create new content element and insert it before existing content
            var newContent = document.createElement('div');
            newContent.setAttribute('class', 'content-container');
            contentArea.insertBefore(newContent, existing);
            //call objectBuilder passing new content container and ajax data
            objectBuilder(newContent, obj);
            //debug statement
            console.log('calling for new content');
        } else {
            //debug statement
            console.log('problem with refreshLayout');
            return;
        }
    }

    //helper function for onclick handler
    function getNew() {
        refreshAjaxCall(refreshLayout);
    }

    //initital ajax request, calls initialLayout
    function initialAjaxCall(func) {
        var a = new XMLHttpRequest();
        a.onreadystatechange = function () {
            if (a.readyState === 1) {
                console.log('Request sent, waiting ...');
                spinnerDiv.setAttribute('class', 'show clearfix');
            } else if (a.readyState === 3) {
                console.log('Loading, loading, loading');
            } else if (a.readyState === 4) {
                if (a.status === 200) {
                    console.log('Data loaded');
                    var responseObject = JSON.parse(a.responseText);
                    func(responseObject);
                } else {
                    console.log(a.status);
                }
            } else {
                console.log(a.readyState);
            }
        };
        //redact api url for public repo
        a.open('GET', '##########################', true);
        a.send(null);
    }

    //This is pretty much the same as initialAjaxCall()
    //but checks for new posts.
    //Should probably be refactored and I'm not 100% confident
    //it's working as intended :/
    function refreshAjaxCall(func) {
        var dateNow = new Date();
        var utcDate = dateNow.toUTCString();
        //debug statement
        console.log(utcDate);
        var a = new XMLHttpRequest();
        a.onreadystatechange = function () {
            if (a.readyState === 1) {
                console.log('Request sent, waiting ...');
                spinnerDiv.setAttribute('class', 'show clearfix');
            } else if (a.readyState === 3) {
                console.log('Loading, loading, loading');
            } else if (a.readyState === 4) {
                if (a.status === 200) {
                    console.log('Data loaded');
                    var responseObject = JSON.parse(a.responseText);
                    func(responseObject);
                } else if (a.status === 304) {
                    console.log(a.status);
                    spinnerDiv.setAttribute('class', 'hide');
                    return;
                }
            } else {
                console.log(a.readyState);
            }
        };
        //redact api url for public repo
        a.open('GET', '##########################', true);
        a.setRequestHeader('If-Modified-Since', utcDate);
        a.send(null);
    }

    //takes ajax response object, sorts for post type and calls relevant
    //DOM object builders. Once DOM objects built, calls imageChecker
    function objectBuilder(container, obj) {
        for (var i = 0; i < obj.items.length; i += 1) {

            var item = obj.items[i];
            var service = item.service_name;

            if (service === 'Manual') {
                manualBuilder(container, item);
            } else if (service === 'Twitter') {
                tweetBuilder(container, item);
            } else if (service === 'Instagram') {
                instagramBuilder(container, item);
            } else {
                console.log('Error');
            }
        }
        //call imageChecker
        imageChecker(container);
    }

    //builds the manual photo component
    function manualBuilder(container, obj) {
        //es6 string template
        var manualItemDiv = document.createElement('div');
        var manualItemImg = obj.item_data.image_url;
        var manualItemText = obj.item_data.text;
        var manualItemLink = obj.item_data.link;
        var manualItemLinkText = obj.item_data.link_text;
        var manualItemContent = '<div class="p1">\n        <div class="shadow">\n        <div class="bg-silver">\n        <i class="fa fa-newspaper-o fa-2x red m1"></i>\n        </div>\n        <img src="' + manualItemImg + '" class="" width="100%" height="auto" />\n        <p class="p1">' + manualItemText + '</br>\n        <a href="' + manualItemLink + '" target="_blank">' + manualItemLinkText + '</a>\n        </p>\n        </div>\n        </div>';
        manualItemDiv.setAttribute('class', 'content-item manual all');
        manualItemDiv.innerHTML = manualItemContent;
        container.appendChild(manualItemDiv);
    }

    //builds the tweet component
    function tweetBuilder(container, obj) {
        //es6 string templates
        var twitterItemDiv = document.createElement('div');
        //more parens than a lisp :)
        var twitterItemTweetText = mentionMatcher(hashtagMatcher(linkMatcher(obj.item_data.tweet)));
        var twitterHandle = obj.account_data.user_name;
        var twitterUserName = obj.item_data.user.username;
        var twitterItemContent = '<div class="p1">\n        <div class="shadow">\n        <div class="bg-silver">\n        <i class="fa fa-twitter fa-2x blue m1"></i>\n        </div>\n        <p class="p1"><span class="bold">' + twitterUserName + ' </span><span class="gray">' + twitterHandle + '</span></br>\n        ' + twitterItemTweetText + '</p>\n        </div>\n        </div>';
        twitterItemDiv.setAttribute('class', 'content-item twitter all');
        twitterItemDiv.innerHTML = twitterItemContent;
        container.appendChild(twitterItemDiv);
    }

    //builds the instagram component
    function instagramBuilder(container, obj) {
        //es6 string template
        var instagramItemDiv = document.createElement('div');
        var instagramImg = obj.item_data.image.large;
        var instagramText = hashtagMatcher(obj.item_data.caption);
        var instagramUsername = obj.item_data.user.username;
        var instagramItemContent = '<div class="p1">\n        <div class="shadow">\n        <div class="bg-silver">\n        <i class="fa fa-instagram fa-2x m1"/></i>\n        </div>\n        <img src="' + instagramImg + '" />\n        <p class="user navy px1">' + instagramUsername + '</p>\n        <p class="p1">' + instagramText + '</p>\n        </div>\n        </div>';
        instagramItemDiv.setAttribute('class', 'content-item instagram all');
        instagramItemDiv.innerHTML = instagramItemContent;
        container.appendChild(instagramItemDiv);
    }

    //remove broken images
    function imageChecker(container) {

        var imgLoad = imagesLoaded(container);
        imgLoad.on('always', function () {

            for (var i = 0, len = imgLoad.images.length; i < len; i++) {
                var image = imgLoad.images[i];
                var result = image.isLoaded;
                var img = image.img;
                if (result !== true) {
                    var imgPar = img.parentNode;
                    imgPar.removeChild(img);
                    console.log('image failed to load for ' + image.img.src);
                }
            }
            triggerIsotope();
        });
    }

    //set up Isotope
    function triggerIsotope() {
        //declare variables
        var isoContainer = contentArea;
        var filtersElem = document.querySelector('.selector-row');
        var iso = new Isotope(isoContainer, {
            itemSelector: '.content-item',
            layoutMode: 'masonry'
        });
        // bind filter button click
        eventie.bind(filtersElem, 'click', function (event) {
            var filterValue = event.target.getAttribute('data-filter');
            iso.arrange({ filter: filterValue });
        });
        spinnerDiv.setAttribute('class', 'hide');
        //layout items
        iso.layout();
        //debug
        console.log('Isotope in effect!');
    }

    //initial page setup
    initialAjaxCall(initialLayout);
    //refresh content
    refreshButton.onclick = getNew;
})();
