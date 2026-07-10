const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{
threshold:.15
});

document.querySelectorAll(".reveal").forEach(el=>{

observer.observe(el);

});


const heroScroll = document.getElementById("heroScroll");
const nextSection = document.getElementById("cinematic-intro");

if (heroScroll && nextSection) {

    heroScroll.addEventListener("click", function(e){

        e.preventDefault();

        nextSection.scrollIntoView({

            behavior: "smooth",
            block: "start"

        });

    });

}


/* ==================================================
   SUMMIT FAQ
================================================== */

const summitFaqItems = document.querySelectorAll(".summit-faq-item");

summitFaqItems.forEach(item => {

    const button = item.querySelector(".summit-faq-question");

    const answer = item.querySelector(".summit-faq-answer");

    button.addEventListener("click",()=>{

        const active = item.classList.contains("active");

        summitFaqItems.forEach(faq=>{

            faq.classList.remove("active");

            faq.querySelector(".summit-faq-answer").style.maxHeight = null;

        });

        if(!active){

            item.classList.add("active");

            answer.style.maxHeight = answer.scrollHeight + "px";

        }

    });

});
document.addEventListener("DOMContentLoaded", function () {
  var videos = document.querySelectorAll('.video');

  videos.forEach(function (video) {
      var src = video.dataset.src;

      video.addEventListener('mouseenter', function () {
          video.load(); // Load metadata
          video.play();
      });

      video.addEventListener('mouseleave', function () {
          video.pause();
          video.currentTime = 0;
      });
  });
});

    document.addEventListener("DOMContentLoaded", function () {

    const openButton = document.getElementById("openVideo");
    const modal = document.getElementById("videoModal");
    const closeButton = document.getElementById("closeVideo");
    const player = document.getElementById("youtubePlayer");

    if (!openButton || !modal || !player) return;

    // ======================================
    // OPEN VIDEO
    // ======================================

    openButton.addEventListener("click", function () {

        let videoUrl = this.dataset.video;

        if (!videoUrl) return;

        // Add autoplay if not already present
        if (videoUrl.indexOf("autoplay") === -1) {

            if (videoUrl.indexOf("?") > -1) {

                videoUrl += "&autoplay=1";

            } else {

                videoUrl += "?autoplay=1";

            }

        }

        player.src = videoUrl;

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

    });

    // ======================================
    // CLOSE FUNCTION
    // ======================================

    function closeVideo() {

        modal.classList.remove("active");

        player.src = "";

        document.body.style.overflow = "";

    }

    // ======================================
    // CLOSE BUTTON
    // ======================================

    closeButton.addEventListener("click", closeVideo);

    // ======================================
    // CLICK OUTSIDE VIDEO
    // ======================================

    modal.addEventListener("click", function (e) {

        if (e.target === modal) {

            closeVideo();

        }

    });

    // ======================================
    // ESC KEY
    // ======================================

    document.addEventListener("keydown", function (e) {

        if (e.key === "Escape") {

            closeVideo();

        }

    });

});



$(document).ready(function(){

    $('.featured-slider').slick({

        slidesToShow:3,

        slidesToScroll:1,

        infinite:true,

        autoplay:true,

        autoplaySpeed:3500,

        speed:700,

        arrows:true,

        prevArrow:$('.featured-prev'),

        nextArrow:$('.featured-next'),

        dots:false,

        pauseOnHover:true,

        cssEase:'ease',

        responsive:[

            {

                breakpoint:1100,

                settings:{

                    slidesToShow:2

                }

            },

            {

                breakpoint:768,

                settings:{

                    slidesToShow:1

                }

            }

        ]

    });

});

    document.querySelectorAll(".film-card").forEach(card => {

    const video = card.querySelector(".film-video");

    if (!video) return;

    card.addEventListener("mouseenter", () => {

        video.currentTime = 0;

        video.play();

    });

    card.addEventListener("mouseleave", () => {

        video.pause();

        video.currentTime = 0;

    });

});

    // ==========================
    // Grid / List Toggle
    // ==========================

    const gridBtn = document.getElementById("gridBtn");
    const listBtn = document.getElementById("listBtn");

    const filmsGrid = document.getElementById("filmsGrid");
    const filmsList = document.getElementById("filmsList");

    gridBtn.addEventListener("click", function () {

        filmsGrid.style.display = "grid";
        filmsList.style.display = "none";

        gridBtn.classList.add("active");
        listBtn.classList.remove("active");

    });

    listBtn.addEventListener("click", function () {

        filmsGrid.style.display = "none";
        filmsList.style.display = "block";

        listBtn.classList.add("active");
        gridBtn.classList.remove("active");

    });




$(document).ready(function(){
    $('.banner-slider').slick({
      autoplay: true,
      autoplaySpeed: 3000,
      dots: false,
      arrows: true,
      adaptiveHeight: true,
      lazyLoad: true,
      
      // Additional options can be added here
    });
  });






  document.addEventListener('DOMContentLoaded', function() {
    const playButtons = document.querySelectorAll('.play-button');
  
    playButtons.forEach(button => {
      button.addEventListener('click', function() {
        const videoContainer = this.closest('.slide');
        const video = videoContainer.querySelector('.slide-video');
  
        // Clone the video element for full-screen playback
        const fullscreenVideo = video.cloneNode(true);
        fullscreenVideo.classList.add('fullscreen-video');
  
        // Append the cloned video to the body
        document.body.appendChild(fullscreenVideo);
  
        // Play the video in full screen
        if (fullscreenVideo.requestFullscreen) {
          fullscreenVideo.requestFullscreen();
        } else if (fullscreenVideo.mozRequestFullScreen) { // Firefox
          fullscreenVideo.mozRequestFullScreen();
        } else if (fullscreenVideo.webkitRequestFullscreen) { // Chrome, Safari and Opera
          fullscreenVideo.webkitRequestFullscreen();
        } else if (fullscreenVideo.msRequestFullscreen) { // IE/Edge
          fullscreenVideo.msRequestFullscreen();
        }
  
        fullscreenVideo.play();
  
        // Remove the full-screen video element when exiting full screen
        fullscreenVideo.addEventListener('fullscreenchange', function() {
          if (!document.fullscreenElement) {
            fullscreenVideo.pause();
            fullscreenVideo.remove();
          }
        });
  
        fullscreenVideo.addEventListener('mozfullscreenchange', function() {
          if (!document.mozFullScreenElement) {
            fullscreenVideo.pause();
            fullscreenVideo.remove();
          }
        });
  
        fullscreenVideo.addEventListener('webkitfullscreenchange', function() {
          if (!document.webkitFullscreenElement) {
            fullscreenVideo.pause();
            fullscreenVideo.remove();
          }
        });
  
        fullscreenVideo.addEventListener('msfullscreenchange', function() {
          if (!document.msFullscreenElement) {
            fullscreenVideo.pause();
            fullscreenVideo.remove();
          }
        });
      });
    });
  });
  