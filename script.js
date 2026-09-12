var sb = window.supabase.createClient(
  "https://rkzbbudlslekhxptfgdh.supabase.co",
  "sb_publishable_5acEu_aNb8oTa3gNmZLKtw_vbYhdUk_"
);

var mainList = [
  { rank: 1, name: "shutdown JULY 11", creator: "pester", tier: "extreme", points: 500 },
  { rank: 2, name: "Living Open", creator: "pester", tier: "extreme", points: 500 },
  { rank: 3, name: "practice emeralds", creator: "pester", tier: "extreme", points: 500 }
];

var legacyList = [];

var skullIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c-4.4 0-8 3-8 7.5 0 3 1.6 4.7 2.4 6.5.4.9.6 2 .6 3h10c0-1 .2-2.1.6-3 .8-1.8 2.4-3.5 2.4-6.5C20 6 16.4 3 12 3Z"/><circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none"/><path d="M9 15c1 .8 5 .8 6 0"/></svg>';
var proofIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m10 8 6 4-6 4V8Z"/><rect x="3" y="4" width="18" height="16" rx="3"/></svg>';

var state = { active: "main", query: "" };
var session = null;
var myProofs = {};

function currentData() {
  var data = state.active === "main" ? mainList : legacyList;
  if (!state.query) return data;
  var q = state.query.toLowerCase();
  return data.filter(function (d) {
    return d.name.toLowerCase().indexOf(q) !== -1 || d.creator.toLowerCase().indexOf(q) !== -1;
  });
}

function renderList() {
  var el = document.getElementById("list");
  var data = currentData();

  if (data.length === 0) {
    el.innerHTML = state.query
      ? '<div class="empty">No levels match your search.</div>'
      : '<div class="empty">No levels here yet.</div>';
    return;
  }

  el.innerHTML = data.map(function (d) {
    var hasProof = !!myProofs[d.name];
    return '' +
      '<div class="card" data-name="' + d.name + '">' +
        '<div class="thumb tier-' + d.tier + '">' +
          '<div class="rank-tag">#' + d.rank + '</div>' +
          skullIcon +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + d.name + '</h3>' +
          '<p>Creator: ' + d.creator + '</p>' +
        '</div>' +
        '<div class="proof-btn' + (hasProof ? ' has-proof' : '') + '" data-level="' + d.name + '">' + proofIcon + '</div>' +
        '<div class="points tier-' + d.tier + '">' + d.points + 'p</div>' +
      '</div>';
  }).join("");

  Array.prototype.forEach.call(el.querySelectorAll(".card"), function (card) {
    card.addEventListener("click", function () {
      alert(card.getAttribute("data-name"));
    });
  });

  Array.prototype.forEach.call(el.querySelectorAll(".proof-btn"), function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      handleProofClick(btn.getAttribute("data-level"));
    });
  });
}

function handleProofClick(levelName) {
  if (!session) {
    alert("Log in to submit a proof.");
    return;
  }
  var existing = myProofs[levelName];
  var url = prompt(existing ? "Update your proof link:" : "Paste your proof video link:", existing || "");
  if (url === null) return;
  url = url.trim();
  if (url === "") return;

  sb.from("proofs")
    .upsert({ user_id: session.user.id, level_name: levelName, video_url: url }, { onConflict: "user_id,level_name" })
    .then(function (res) {
      if (res.error) {
        alert("Couldn't save that proof: " + res.error.message);
        return;
      }
      myProofs[levelName] = url;
      renderList();
    });
}

function loadMyProofs() {
  if (!session) {
    myProofs = {};
    renderList();
    return;
  }
  sb.from("proofs")
    .select("level_name, video_url")
    .eq("user_id", session.user.id)
    .then(function (res) {
      myProofs = {};
      if (res.data) {
        res.data.forEach(function (row) {
          myProofs[row.level_name] = row.video_url;
        });
      }
      renderList();
    });
}

Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (tab) {
  tab.addEventListener("click", function () {
    document.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    state.active = tab.getAttribute("data-list");
    renderList();
  });
});

document.getElementById("search").addEventListener("input", function (e) {
  state.query = e.target.value;
  renderList();
});

renderList();

var overlay = document.getElementById("overlay");
var panel = document.getElementById("profile-panel");

function openProfile() {
  overlay.classList.add("open");
  panel.classList.add("open");
}

function closeProfile() {
  overlay.classList.remove("open");
  panel.classList.remove("open");
}

document.getElementById("profile-btn").addEventListener("click", openProfile);
document.getElementById("profile-close").addEventListener("click", closeProfile);
overlay.addEventListener("click", closeProfile);

function setTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  localStorage.setItem("pestergdps-theme", name);
  Array.prototype.forEach.call(document.querySelectorAll(".swatch"), function (btn) {
    btn.classList.toggle("active", btn.getAttribute("data-theme") === name);
  });
}

Array.prototype.forEach.call(document.querySelectorAll(".swatch"), function (btn) {
  btn.addEventListener("click", function () {
    setTheme(btn.getAttribute("data-theme"));
  });
});

var savedTheme = localStorage.getItem("pestergdps-theme") || "crimson";
setTheme(savedTheme);

function renderAuthSection() {
  var el = document.getElementById("auth-section");

  if (session) {
    var label = session.user.email ? session.user.email.split("@")[0] : "member";
    el.innerHTML =
      '<div class="profile-id">' +
        '<div class="avatar">' + label.charAt(0).toUpperCase() + '</div>' +
        '<div><h3>' + label + '</h3><p>Signed in</p></div>' +
      '</div>' +
      '<button class="auth-submit" id="logout-btn">Log out</button>';

    document.getElementById("logout-btn").addEventListener("click", function () {
      sb.auth.signOut();
    });
    return;
  }

  el.innerHTML =
    '<div class="auth-tabs">' +
      '<button class="auth-tab active" data-mode="login">Log in</button>' +
      '<button class="auth-tab" data-mode="register">Register</button>' +
    '</div>' +
    '<form id="auth-form">' +
      '<input class="auth-input" type="email" id="auth-email" placeholder="Email" required />' +
      '<input class="auth-input" type="password" id="auth-password" placeholder="Password" required />' +
      '<button type="submit" class="auth-submit" id="auth-submit-btn">Log in</button>' +
      '<p class="auth-message" id="auth-message"></p>' +
    '</form>';

  var mode = "login";

  Array.prototype.forEach.call(el.querySelectorAll(".auth-tab"), function (tab) {
    tab.addEventListener("click", function () {
      mode = tab.getAttribute("data-mode");
      el.querySelector(".auth-tab.active").classList.remove("active");
      tab.classList.add("active");
      document.getElementById("auth-submit-btn").textContent = mode === "login" ? "Log in" : "Register";
      document.getElementById("auth-message").textContent = "";
    });
  });

  document.getElementById("auth-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("auth-email").value.trim();
    var password = document.getElementById("auth-password").value;
    var msg = document.getElementById("auth-message");
    msg.textContent = "Please wait...";

    var action = mode === "login"
      ? sb.auth.signInWithPassword({ email: email, password: password })
      : sb.auth.signUp({ email: email, password: password });

    action.then(function (res) {
      if (res.error) {
        msg.textContent = res.error.message;
        return;
      }
      if (mode === "register" && res.data && !res.data.session) {
        msg.textContent = "Check your email to confirm your account.";
      }
    });
  });
}

sb.auth.getSession().then(function (res) {
  session = res.data.session;
  renderAuthSection();
  loadMyProofs();
});

sb.auth.onAuthStateChange(function (event, newSession) {
  session = newSession;
  renderAuthSection();
  loadMyProofs();
});
