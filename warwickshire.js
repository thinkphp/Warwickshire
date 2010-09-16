/* @thinkphp */

/* 
   As the map needs to be globally accessible 
   I attach it to the wws namespace
*/
wws = {};

YUI().use('node','anim',function(Y){

    /* Add class to body to trigger CSS hiding 
       I added a class called 'js' to the body of the document
       when JavaScript is available and included Yahoo Maps API
       and YUI library. The later allows me simple and browser independent access
       to both DOM and events in the browser, the former is of course needed to show the map.
       Adding the class 'js' to the body saves me a lot of trouble. Instead of looping through 
       all the lists and hiding them (as I want to show and hide them when you click on the headers).
       I can now do that in the CSS 
       (body.js .section ul{position: absolute;left: -9999px;overflow: hiddden;})
       (body.js .show ul{position: relative;left:0;top:0;overflow: auto;})
       This hides all the lists and when I want to show them all I need is to add a class called 'show'
       on the containing DIV.
       briefly: adding the map and collapsing the sections.         
    */
    Y.one('body').addClass('js');

    /* Make headers keyboard accessible */
    Y.all('.section h2').set('tabIndex',-1);
    Y.all('.section ul').set('tabIndex',-1);
    Y.one('#info').set('tabIndex',-1);

    /* Welcome: 
       Adding innerHTML to the div with ID 'info' 
       I wanted to explain to the end users what be done here.
       You will find a lot of mashups that will have this info in the HTML but
       if JavaScript is not available? You explain functionality that is not available and confuse users.
       This is why I add the information to the 'info' section and add a class to allow for different styling as 
       this section will be re-used to show the information of the marker I clicked on.
     */
    Y.one('#info').set('innerHTML',
      '<h2>Get all the information here</h2>'+
      '<p>Click any of the icons on the map to the right to get detail information about the location.</p>'+
      '<p>You can make the map less busy by turning features on and off with the buttons above.</p>'
    ).addClass('intro');

    /* Add the buttons to show and hide markers of various types.
       Make the 'schools' one inactive by default as there are far too many.  
     */
    Y.one('#container').prepend(
      '<div class="buttons">'+
      '<button id="librariesbutton">hide libraries</button>'+  
      '<button id="parksbutton">hide parks</button>'+  
      '<button id="museumsbutton">hide museums</button>'+  
      '<button id="schoolsbutton" class="inactive">show schools</button>'+  
      '</div>'  
    );

    /* Add the button after the map to trigger the resize functionality */
    Y.one('#container').append('<button id="size">&#8595; larger map &#8595;</button>');    


    /* 
       Show and hide sections under H2 headings using event delegation 
       using event delegation it is very easy to make all the H2 headings
       in the #bd clickable and show and hide the following ULs.
       I add and remove the 'show' class to show and hide the ULs and move the
       focus to the list when the header is clicked.
     */
    Y.delegate('click',function(e){

      e.preventDefault();
      var dad = Y.one(e.target).ancestor('div');
          if(dad.hasClass('show')) {
             dad.removeClass('show'); 
          } else {
             dad.addClass('show');
             var next = Y.one(e.target).next('ul');
                 next.focus();
          }
    
    },'#bd','h2')

    /* start map */

    /* Define an array of points
       The points array will hold all the points I want
       to show on the map. Yaho maps can get the right zoom
       level and map centre automatically for you when you 
       give it an array of points.  
    */
    var points = [];

    wws.map = new YMap(document.getElementById('map'));
    wws.map.addTypeControl();
    wws.map.addZoomLong();
    wws.map.addPanControl();
    //I disable the key controls to make sure the map doesn't interfere with page scrolling
    //and define hybrid as the map type.
    wws.map.disableKeyControls();
    wws.map.setMapType(YAHOO_MAP_HYB);

    /* Get Parks information and add markers 
       I read the names of all the parks and the location of the all the parks
       using Y.all() method of YUI3. Then loop over the parks, split the coordinate information on
       the comma and create a new GeoPoint from it. I add the point to the points array, define an image
       for the point and create a new YMarker. In the marker I add the point, the image and a running ID.
       This will label the markers internally as mp0,mp1,mp2 and so on. This I need to connect the marker
       with the content section in the list (remember I added a running ID on the list items when I wrote them out in PHP).
       Then add a capturing function the the marker that fires when it is clicked. In this one I read
       out the ID of the marker (using the rather obtruse i.thisObj.id property), remove the 'm' from the ID and get
       the content of the element with this ID - which is the connected list them. I send the content to the
       showInfo() method.
       Futhermore I add an AutoExpand with the name of the park and a 'click for more' message to the marker 
       and add it to the map.
       This functionality is repeated for all the different sections which seems a waste   
     */
    var parks = Y.all('#parks .name').get('innerHTML');
    var parklocs = Y.all('#parks .geo span').get('innerHTML');
    for(var i=0;i<parks.length;i++) {
        var coord = parklocs[i].split(',');
        var point = new YGeoPoint(coord[0],coord[1]);
            points.push(point);
        var img = new YImage();
            img.src = 'park.png';
            img.size = new YSize(32,32);    
        var marker = new YMarker(point,img,'mp'+i);
            YEvent.Capture(marker, EventsList.MouseClick, function(i){
               var src = document.getElementById(i.thisObj.id.replace('m',''));
               wws.showInfo(src.innerHTML); 
            });
            marker.addAutoExpand(parks[i] + ' (click for more)');
        wws.map.addOverlay(marker); 
    }

   /* get museums informations and add markers */
    var museums = Y.all('#museums .name').get('innerHTML');
    var museumlocs = Y.all('#museums .geo span').get('innerHTML');
    for(var i=0;i<museums.length;i++) {
        var coord = museumlocs[i].split(',');
        var point = new YGeoPoint(coord[0],coord[1]);
            points.push(point);
        var img = new YImage();
            img.src = 'museum.png';
            img.size = new YSize(32,32);    
        var marker = new YMarker(point,img,'mm'+i);
        YEvent.Capture(marker, EventsList.MouseClick, function(i){
            var src = document.getElementById(i.thisObj.id.replace('m',''));
            wws.showInfo(src.innerHTML); 
        });
            marker.addAutoExpand(museums[i] + ' (click for more)');
            wws.map.addOverlay(marker); 
    }
 

    /* get libraries informations and add markers */

    var libraries = Y.all('#libraries .name').get('innerHTML');
    var librarylocs = Y.all('#libraries .geo span').get('innerHTML');
    for(var i=0;i<libraries.length;i++) {
        var coord = librarylocs[i].split(',');
        var point = new YGeoPoint(coord[0],coord[1]);
            points.push(point);
        var img = new YImage();
            img.src = 'library.png';
            img.size = new YSize(32,32);    
        var marker = new YMarker(point,img,'ml'+i);
        YEvent.Capture(marker, EventsList.MouseClick, function(i){
            var src = document.getElementById(i.thisObj.id.replace('m',''));
            wws.showInfo(src.innerHTML); 
        });
            marker.addAutoExpand(libraries[i] + ' (click for more)');
            wws.map.addOverlay(marker); 
    }

    /* Get Schools information and add markers */ 
    var schools = Y.all('#schools .name').get('innerHTML');
    var schoollocs = Y.all('#schools .geo span').get('innerHTML');
    for(var i=0;i<schools.length;i++) {
        var coord = schoollocs[i].split(',');
        var point = new YGeoPoint(coord[0],coord[1]);
            points.push(point);
        var img = new YImage();
            img.src = 'school.png';
            img.size = new YSize(32,32);    
        var marker = new YMarker(point,img,'ms'+i);
        YEvent.Capture(marker, EventsList.MouseClick, function(i){
            var src = document.getElementById(i.thisObj.id.replace('m',''));
            wws.showInfo(src.innerHTML); 
        });
            marker.addAutoExpand(schools[i] + ' (click for more)');
            wws.map.addOverlay(marker);
            marker.hide();  
    }


        /* Find best zoom level and draw map 
           Get the best zoom level and the centre of the map and 
           draw it. Remove two levels from the best level
           as the markers are very dense on this map and 
           I didn't want to overwhelm the end-user. 
         */
        var zac = wws.map.getBestZoomAndCenter(points);
        var level = zac.zoomLevel;
        wws.map.drawZoomAndCenter(zac.YGeoPoint,level-2);

    /* A simple function to set the content of the info window */
    wws.showInfo = function(html) {
        Y.one('#info').set('innerHTML',html).removeClass('intro'); 
        if(Y.one('#info a')) {
          Y.one('#info a').focus();
        } else {
          Y.one('#info').focus();
        }  
    }//end function

    /* Function to toggle the markers of a certain kind 
       This method retrieves all the markers IDs from the map 
       and loop through them. If they match the ID string sent
       through by the button event handler it show or hide all 
       the markers of a certain type. Notice that the opposite of 
       hide() is unhide()
     */
    wws.toggleMarkers = function(str,what) {

        //get all markers IDs from the map
        var markers = wws.map.getMarkerIDs();

        //for each marker check if exits match with 'str'
        for(var i=0;i<markers.length;i++) {
 
            //if exists a match with str then get the marker
            if(markers[i].indexOf(str) != -1) {

               //hold the marker
               var m = wws.map.getMarkerObject(markers[i]);

                   //if what == 1 then unhide , (what == 0) otherwise hide
                   if(what) {
                      //apply method unhide() - unhide the marker
                      m.unhide();
                   } else {
                      //hide the marker
                      m.hide(); 
                   }//end if
            }//endif   
        }//endfor
    };//end function  

    /* Use Event Delegation to add handlers to all the buttons.
       I needed some interactive elements to allow resizing of the map and to 
       show and hide the different markers. For this I created buttons as that
       is what they are there for - firing JavaScript functionality.
       I add the buttons to the container element and give each an ID to
       differentiate between them. I use event delegation to attach
       functionality to all buttons in the container element and differentiate by reading
       out the 'event target' and its ID. 
       For resizing button I resize the map and change the content of the button.
       To allow for extra styling I also add and remove a class called 'inactive'.
     */
    Y.delegate('click',function(event){

       //get target 
       var t = Y.one(event.target);

            //switch for ID of the target
            switch(t.get('id')) {

               //if ID is 'parksbutton' namely button parks then execute
               case 'parksbutton':
                     if(t.get('innerHTML').indexOf('hide') != -1) {
                       wws.toggleMarkers('mp',0); 
                       t.set('innerHTML','show parks');
                       t.addClass('inactive'); 
                     } else {
                       wws.toggleMarkers('mp',1); 
                       t.set('innerHTML','hide parks');
                       t.removeClass('inactive'); 
                     }
               break;

               //if ID is 'museumsbutton' i.e. museums button then execute
               case 'museumsbutton':
                     if(t.get('innerHTML').indexOf('hide') != -1) {
                       wws.toggleMarkers('mm',0); 
                       t.set('innerHTML','show museums');
                       t.addClass('inactive'); 
                     } else {
                       wws.toggleMarkers('mm',1); 
                       t.set('innerHTML','hide museums');
                       t.removeClass('inactive'); 
                     }
               break;

               //if ID is 'librariesbutton' namely libraries button then execute
               case 'librariesbutton':
                     if(t.get('innerHTML').indexOf('hide') != -1) {
                       wws.toggleMarkers('ml',0); 
                       t.set('innerHTML','show libraries');
                       t.addClass('inactive'); 
                     } else {
                       wws.toggleMarkers('ml',1); 
                       t.set('innerHTML','hide libraries');
                       t.removeClass('inactive'); 
                     }
               break;


               //if ID is 'schoolsbutton' namely libraries button then execute
               case 'schoolsbutton':
                     if(t.get('innerHTML').indexOf('hide') != -1) {
                       wws.toggleMarkers('ms',0); 
                       t.set('innerHTML','show schools');
                       t.addClass('inactive'); 
                     } else {
                       wws.toggleMarkers('ms',1); 
                       t.set('innerHTML','hide schools');
                       t.removeClass('inactive'); 
                     }
               break;

               case 'size':
                    if(t.get('innerHTML').indexOf('smaller map') != -1) {
                      t.set('innerHTML','&#8593; larger map &#8593;');
                      //Y.one('#map').setStyle('height','280px'); 
                      var myAnim = new Y.Anim({
                                 node: Y.one('#map'), to: {height: 280}, duration: .3
                          }).run();
                    } else {
                      t.set('innerHTML','&#8593; smaller map &#8593;');
                      //Y.one('#map').setStyle('height','500px');
                      var myAnim = new Y.Anim({
                                 node: Y.one('#map'), to: {height: 500}, duration: .3
                          }).run();

                    }
               break;

            }//end switch
 
    },'#container','button');

});