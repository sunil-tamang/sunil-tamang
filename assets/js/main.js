const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");
observer.unobserve(entry.target);

}

});

},{
threshold:.15
});

document.querySelectorAll(".reveal").forEach(el=>{

observer.observe(el);

});


/* ==================================================
   SUMMIT FAQ
================================================== */

const summitFaqItems = document.querySelectorAll(".summit-faq-item");

summitFaqItems.forEach(item => {

    const button = item.querySelector(".summit-faq-question");

    const answer = item.querySelector(".summit-faq-answer");

    if (!button || !answer) return;
    button.setAttribute("aria-expanded", "false");

    button.addEventListener("click",()=>{

        const active = item.classList.contains("active");

        summitFaqItems.forEach(faq=>{

            faq.classList.remove("active");
            faq.querySelector(".summit-faq-question")?.setAttribute("aria-expanded", "false");

            const faqAnswer = faq.querySelector(".summit-faq-answer");
            if (faqAnswer) faqAnswer.style.maxHeight = null;

        });

        if(!active){

            item.classList.add("active");
            button.setAttribute("aria-expanded", "true");

            answer.style.maxHeight = answer.scrollHeight + "px";

        }

    });

});
document.addEventListener("DOMContentLoaded", function () {
  var videos = document.querySelectorAll('.video');

  videos.forEach(function (video) {

      video.addEventListener('mouseenter', function () {
          video.play().catch(() => {});
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

    if (!openButton || !modal || !player || !closeButton) return;

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
