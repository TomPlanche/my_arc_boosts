/**
 * @file content.js
 * @description This file listen for DOM changes on the page and implements the reddit
 * functionality of going back on 'esc' key pressed when not on the 'home' page.
 * @author Tom Planche (https://github.com/tomplanche).
 */

// There are a lot of DOM changes on twitter, this
// is used to prevent for calling the event listener numerous times.
let IS_CALLED = false;

/**
 * @function eventListenerForGoingBack
 * @description Looks for the "Escape" key on keydown event.
 * 
 * @param event {KeyboardEvent} the 'keydown' event.
 */
const eventListenerForGoingBack = (event) => {
  if (event.key === "Escape") {
    window.history.back();
  }
}

/**
 * @function addEventListenerForGoingBack
 * @description Adds the event listener for 'keydown'.
 */
const addEventListenerForGoingBack = () => {
  IS_CALLED = true;
  document.addEventListener('keydown', eventListenerForGoingBack);
}

/**
 * @function removeEventListenerForGoingBack
 * @description Removes the event listener for 'keydown'.
 */
const removeEventListenerForGoingBack = () => {
  IS_CALLED = false;
  document.removeEventListener('keydown', eventListenerForGoingBack);
}

/**
 * @function lookIfHome
 * @description Looks if the current page is the twitter's homepage.
 */
const lookIfHome = () => {
  window.location.href !== "https://twitter.com/home"
  ? !IS_CALLED && addEventListenerForGoingBack()
  : IS_CALLED && removeEventListenerForGoingBack();
}

/**
 * @function addMutationObserver
 * @description Adding the mutation observer to the page.
 */
function addMutationObserver() {
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          lookIfHome();
        });
      });

      observer.observe(document.body, { subtree: true, childList: true });      
}

addMutationObserver();