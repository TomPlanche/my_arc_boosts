/**
 * @file content.js
 * @description I was tired of swiping left on Twitter to go back to the homepage.
 * So I created this extension to go back to the homepage by pressing the "Escape" key.
 *
 * @author Tom Planche (https://github.com/tomplanche).
 */

// There are a lot of DOM changes on Twitter, this
// is used to prevent for calling the event listener numerous times.
let IS_CALLED = false;

/**
 * @function checkIfCloseButton
 * @description Looks for the close button on the page and click on it if found.
 */
const goBackIfCloseBtn = () => {
  const closeButton = document.querySelector('[aria-label="Close"]');

  // '!!' is used to convert the value to a boolean.
  // '!null === true', '!!null = false'.
  // '!Element = false', '!!Element = true'.
  !!closeButton && closeButton.click();

  return !!closeButton;
}

/**
 * @function eventListenerForGoingBack
 * @description Looks for the "Escape" key on keydown event.
 *
 * @param event {KeyboardEvent} the 'keydown' event.
 */
const eventListenerForGoingBack = (event) => {
  if (event.key === "Escape") {
    // Checks if we're looking at a tweet modal.
    if (!goBackIfCloseBtn()) {
      window.history.back();
    }
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
