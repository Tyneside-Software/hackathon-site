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

  function detailOf(data, fallback) {
    var detail = data && data.detail;
    if (Array.isArray(detail)) {
      detail = detail.map(function (d) { return d.msg || d; }).join(" ");
    }
    return detail || fallback;
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
    if (!profileForm || !user) return;
    profileForm.username.value = user.username || "";
    profileForm.email.value = user.email || "";
    setPic("[data-profile-pic]", "[data-profile-pic-ph]", user.photo || "");
  }

  function showGate() {
    if (gate) gate.hidden = false;
    if (profile) profile.hidden = true;
  }

  function saveSession(data) {
    if (data && data.access_token) setToken(data.access_token);
    showProfile(data);
    if (shop && shop.refreshAccountNav) shop.refreshAccountNav();
  }

  function loadMe() {
    if (!token()) {
      showGate();
      return;
    }
    fetch(api() + "/users/me", { headers: headers(true) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(showProfile)
      .catch(function () {
        setToken("");
        showGate();
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
      fetch(api() + "/login", {
        method: "POST",
        headers: headers(false),
        body: JSON.stringify({
          username: loginForm.user.value.trim(),
          password: loginForm.password.value
        })
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(detailOf(data, "Could not log in"));
          setToken(data.access_token);
          return fetch(api() + "/users/me", { headers: headers(true) });
        });
      }).then(function (r) { return r.json(); })
        .then(function (user) {
          showStatus(statusEl, "");
          saveSession(Object.assign(user, { access_token: token() }));
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
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showStatus(statusEl, "Making your squishy account…");
      fetch(api() + "/register", {
        method: "POST",
        headers: headers(false),
        body: JSON.stringify({
          username: signupForm.username.value.trim(),
          email: signupForm.email.value.trim(),
          password: signupForm.password.value
        })
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) {
            throw new Error(detailOf(data, "Could not create account"));
          }
          return fetch(api() + "/login", {
            method: "POST",
            headers: headers(false),
            body: JSON.stringify({
              username: signupForm.username.value.trim(),
              password: signupForm.password.value
            })
          });
        });
      }).then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.access_token) throw new Error("Could not log in");
          setToken(data.access_token);
          if (!pendingPhoto) return fetch(api() + "/users/me", { headers: headers(true) }).then(function (r) { return r.json(); });
          return fetch(api() + "/users/me", {
            method: "PATCH",
            headers: headers(true),
            body: JSON.stringify({ photo: pendingPhoto })
          }).then(function (r) { return r.json(); });
        })
        .then(function (user) {
          showStatus(statusEl, "");
          saveSession(Object.assign(user, { access_token: token() }));
        })
        .catch(function (err) {
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
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showStatus(profileStatus, "Saving…");
      var body = { username: profileForm.username.value.trim() };
      if (pendingPhoto) body.photo = pendingPhoto;
      fetch(api() + "/users/me", {
        method: "PATCH",
        headers: headers(true),
        body: JSON.stringify(body)
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(detailOf(data, "Could not save"));
          if (data.access_token) setToken(data.access_token);
          showStatus(profileStatus, "Saved. Looking squishy.");
          saveSession(data);
        });
      }).catch(function (err) {
        showStatus(profileStatus, err.message || "Could not save", true);
      });
    });
  }

  var logoutBtn = document.querySelector("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
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

  if (/[?&]tab=signup(?:&|$)/.test(location.search)) setTab("signup");
  loadMe();
})();
