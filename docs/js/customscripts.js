$('#mysidebar').height($(".nav").height());

/**
  * @param {String} url - address for the HTML to fetch
  * @return {String} the resulting HTML string fragment
  */
// async function fetchHtmlAsText(url) {
//     return await (await fetch(url)).text();
// }

// async function loadFrag() {
//     const contentDiv = document.getElementById("content");
//     contentDiv.innerHTML = await fetchHtmlAsText("home.html");
// }

window.addEventListener('hashchange', function(e){
    tgt = $(":target").attr('id')
    var oldHash = e.oldURL.split('#')[1] || "";
    // console.log("oldhash: " + oldHash)
    if (oldHash) {
        oldli = "li." + oldHash
        // console.log("li: " + oldli)
        $(oldli).removeClass("active")
    }
    $("li." + tgt).addClass("active")
})

// window.addEventListener("scroll", function () {

//     console.log("hello");
//     // Track the current scrolledsec

//     let currentScrolledsec;

//     // Add/remove the "your-active-class" to the proper sections first

//     const myAllSections = document.querySelectorAll("mysidebar li");
//     myAllSections.forEach(function (scrolledsec) {
//         scrolledsec.classList.remove("your-active-class");

//         if (
//             pageYOffset >= scrolledsec.offsetTop &&
//                 pageYOffset < scrolledsec.offsetTop + scrolledsec.offsetHeight
//         ) {
//             scrolledsec.classList.add("your-active-class");

//             // Set as current scrolledsec
//             currentScrolledsec = scrolledsec;
//         }
//     });

//     // Now highlight/unhighlight the links using the current scrolledsec in view.

//     //the result that when we scroll the section inview with the active class  will take a different style

//     const myAllLinks = document.querySelectorAll("a"); // defining a variable contains all links to loop over it
//     /*looping over all links when a link text equal section name
//       (data-nav) and that section in active the link will get
//       highlighted in nav bar menu */
//     myAllLinks.forEach((link) => {
//         if (currentScrolledsec.getAttribute("data-nav") === link.innerText) {
//             link.style.color = "red";
//         } else {
//             link.style.color = "white";
//         }
//         /* the result that when we scroll to specific section the 
//            nav list with the same name as section name will get highlighted*/
//     });
// });

$( document ).ready(function() {

   //  console.log("ready")

   // var lis = document.getElementById("mysidebar").getElementsByTagName('a');

    // for (var i=0; i<lis.length; i++) {
    //     lis[i].addEventListener('click', (e) => {
    //         e.target.parentNode.classList.add("active");
    //         console.log("e parent: " + e.target.parentNode.getAttribute("class"));
    //         e.stopPropagation();
    //         $(document.body).load(e.target.getAttribute("href"));
    //     })
    // }



    //this script says, if the height of the viewport is greater than 800px, then insert affix class, which makes the nav bar float in a fixed
    // position as your scroll. if you have a lot of nav items, this height may not work for you.
    var h = $(window).height();
    //console.log (h);
    if (h > 800) {
        // $( "#mysidebar" ).attr("class", "nav affix");
    }
    // activate tooltips. although this is a bootstrap js function, it must be activated this way in your theme.
    $('[data-toggle="tooltip"]').tooltip({
        placement : 'top'
    });

    /**
     * AnchorJS
     */
    anchors.add('h2,h3,h4,h5');

});

// needed for nav tabs on pages. See Formatting > Nav tabs for more details.
// script from http://stackoverflow.com/questions/10523433/how-do-i-keep-the-current-tab-active-with-twitter-bootstrap-after-a-page-reload
$(function() {
    var json, tabsState;
    $('a[data-toggle="pill"], a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var href, json, parentId, tabsState;

        tabsState = localStorage.getItem("tabs-state");
        json = JSON.parse(tabsState || "{}");
        parentId = $(e.target).parents("ul.nav.nav-pills, ul.nav.nav-tabs").attr("id");
        href = $(e.target).attr('href');
        json[parentId] = href;

        return localStorage.setItem("tabs-state", JSON.stringify(json));
    });

    tabsState = localStorage.getItem("tabs-state");
    json = JSON.parse(tabsState || "{}");

    $.each(json, function(containerId, href) {
        return $("#" + containerId + " a[href=" + href + "]").tab('show');
    });

    $("ul.nav.nav-pills, ul.nav.nav-tabs").each(function() {
        var $this = $(this);
        if (!json[$this.attr("id")]) {
            return $this.find("a[data-toggle=tab]:first, a[data-toggle=pill]:first").tab("show");
        }
    });
});
