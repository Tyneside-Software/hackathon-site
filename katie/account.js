(function () {
  var TOKEN_KEY = "fidget-squish-user-token";
  var shop = window.FidgetSquish;
  var gate = document.querySelector("[data-auth-gate]");
  var profile = document.querySelector("[data-auth-profile]");
  var loginForm = document.querySelector("[data-login-form]");
  var signupForm = document.querySelector("[data-signup-form]");
  var profileForm = document.querySelector("[data-profile-form]");
  var statusEl = document.querySelector("[data-auth-status]");
  var profileStatus = document.querySelector("[data-profile-status]");
  var switchLogin = document.querySelector("[data-switch-login]");
  var switchSignup = document.querySelector("[data-switch-signup]");
  var providers = {};
  var pendingPhoto = "";
  var authWrap = document.querySelector(".auth-wrap");
  var friendsBox = document.querySelector("[data-friends]");
  var friendQ = document.querySelector("[data-friend-q]");
  var friendResults = document.querySelector("[data-friend-results]");
  var friendPicked = document.querySelector("[data-friend-picked]");
  var friendList = document.querySelector("[data-friend-list]");
  var friendStatus = document.querySelector("[data-friend-status]");
  var friendAdd = document.querySelector("[data-friend-add]");
  var picked = null;
  var searchTimer = 0;
  var friendNames = {};

  function api() {
    var raw = window.HACKATHON_API || "https://hackathon-api-git-975511976696.europe-west2.run.app";
    return String(raw).replace(/\/$/, "");
  }

  function token() {
    try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
  }

  function setToken(value) {
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  function headers(withAuth) {
    var h = { "Content-Type": "application/json", Accept: "application/json" };
    if (withAuth && token()) h.Authorization = "Bearer " + token();
    return h;
  }

  function showStatus(el, text, warn) {
    if (!el) return;
    el.hidden = !text;
    el.textContent = text || "";
    el.classList.toggle("is-warn", !!warn);
  }

  var USERNAME_HINT = "Usernames can only use letters, numbers, dots, underscores and hyphens — no spaces.";

  function usernameOk(value) {
    return /^[A-Za-z0-9._-]{3,64}$/.test(String(value || "").trim());
  }

  function detailOf(data, fallback) {
    var detail = data && data.detail;
    var text = "";
    if (Array.isArray(detail)) {
      text = detail.map(function (d) { return d.msg || d; }).join(" ");
    } else if (detail) {
      text = String(detail);
    }
    if (/pattern|should match|A-Za-z0-9/i.test(text)) return USERNAME_HINT;
    text = text.replace(/^Value error,\s*/i, "");
    return text || fallback;
  }

  function bindUsernameHint(input) {
    if (!input) return;
    function sync() {
      var v = input.value.trim();
      if (!v || usernameOk(v) || input.validity.tooShort) input.setCustomValidity("");
      else input.setCustomValidity(USERNAME_HINT);
    }
    input.addEventListener("input", sync);
    input.addEventListener("invalid", sync);
  }

  function setPic(imgSel, phSel, src) {
    var img = document.querySelector(imgSel);
    var ph = document.querySelector(phSel);
    if (img) {
      if (src) {
        img.src = src;
        img.hidden = false;
      } else {
        img.removeAttribute("src");
        img.hidden = true;
      }
    }
    if (ph) ph.hidden = !!src;
  }

  function showProfile(user) {
    if (gate) gate.hidden = true;
    if (profile) profile.hidden = false;
    if (friendsBox) friendsBox.hidden = false;
    if (authWrap) authWrap.classList.add("is-in");
    if (!profileForm || !user) return;
    profileForm.username.value = user.username || "";
    profileForm.email.value = user.email || "";
    setPic("[data-profile-pic]", "[data-profile-pic-ph]", user.photo || "");
    runSearch("");
    var nameEl = document.querySelector("[data-profile-name]");
    if (nameEl) nameEl.textContent = user.username || "";
    var badge = document.querySelector("[data-admin-badge]");
    if (badge) badge.hidden = !user.admin;
    loadFriends();
  }

  function showGate() {
    if (gate) gate.hidden = false;
    if (profile) profile.hidden = true;
    if (friendsBox) friendsBox.hidden = true;
    if (authWrap) authWrap.classList.remove("is-in");
    picked = null;
  }

  function saveSession(data) {
    if (data && data.access_token) setToken(data.access_token);
    showProfile(data);
    if (shop && shop.refreshAccountNav) shop.refreshAccountNav();
  }

  function loadMe() {
    if (!shop) {
      showGate();
      return;
    }
    shop.loadAccountBook(function () {
      var me = shop.meLocal && shop.meLocal();
      if (me) showProfile(me);
      else showGate();
    });
  }

  function fileToDataUrl(file, done) {
    if (!file) { done(""); return; }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      var max = 320;
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;
      var scale = Math.min(1, max / Math.max(w, h));
      var canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      done(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = function () { URL.revokeObjectURL(url); done(""); };
    img.src = url;
  }

  function setTab(tab) {
    if (loginForm) loginForm.hidden = tab !== "login";
    if (signupForm) signupForm.hidden = tab !== "signup";
    if (switchLogin) switchLogin.hidden = tab !== "login";
    if (switchSignup) switchSignup.hidden = tab !== "signup";
    var title = document.querySelector("[data-auth-title]");
    var lede = document.querySelector("[data-auth-lede]");
    if (title) title.textContent = tab === "signup" ? "Join fidget squish" : "Welcome to fidget squish";
    if (lede) {
      lede.textContent = tab === "signup"
        ? "Pick a username, a picture if you want, and you’re in."
        : "Squeeze in to keep your bits, leave reviews, and show off a profile pic.";
    }
    showStatus(statusEl, "");
  }

  document.querySelectorAll("[data-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTab(btn.dataset.tab);
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showStatus(statusEl, "Squeezing you in…");
      shop.loginLocal(loginForm.user.value.trim(), loginForm.password.value)
        .then(function (user) {
          showStatus(statusEl, "");
          saveSession(user);
        })
        .catch(function (err) {
          showStatus(statusEl, err.message || "Could not log in", true);
        });
    });
  }

  if (signupForm) {
    var photoInput = signupForm.querySelector('input[name="photo"]');
    if (photoInput) {
      photoInput.addEventListener("change", function () {
        fileToDataUrl(photoInput.files && photoInput.files[0], function (data) {
          pendingPhoto = data;
          setPic("[data-signup-pic]", "[data-signup-pic-ph]", data);
        });
      });
    }
    bindUsernameHint(signupForm.username);
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!usernameOk(signupForm.username.value)) {
        showStatus(statusEl, USERNAME_HINT, true);
        return;
      }
      showStatus(statusEl, "Making your squishy account…");
      shop.registerLocal({
        username: signupForm.username.value.trim(),
        email: signupForm.email.value.trim(),
        password: signupForm.password.value,
        photo: pendingPhoto || ""
      }).then(function (user) {
        showStatus(statusEl, "");
        saveSession(user);
      }).catch(function (err) {
        showStatus(statusEl, err.message || "Could not create account", true);
      });
    });
  }

  if (profileForm) {
    var pPhoto = profileForm.querySelector('input[name="photo"]');
    if (pPhoto) {
      pPhoto.addEventListener("change", function () {
        fileToDataUrl(pPhoto.files && pPhoto.files[0], function (data) {
          pendingPhoto = data;
          setPic("[data-profile-pic]", "[data-profile-pic-ph]", data);
        });
      });
    }
    bindUsernameHint(profileForm.username);
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!usernameOk(profileForm.username.value)) {
        showStatus(profileStatus, USERNAME_HINT, true);
        return;
      }
      showStatus(profileStatus, "Saving…");
      var body = { username: profileForm.username.value.trim() };
      if (pendingPhoto) body.photo = pendingPhoto;
      shop.patchLocal(body).then(function (user) {
        showStatus(profileStatus, "Saved. Looking squishy.");
        saveSession(user);
      }).catch(function (err) {
        showStatus(profileStatus, err.message || "Could not save", true);
      });
    });
  }

  var logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (shop.logoutLocal) shop.logoutLocal();
      setToken("");
      pendingPhoto = "";
      showGate();
      if (shop && shop.refreshAccountNav) shop.refreshAccountNav();
    });
  }

  function socialFail(msg) {
    showStatus(statusEl, msg, true);
  }

  function finishSocial(data) {
    if (!data || !data.access_token) {
      socialFail("Could not finish sign-in.");
      return;
    }
    showStatus(statusEl, "");
    saveSession(data);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load sign-in")); };
      document.head.appendChild(s);
    });
  }

  var googleBtn = document.querySelector("[data-google]");
  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      if (!providers.google_client_id) {
        socialFail("Google isn’t switched on for this shop yet. Use email for now.");
        return;
      }
      if (!window.google || !google.accounts || !google.accounts.id) {
        socialFail("Google is still loading. Try again in a second.");
        return;
      }
      google.accounts.id.initialize({
        client_id: providers.google_client_id,
        callback: function (resp) {
          fetch(api() + "/katie/auth/google", {
            method: "POST",
            headers: headers(false),
            body: JSON.stringify({ credential: resp.credential })
          }).then(function (r) { return r.json().then(function (data) {
            if (!r.ok) throw new Error(detailOf(data, "Google sign-in failed"));
            finishSocial(data);
          }); }).catch(function (err) { socialFail(err.message); });
        }
      });
      google.accounts.id.prompt();
    });
  }

  var appleBtn = document.querySelector("[data-apple]");
  if (appleBtn) {
    appleBtn.addEventListener("click", function () {
      if (!providers.apple_client_id) {
        socialFail("Apple isn’t switched on for this shop yet. Use email for now.");
        return;
      }
      var start = window.AppleID
        ? Promise.resolve()
        : loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
      start.then(function () {
        if (!window.AppleID || !AppleID.auth) throw new Error("Apple sign-in did not load");
        AppleID.auth.init({
          clientId: providers.apple_client_id,
          scope: "name email",
          redirectURI: location.origin + location.pathname,
          usePopup: true
        });
        return AppleID.auth.signIn();
      }).then(function (resp) {
        var authz = (resp && resp.authorization) || {};
        var user = (resp && resp.user) || {};
        var name = user.name ? [user.name.firstName, user.name.lastName].filter(Boolean).join(" ") : "";
        return fetch(api() + "/katie/auth/apple", {
          method: "POST",
          headers: headers(false),
          body: JSON.stringify({
            identity_token: authz.id_token || "",
            email: user.email || "",
            name: name
          })
        });
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(detailOf(data, "Apple sign-in failed"));
          finishSocial(data);
        });
      }).catch(function (err) {
        if (err && err.error === "popup_closed_by_user") return;
        socialFail((err && err.message) || "Apple sign-in didn’t finish.");
      });
    });
  }

  var fbBtn = document.querySelector("[data-facebook]");
  if (fbBtn) {
    fbBtn.addEventListener("click", function () {
      if (!providers.facebook_app_id) {
        socialFail("Facebook isn’t switched on for this shop yet. Use email for now.");
        return;
      }
      if (!window.FB) {
        socialFail("Facebook is still loading. Try again in a second.");
        return;
      }
      FB.login(function (resp) {
        if (!resp || !resp.authResponse) {
          socialFail("Facebook sign-in was cancelled.");
          return;
        }
        fetch(api() + "/katie/auth/facebook", {
          method: "POST",
          headers: headers(false),
          body: JSON.stringify({ access_token: resp.authResponse.accessToken })
        }).then(function (r) { return r.json().then(function (data) {
          if (!r.ok) throw new Error(detailOf(data, "Facebook sign-in failed"));
          finishSocial(data);
        }); }).catch(function (err) { socialFail(err.message); });
      }, { scope: "email,public_profile" });
    });
  }

  fetch(api() + "/katie/auth/providers")
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (data) {
      providers = data || {};
      if (providers.facebook_app_id && !window.FB) {
        window.fbAsyncInit = function () {
          FB.init({ appId: providers.facebook_app_id, cookie: true, xfbml: false, version: "v21.0" });
        };
        loadScript("https://connect.facebook.net/en_US/sdk.js").catch(function () {});
      }
    })
    .catch(function () { providers = {}; });

  function escHtml(s) {
    if (shop && shop.esc) return shop.esc(s);
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function avatarHtml(photo) {
    if (photo) return '<img src="' + escHtml(photo) + '" alt="">';
    return '<span class="friend-ph" aria-hidden="true">💗</span>';
  }

  function whoHtml(u) {
    var badge = u && u.admin ? '<span class="admin-badge">Admin</span>' : "";
    return '<span class="who"><span class="name">' + escHtml(u.username) + "</span>" + badge + "</span>";
  }

  function setPicked(user) {
    picked = user || null;
    if (!friendPicked) return;
    if (!picked) {
      friendPicked.hidden = true;
      return;
    }
    friendPicked.hidden = false;
    var nameEl = document.querySelector("[data-picked-name]");
    if (nameEl) nameEl.textContent = picked.username || "";
    setPic("[data-picked-pic]", "[data-picked-ph]", picked.photo || "");
    var badge = document.querySelector("[data-picked-admin]");
    if (badge) badge.hidden = !picked.admin;
    if (friendAdd) {
      var already = !!(picked.friend || friendNames[picked.username]);
      friendAdd.textContent = already ? "Friends" : "Add friend";
      friendAdd.disabled = already;
    }
    if (friendResults) {
      friendResults.querySelectorAll(".friend-hit").forEach(function (btn) {
        btn.classList.toggle("is-on", btn.dataset.user === picked.username);
      });
    }
  }

  function renderHits(users) {
    if (!friendResults) return;
    if (!users || !users.length) {
      friendResults.innerHTML = '<p class="friend-empty">No other accounts to show yet.</p>';
      friendResults.hidden = false;
      return;
    }
    friendResults.innerHTML = users.map(function (u) {
      var on = picked && picked.username === u.username ? " is-on" : "";
      var tag = u.friend ? '<span class="tag">Friends</span>' : "";
      return (
        '<button type="button" class="friend-hit' + on + '" data-user="' + escHtml(u.username) + '">' +
          avatarHtml(u.photo) +
          whoHtml(u) +
          tag +
        "</button>"
      );
    }).join("");
    friendResults.hidden = false;
    friendResults.querySelectorAll("[data-user]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.dataset.user;
        var found = users.filter(function (u) { return u.username === name; })[0];
        setPicked(found || { username: name, photo: "", friend: !!friendNames[name] });
      });
    });
  }

  function runSearch(q) {
    var users = shop.searchLocal ? shop.searchLocal(q) : [];
    renderHits(users);
  }

  function loadFriends() {
    if (!friendList || !shop.listFriendsLocal) return;
    var users = shop.listFriendsLocal() || [];
    friendNames = {};
    users.forEach(function (u) { friendNames[u.username] = true; });
    if (!users.length) {
      friendList.innerHTML = '<p class="friend-empty">No friends yet. Search above and pick someone.</p>';
      return;
    }
    friendList.innerHTML = users.map(function (u) {
      return (
        '<div class="friend-hit">' +
          avatarHtml(u.photo) +
          whoHtml(u) +
          '<button type="button" class="unfriend" data-unfriend="' + escHtml(u.username) + '">Remove</button>' +
        "</div>"
      );
    }).join("");
    friendList.querySelectorAll("[data-unfriend]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        shop.removeFriendLocal(btn.dataset.unfriend).then(function () {
          if (picked && picked.username === btn.dataset.unfriend) {
            picked.friend = false;
            setPicked(picked);
          }
          loadFriends();
        }).catch(function () {
          showStatus(friendStatus, "Could not remove that friend.", true);
        });
      });
    });
    if (picked) setPicked(picked);
  }

  if (friendQ) {
    friendQ.addEventListener("input", function () {
      clearTimeout(searchTimer);
      var q = friendQ.value.trim();
      searchTimer = setTimeout(function () { runSearch(q); }, 160);
    });
    friendQ.addEventListener("focus", function () {
      runSearch(friendQ.value.trim());
    });
  }

  if (friendAdd) {
    friendAdd.addEventListener("click", function () {
      if (!picked || !picked.username) {
        showStatus(friendStatus, "Pick someone from the search first.", true);
        return;
      }
      showStatus(friendStatus, "Adding…");
      shop.addFriendLocal(picked.username).then(function (data) {
        picked = data;
        picked.friend = true;
        showStatus(friendStatus, "Added " + (picked.username || "") + ".");
        setPicked(picked);
        loadFriends();
      }).catch(function (err) {
        showStatus(friendStatus, err.message || "Could not add friend", true);
      });
    });
  }

  if (/[?&]tab=signup(?:&|$)/.test(location.search)) setTab("signup");
  loadMe();
})();
