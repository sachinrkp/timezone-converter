// Shared top navigation, used identically by index.html/notes.html/profile.html/calendar.html.
//
// Contract with the host page:
//   - Host page has a `<div id="app-header"></div>` placeholder and calls
//     `initNav({ activePage: 'home' | 'notes' | 'calendar' | 'profile' })` once, synchronously.
//   - This module never touches Firebase directly (the host page may not have called
//     firebase.initializeApp() yet when initNav() runs, so calling firebase.auth() here
//     could throw). Instead, the host page's own existing onAuthStateChanged callback
//     should call `window.updateNavAuthUser(user)` (passing null when signed out) to keep
//     the header's Sign In / avatar state in sync.
//   - `#navExtraSlot` is available for a page to inject something small next to the nav
//     links (e.g. notes.html's cloud-sync indicator).
(function () {
  function applyStoredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function navLinkClasses(isActive) {
    return isActive
      ? 'px-1 py-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 transition'
      : 'px-1 py-5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition';
  }

  window.initNav = function initNav(options) {
    options = options || {};
    var activePage = options.activePage || 'home';

    applyStoredTheme();

    var header = document.getElementById('app-header');
    if (!header) return;

    var links = [
      { page: 'home', href: '/', label: 'Home' },
      { page: 'notes', href: '/notes.html', label: 'Notes' },
      { page: 'calendar', href: '/calendar.html', label: 'Calendar' },
      { page: 'profile', href: '/profile.html', label: 'Profile' }
    ];

    var desktopLinksHtml = links
      .map(function (link) {
        return '<a href="' + link.href + '" class="' + navLinkClasses(link.page === activePage) + '">' + link.label + '</a>';
      })
      .join('');

    var mobileLinksHtml = links
      .map(function (link) {
        var activeClass = link.page === activePage ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-700 dark:text-gray-300';
        return '<a href="' + link.href + '" class="block px-4 py-2 text-sm ' + activeClass + ' hover:bg-gray-100 dark:hover:bg-gray-700 transition">' + link.label + '</a>';
      })
      .join('');

    header.innerHTML =
      '<nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">' +
      '  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '    <div class="flex justify-between items-center h-16">' +
      '      <div class="flex items-center gap-6 min-w-0">' +
      '        <a href="/" class="flex items-center space-x-2 shrink-0">' +
      '          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">' +
      '            <span class="text-white font-bold text-sm">UT</span>' +
      '          </div>' +
      '          <span class="hidden sm:inline text-xl font-bold text-gray-800 dark:text-gray-200">Utility Tools</span>' +
      '        </a>' +
      '        <div class="hidden md:flex items-center gap-5">' + desktopLinksHtml + '</div>' +
      '      </div>' +
      '      <div class="flex items-center gap-2 sm:gap-3">' +
      '        <div id="navExtraSlot" class="flex items-center"></div>' +
      '        <button id="navThemeToggle" aria-label="Toggle dark mode" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">' +
      '          <span class="dark:hidden">🌙</span>' +
      '          <span class="hidden dark:inline">☀️</span>' +
      '        </button>' +
      '        <button id="navLoginButton" class="hidden bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">' +
      '          Sign In' +
      '        </button>' +
      '        <div class="relative hidden" id="navProfileSection">' +
      '          <button id="navProfileButton" class="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">' +
      '            <div class="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">' +
      '              <span id="navUserInitials" class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">U</span>' +
      '            </div>' +
      '            <span id="navUserName" class="hidden sm:block text-sm">User</span>' +
      '          </button>' +
      '          <div id="navProfileDropdown" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden z-50">' +
      '            <div class="py-1 md:hidden">' + mobileLinksHtml + '<hr class="my-1 border-gray-200 dark:border-gray-700"></div>' +
      '            <button id="navLogoutButton" class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">' +
      '              🚪 Sign Out' +
      '            </button>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</nav>';

    document.getElementById('navThemeToggle').addEventListener('click', toggleTheme);

    document.getElementById('navProfileButton').addEventListener('click', function () {
      document.getElementById('navProfileDropdown').classList.toggle('hidden');
    });

    document.addEventListener('click', function (e) {
      var dropdown = document.getElementById('navProfileDropdown');
      var button = document.getElementById('navProfileButton');
      if (dropdown && !dropdown.classList.contains('hidden') && !dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    document.getElementById('navLoginButton').addEventListener('click', function () {
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
      } else {
        window.location.href = '/';
      }
    });

    document.getElementById('navLogoutButton').addEventListener('click', async function () {
      try {
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
          await firebase.auth().signOut();
        }
      } catch (error) {
        console.error('Sign out error:', error);
      } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      }
    });
  };

  // Host page calls this from its onAuthStateChanged callback, only when `user` is truthy.
  // Returns true if the page should proceed with its own init, false if it should stop
  // (the gate is now showing and owns the screen). Pages without a #verifyEmailGate
  // element are left alone entirely (always returns true).
  window.requireVerifiedEmail = function requireVerifiedEmail(user) {
    var gate = document.getElementById('verifyEmailGate');
    if (!gate) return true;

    var main = document.getElementById('mainContent');

    if (user.emailVerified) {
      gate.classList.add('hidden');
      if (main) main.classList.remove('hidden');
      return true;
    }

    gate.classList.remove('hidden');
    if (main) main.classList.add('hidden');

    var emailEl = document.getElementById('verifyEmailAddress');
    if (emailEl) emailEl.textContent = user.email || '';

    var resendBtn = document.getElementById('resendVerificationBtn');
    if (resendBtn && !resendBtn.dataset.wired) {
      resendBtn.dataset.wired = 'true';
      resendBtn.addEventListener('click', async function () {
        resendBtn.disabled = true;
        try {
          await user.sendEmailVerification();
          resendBtn.textContent = 'Verification email sent!';
        } catch (error) {
          console.error('Failed to resend verification email:', error);
          resendBtn.textContent = 'Failed to send - try again';
          resendBtn.disabled = false;
        }
      });
    }

    return false;
  };

  // Host page's own onAuthStateChanged callback calls this - see contract note above.
  window.updateNavAuthUser = function updateNavAuthUser(user) {
    var loginBtn = document.getElementById('navLoginButton');
    var profileSection = document.getElementById('navProfileSection');
    if (!loginBtn || !profileSection) return;

    if (user) {
      loginBtn.classList.add('hidden');
      profileSection.classList.remove('hidden');
      var name = user.displayName || user.name || user.email || 'User';
      var nameEl = document.getElementById('navUserName');
      var initialsEl = document.getElementById('navUserInitials');
      if (nameEl) nameEl.textContent = name;
      if (initialsEl) initialsEl.textContent = getInitials(name);
    } else {
      loginBtn.classList.remove('hidden');
      profileSection.classList.add('hidden');
    }
  };

  // Registered once per page load (harmless if called on all 4 pages - the
  // browser treats re-registering the same scope/script as a no-op update check).
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function (error) {
        console.error('Service worker registration failed:', error);
      });
    });
  }
})();
