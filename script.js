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

  const config = window.SITE_CONFIG || {};
  const COUNTER_URL = "https://abacus.jasoncameron.dev";
  const COUNTER_KEY = "mementosgottalent/signups";
  const goal = Math.max(1, Number(config.signupGoal) || 20);

  const thermo = document.getElementById("thermo");
  const thermoGraphic = document.getElementById("thermo-graphic");
  const thermoCount = document.getElementById("thermo-count");
  const thermoLabel = document.getElementById("thermo-label");

  const TUBE = { x: 33, y: 10, w: 26, h: 250 };
  const BULB = { cx: 46, cy: 292 };

  function starPoints(cx, cy, outer, inner) {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 ? inner : outer;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(
        (cx + radius * Math.cos(angle)).toFixed(2) + "," +
        (cy + radius * Math.sin(angle)).toFixed(2)
      );
    }
    return points.join(" ");
  }

  function buildThermometer() {
    const milestones = [0.25, 0.5, 0.75, 1];
    const marks = milestones.map(function (fraction) {
      const y = TUBE.y + TUBE.h * (1 - fraction) + (fraction === 1 ? 12 : 0);
      const value = Math.round(goal * fraction);
      return (
        '<g class="mark" data-at="' + value + '">' +
          '<polygon points="' + starPoints(76, y, 8, 3.4) + '"/>' +
          '<text x="22" y="' + (y + 4) + '" text-anchor="end">' + value + "</text>" +
        "</g>"
      );
    }).join("");

    thermoGraphic.innerHTML =
      '<svg viewBox="0 0 92 336" aria-hidden="true" focusable="false">' +
        "<defs>" +
          '<clipPath id="tube-clip">' +
            '<rect x="' + TUBE.x + '" y="' + TUBE.y + '" width="' + TUBE.w + '" height="' + (TUBE.h + 30) + '" rx="' + TUBE.w / 2 + '"/>' +
          "</clipPath>" +
          '<pattern id="star-sprinkle" width="26" height="30" patternUnits="userSpaceOnUse">' +
            '<polygon points="' + starPoints(7, 8, 4.2, 1.8) + '" fill="rgba(255,255,255,0.75)"/>' +
            '<polygon points="' + starPoints(19, 23, 3, 1.3) + '" fill="rgba(255,255,255,0.5)"/>' +
          "</pattern>" +
        "</defs>" +
        '<rect class="tube" x="' + TUBE.x + '" y="' + TUBE.y + '" width="' + TUBE.w + '" height="' + (TUBE.h + 30) + '" rx="' + TUBE.w / 2 + '"/>' +
        '<g clip-path="url(#tube-clip)">' +
          '<g class="fill" id="thermo-fill">' +
            '<rect x="' + TUBE.x + '" y="' + TUBE.y + '" width="' + TUBE.w + '" height="' + (TUBE.h + 30) + '" fill="#0df0a8"/>' +
            '<rect x="' + TUBE.x + '" y="' + TUBE.y + '" width="' + TUBE.w + '" height="' + (TUBE.h + 30) + '" fill="url(#star-sprinkle)"/>' +
          "</g>" +
        "</g>" +
        '<polygon class="bulb" points="' + starPoints(BULB.cx, BULB.cy, 40, 17) + '"/>' +
        '<polygon class="bulb-shine" points="' + starPoints(BULB.cx, BULB.cy + 2, 13, 5.5) + '"/>' +
        marks +
      "</svg>";
  }

  function showCount(count) {
    const fraction = Math.min(count / goal, 1);
    const fill = document.getElementById("thermo-fill");
    fill.style.transform = "translateY(" + (TUBE.h * (1 - fraction)).toFixed(1) + "px)";

    thermoGraphic.querySelectorAll(".mark").forEach(function (mark) {
      mark.classList.toggle("is-lit", count >= Number(mark.dataset.at));
    });

    thermoCount.textContent = count;
    thermoLabel.textContent = count >= goal
      ? (count === 1 ? "act" : "acts") + " signed up. Goal smashed!"
      : "of " + goal + " acts signed up";
    thermo.hidden = false;
  }

  async function counter(action) {
    const response = await fetch(COUNTER_URL + "/" + action + "/" + COUNTER_KEY, { cache: "no-store" });
    const data = await response.json();
    if (typeof data.value !== "number") throw new Error("No count");
    return data.value;
  }

  buildThermometer();
  counter("get")
    .then(function (value) {
      showCount(0);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { showCount(value); });
      });
    })
    .catch(function () {});

  const closesAt = Date.parse(config.signupsCloseAt || "");
  if (closesAt && Date.now() > closesAt) {
    document.getElementById("status-text").textContent = "Signups closed";
    document.documentElement.classList.add("is-closed");
    form.closest(".card").classList.add("is-done");
    message.textContent = "Signups are closed. See you on Friday 11 December.";
  }

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
      act: form.act.value.trim(),
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
      counter("hit").then(showCount).catch(function () {});
    } catch (error) {
      say("Couldn’t send that just now. Try again in a moment.", true);
      submit.disabled = false;
      submit.textContent = previous;
    }
  });
})();
