/* Simulation carousel: one slide per object, shared toggles for the along-path stiffness K and the end condition.
   Without JavaScript the four slides stay stacked with their default video (K = 100 N/m, rigid end stop). */
(function () {
  "use strict";
  var root = document.querySelector("[data-sim-carousel]");
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll(".sim-slide"));
  var track = root.querySelector(".sim-track");
  var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-go]"));
  var kButtons = Array.prototype.slice.call(root.querySelectorAll("[data-k]"));
  var endButtons = Array.prototype.slice.call(root.querySelectorAll("[data-end]"));
  var state = { index: parseInt(root.getAttribute("data-start") || "0", 10), k: "100", end: root.getAttribute("data-end") || "stop" };
  var VERSION = "?v=20261110e";   /* bump when the videos are regenerated */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) track.style.transition = "none";

  function load(slide, play) {
    var video = slide.querySelector("video");
    var base = "videos/sim/" + slide.getAttribute("data-twin") + (state.end === "hand" ? "_hand_in_gap" : "") + "_K" + state.k;
    if (video.getAttribute("data-base") !== base) {
      video.setAttribute("data-base", base);
      video.poster = base + ".jpg" + VERSION;
      video.src = base + ".mp4" + VERSION;
      video.load();
    }
    if (play) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else { video.pause(); }
  }
  function update() {
    track.style.transform = "translateX(" + (-100 * state.index) + "%)";
    slides.forEach(function (slide, i) { slide.setAttribute("aria-hidden", i === state.index ? "false" : "true"); load(slide, i === state.index); });
    tabs.forEach(function (b, i) { b.setAttribute("aria-selected", i === state.index ? "true" : "false"); });
    kButtons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-k") === state.k ? "true" : "false"); });
    endButtons.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-end") === state.end ? "true" : "false"); });
  }
  function go(i) { state.index = (i + slides.length) % slides.length; update(); }

  root.classList.add("is-ready");
  root.querySelector(".sim-prev").addEventListener("click", function () { go(state.index - 1); });
  root.querySelector(".sim-next").addEventListener("click", function () { go(state.index + 1); });
  tabs.forEach(function (b) { b.addEventListener("click", function () { go(parseInt(b.getAttribute("data-go"), 10)); }); });
  kButtons.forEach(function (b) { b.addEventListener("click", function () { state.k = b.getAttribute("data-k"); update(); }); });
  endButtons.forEach(function (b) { b.addEventListener("click", function () { state.end = b.getAttribute("data-end"); update(); }); });
  root.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(state.index - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(state.index + 1); e.preventDefault(); }
  });
  var x0 = null;
  track.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(state.index + (dx < 0 ? 1 : -1));
  });
  update();
})();
