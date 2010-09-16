<?php ob_start('ob_gzhandler');
/*
 Hach Warwickshire
 Do you look at government web sites and think "I could do better than that?"
 Have you got a great idea for how technology can deliver better public services?
 Could you use our data to show us how to work smarter? 
 -If your answer to any of those questions is yes, even if it is only the fourth or fifty one,
  then we would love you to get involved with our second Hack Warwickshire Competitions.
*/
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
   <title>Warwickshire Information - building a mashup with Government Data</title>
   <link  href="http://fonts.googleapis.com/css?family=Droid+Sans:regular,bold" rel="stylesheet" type="text/css" >
   <link rel="stylesheet" href="http://yui.yahooapis.com/2.8.0r4/build/reset-fonts-grids/reset-fonts-grids.css" type="text/css">
   <link rel="stylesheet" href="http://yui.yahooapis.com/2.7.0/build/base/base.css" type="text/css">
   <link rel="stylesheet" href="warwickshire.css" type="text/css">
</head>
<body>
<div id="doc" class="yui-t7"><!-- start doc -->
   <div id="hd" role="banner"><h1>Warwickshire Information</h1><p class="intro">Here you can find out all about the libraries, parks and museums and schools around Warwickshire</p></div>
    <div id="bd" role="main"><!-- start main -->
           <!--
              A container DIV with a placeholder for the map and one for the information to 
              be displayed about the marker the user clicked on the map.
           -->
  	   <div id="container">
	     <div id="map"></div>
             <div id="info"></div>
   	   </div>
<?php

/* 
     The first thing I went for was to get my datasets:
          http://ws.warwickshire.gov.uk/parks.xml
          http://ws.warwickshire.gov.uk/libraries.xml
          http://ws.warwickshire.gov.uk/museums.xml
          http://opendata.s3.amazonaws.com/schools/schools-warwickshire.xml
      Notice that the last dataset is vastly different to the others (uppercase elements for a start)
      and also that it contains the gem of <LATTIUDE>32.32434</LATTIUDE> - would be good to spell-check your elements.  
         
*/

/* define endpoint and statement YQL */
$endpoint = "http://query.yahooapis.com/v1/public/yql?q=";

/*
   Sent to the right YQL webservice endpoint results in the aggregated XML document
   and means I only have to have one HTTP request to load the data.
 */
$yql = 'select * from xml where url in ('.
       '"http://ws.warwickshire.gov.uk/parks.xml",'.
       '"http://ws.warwickshire.gov.uk/libraries.xml",'.
       '"http://ws.warwickshire.gov.uk/museums.xml",'.
       '"http://opendata.s3.amazonaws.com/schools/schools-warwickshire.xml"'.
       ')';
$url = $endpoint . urlencode($yql) . '&format=json&diagnostics=false';

/* retrieving and converting the json data */
$output = get($url);

/* 
  Decode json 
  This gives me all the data in the $data variable as a native PHP object.
  All that I needed to do was to analyse the data coming back and wrap it 
  in the right HTML.
*/
$data = json_decode($output);

/* Display the HTML for each section */

/* display parks */
echo'<div class="section"><h2>Parks (' . sizeof($data->query->results->parks->park) . ') </h2>';
echo'<ul id="parks">'; 
foreach($data->query->results->parks->park as $k=>$p) {
        echo'<li';
        if($p->image) {echo' class="hasimage"';}
        echo' id="p'.$k.'">';
        echo'<h3><a href="'.$p->link.'"><span class="name">'.$p->name.'</span></a></h3>'; 
        if($p->image){echo'<img src="'.$p->image.'" class="photo" alt="'.$p->name.'"/>';}
        echo'<p class="geo">Location: <span>'.$p->coordinates.'</span></p>';  
addPara('',$p->address->street);
addPara('',$p->address->area);
addPara('',$p->address->town_city);
addPara('',$p->address->county);
addPara('',$p->address->postcode);

}//end foreach
echo'</li></ul>';
echo'</div>';

/* display museums */
echo'<div class="section"><h2>Museums (' . sizeof($data->query->results->museums->museum) . ') </h2>';
echo'<ul id="museums">'; 
foreach($data->query->results->museums->museum as $k=>$m) {
        echo'<li';
        if($m->image) {echo' class="hasimage"';}
        echo' id="m'.$k.'">';
        echo'<h3><a href="'.$m->link.'"><span class="name">'.$m->name.'</span></a></h3>'; 
        if($m->image){echo'<img src="'.$m->image.'" class="photo" alt="'.$m->name.'"/>';}
addPara('',$m->address->buildingname);
addPara('',$m->address->street);
addPara('',$m->address->area);
addPara('',$m->address->town_city);
addPara('',$m->address->county);
addPara('',$m->address->postcode);
addPara('Telephone',$m->telno);
addPara('Group Bookings',$m->groupbookingsno);

if($m->email) {
   echo'<p>Email: <a href="mailto:'.$m->email.'">'.$m->email.'</a></p>'; 
}
echo'<p class="geo">Location: <span>'.$m->coordinates.'</span></p>';  
}//end foreach
echo'</li></ul>';
echo'</div>';


/* display libraries */
echo'<div class="section"><h2>Libraries (' . sizeof($data->query->results->libraries->library) . ') </h2>';
echo'<ul id="libraries">'; 
foreach($data->query->results->libraries->library as $k=>$l) {
        echo'<li';
        if($l->image) {echo' class="hasimage"';}
        echo' id="l'.$k.'">';
        echo'<h3><a href="'.$l->link.'"><span class="name">'.$l->name.'</span></a></h3>'; 
        if($l->image){echo'<img src="'.$l->image.'" class="photo" alt="'.$l->name.'"/>';}

addPara('',$l->address->street);
addPara('',$l->address->area);
addPara('',$l->address->town_city);
addPara('',$l->address->county);
addPara('',$l->address->postcode);
addPara('Telephone',$m->telno);
addPara('FAX',$l->faxno);

if($m->email) {
   echo'<p>Email: <a href="mailto:'.$l->email.'">'.$l->email.'</a></p>'; 
}
echo'<p class="geo">Location: <span>'.$l->coordinates.'</span></p>';  
}//end foreach

echo'</li></ul>';
echo'</div>';


/* Display schools */
echo'<div class="section"><h2>Schools (' . sizeof($data->query->results->RECORDS->SCHOOL) . ') </h2>';
echo'<ul id="schools">'; 
foreach($data->query->results->RECORDS->SCHOOL as $k=>$s) {
        echo'<li id="s'.$k.'">';
        echo'<h3><span class="name">'.$s->SCH_NAME.'</span></h3>'; 

//use function 'ucwords' and 'strtolower' to clean up the data before displaying it.
addPara('Addr1',ucwords(strtolower($s->ADDRESS_1)));
addPara('Addr2',ucwords(strtolower($s->ADDRESS_2)));
addPara('Addr3',ucwords(strtolower($s->ADDRESS_3)));
addPara('Post Code',$s->POSTCODE);
addPara('Type',$s->SCH_TYPE);
addPara('Educ Area',$s->EDUC_AREA);
//this section ends with  a P with the class 'geo' which contains a SPAN with the coordinates (allow me to plot it on a map)
echo'<p class="geo">Location: <span>'.$s->LATTIUDE.','.$s->LONGITUDE.'</span></p>';  
}//end foreach

echo'</li></ul>';
echo'</div>';



?>
 </div><!-- end main -->
 <div id="ft" role="contentinfo"><p>@thinkphp</p></div>
</div><!-- end doc -->
<script type="text/javascript" src="http://api.maps.yahoo.com/ajaxymap?v=3.8&appid=YD-eQRpTl0_JX2E95l_xAFs5UwZUlNQhhn7lj1H"></script>
<script type="text/javascript" src="http://yui.yahooapis.com/3.1.1/build/yui/yui-min.js"></script>
<script src="warwickshire.js"></script>
</body>
</html>

<?php

//utils fuctions

/** use cURL to retrieve data from a url
  * @param $url (String) the url by which retrieval data
  * @return data
  */
function get($url) {
  $ch = curl_init();
  curl_setopt($ch,CURLOPT_URL,$url);
  curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
  curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,2);
  $data = curl_exec($ch);
  if(empty($data)) {
    return "System timeout. Please Try Again!";
  } else {
    return $data;
  }
}//end function

/**
  * This write out the paragraphs of elements that have content as I wanted to avoid empty P elements.
  * @param $s - String 
  * @param $p - content of paragraph
  */
function addPara($s,$p) {
  if($p) {
     echo'<p>';
     if($s != ''){echo$s.': ';} 
     echo$p.'</p>';
  }  
}//end function

?>