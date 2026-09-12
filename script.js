var mainList = [
  { rank: 1, name: "shutdown JULY 11", creator: "pester", tier: "extreme", points: 500 },
  { rank: 2, name: "Living Open", creator: "pester", tier: "extreme", points: 500 },
  { rank: 3, name: "practice emeralds", creator: "pester", tier: "extreme", points: 500 }
];

var legacyList = [];

var skullIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c-4.4 0-8 3-8 7.5 0 3 1.6 4.7 2.4 6.5.4.9.6 2 .6 3h10c0-1 .2-2.1.6-3 .8-1.8 2.4-3.5 2.4-6.5C20 6 16.4 3 12 3Z"/><circle cx="9" cy="11" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.4" fill="currentColor" stroke="none"/><path d="M9 15c1 .8 5 .8 6 0"/></svg>';

var state = { active: "main", query: "" };

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
        '<div class="points tier-' + d.tier + '">' + d.points + 'p</div>' +
      '</div>';
  }).join("");

  Array.prototype.forEach.call(el.querySelectorAll(".card"), function (card) {
    card.addEventListener("click", function () {
      alert(card.getAttribute("data-name"));
    });
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
