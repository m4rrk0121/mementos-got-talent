(function () {
  const video = document.getElementById("bg-video");
  const form = document.getElementById("signup");
  const message = document.getElementById("form-message");
  const submit = form.querySelector('button[type="submit"]');

  const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function attachVideo(sources) {
    if (!motionOK) return;
    let index = 0;

    function tryNext() {
      if (index >= sources.length) {
        video.removeAttribute("src");
        return;
      }
      video.src = sources[index++];
      video.load();
    }

    video.addEventListener("loadeddata", function () {
      document.documentElement.classList.add("has-video");
      video.play().catch(function () {});
    });

    video.addEventListener("error", tryNext);
    tryNext();
  }

  attachVideo(["video/background.mp4?v=2", "video/background.webm?v=2"]);

  function say(text, isError) {
    message.textContent = text;
    message.classList.toggle("error", Boolean(isError));
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    say("");

    if (form.company.value) {
      form.closest(".card").classList.add("is-done");
      say("You’re on the list.");
      return;
    }

    if (!form.reportValidity()) return;

    const config = window.SITE_CONFIG || {};
    const endpoint = (config.formEndpoint || "").trim()
      || (config.notifyEmail || "").trim() &&
        "https://formsubmit.co/ajax/" + encodeURIComponent(config.notifyEmail.trim());

    if (!endpoint) {
      say("This list isn’t receiving signups yet.", true);
      return;
    }

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      role: form.role.value,
      note: form.note.value.trim(),
      _replyto: form.email.value.trim(),
      _subject: "Memento's Got Talent signup — " + form.name.value.trim(),
      _template: "table",
      _captcha: "false",
    };

    submit.disabled = true;
    const previous = submit.textContent;
    submit.textContent = "Sending…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(function () { return {}; });
      const failed = !response.ok || data.success === false || data.success === "false";
      if (failed) throw new Error(data.message || "Could not send");

      form.closest(".card").classList.add("is-done");
      say("You’re on the list. We’ll be in touch.");
    } catch (error) {
      say("Couldn’t send that just now. Try again in a moment.", true);
      submit.disabled = false;
      submit.textContent = previous;
    }
  });
})();
