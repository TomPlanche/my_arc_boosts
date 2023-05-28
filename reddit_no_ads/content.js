/**
 * Dynamically removes ads from the page.
 *
 * @author Tom Planche
 */

// VARIABLES ================================================================================================ VARIABLES
let POSTS = []; // { [postId]: { postRef, postText, postId, isRemoved? } }
let SEEN_POSTS = {};

let INFOS = {
  backgroundColor: "#1A1A1B",
  borderRadius: "4px",
  border: "1px solid #343536",
  marginBottom: "10px",
  padding: "8px",

  replacementHeight: "58px",
  color: "#FFFFFF",
}

const REVIEW_INTERVAL = 1000; // 1 second.
// END VARIABLES =======================================================================================  END VARIABLES

// FUNCTIONS ================================================================================================ FUNCTIONS

const customLog = (message) => {
  console.log(`[reddit_no_ads Arc boost] ${message}`);
}

/**
 * @function getInfos
 * @description Gets the needed infos from the page.
 *
 * @return {void}
 */
const getInfos = () => {
  const createPost = document.querySelector("._2jJNpBqXMbbyOiGCElTYxZ");

  const computedStyle = window.getComputedStyle(createPost);


  if (createPost) {
    INFOS = {
      ...INFOS,

      backgroundColor: computedStyle.backgroundColor,
      borderRadius: computedStyle.borderRadius,
      border: computedStyle.border,
      padding: computedStyle.padding,
      replacementHeight: createPost.getBoundingClientRect().height + "px",
      color: computedStyle.color,
    };
  }
}

/**
 * @function formatPostText
 * @description Formats the text of a post.
 *
 * @param text {string} the text to format.
 *
 * @return {string} the formatted text.
 */
const formatPostText = (text) => {
  const formattedText = text.replace(/\n/g, " ").trim();
  const charLimit = 240;

  if (formattedText.length > charLimit) {
    return `${formattedText.slice(0, charLimit)}…`;
  }

  return formattedText;
}

/**
 * @function hashStringToId
 * @description Generates a unique id from a string.
 *
 * @param str {string} the string to hash.
 * @return {number} the hashed string.
 */
const hashStringToId = (str) => {
  let hash = 5381; // Prime number.
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}

/**
 * @function extractPost
 * @description Extracts a tweet from a DOM element.
 *
 * @param elem {HTMLElement} the DOM element to extract the tweet from.
 *
 * @return {{ref: HTMLElement, removed: boolean, topic: undefined, id: number, text: string}}
 */
const extractPost = (elem) => {
  const textElem = elem.querySelector("div[data-adclicklocation=\"title\"]");

  if (!textElem) {
    return undefined;
  }

  const text = textElem.textContent;

  return {
    // Generate a unique id for each tweet ourselves because
    // reddit HTML doesn't have good IDs we can use.
    id: hashStringToId(text),
    text: formatPostText(text),
    // Include a ref to the DOM element for easy manipulation.
    ref: elem,
    topic: undefined,
    removed: false,
  };
}


/**
 * @function reviewPosts
 * @description Reviews the posts on the page and removes the bad ones.
 *
 * @return {void}
 */
const reviewPosts = () => {

  const AD_CLASS = "._2oEYZXchPfHwcf9mTMGMg8.V0WjfoF5BV7_qbExmbmeR";

  const ads = POSTS
    .filter((post) => {
      return !post.removed && !!post.ref.querySelector(AD_CLASS);
    })

  ads.forEach(({id}) => removePost(id))
}

/**
 * @function createPostReplacement
 * @description Creates a replacement for a removed post.
 *
 * @return {HTMLDivElement}
 */
const createPostReplacement = () => {
  const removedBanner = document.createElement("div");

  removedBanner.style.padding = INFOS.padding;
  removedBanner.style.backgroundColor = INFOS.backgroundColor;
  removedBanner.style.borderRadius = INFOS.borderRadius;
  removedBanner.style.border = INFOS.border;
  removedBanner.style.marginBottom = INFOS.marginBottom;
  removedBanner.style.height = INFOS.replacementHeight;

  removedBanner.style.display = "flex";
  removedBanner.style.justifyContent = "center";
  removedBanner.style.alignItems = "center";

  removedBanner.innerHTML = `
<span
  style="
    width: 100%;
    height: 100%;
    font-size: 20px;
    line-height: 20px;
    color: ${INFOS.color};
    display: flex;
    justify-content: center;
    align-items: center;
  "
  >This post is about an ad.
</span>
  `;

  return removedBanner;
}

/**
 * @function removePost
 *
 * @param id {number} the id of the post to remove.
 * @param topic {string} the topic of the post to remove.
 *
 * @return {void}
 */
const removePost = (id, topic = "ad") => {
  const post = SEEN_POSTS[id];

  if (post === undefined) {
    customLog(`Error: couldn't find bad post ${id}`);
    return;
  }

  // Check if this is the first time that we're removing it.
  // If yes, we'll log it and mark it as removed.
  if (!post.removed) {
    customLog(`Removed post ${post.id}.`);

    post.topic = topic;
    post.removed = true;
  }

  const postReplacement = createPostReplacement();

  const parentNode = post.ref.parentNode;
  if (!parentNode) {
    customLog(`Error: couldn't find parent`);
    return;
  }

  parentNode.replaceChild(postReplacement, post.ref);
}

/**
 * @function addMutationObserver
 * @description Adds a mutation observer to the page.
 *
 * @returns {void}
 */
const addMutationObserver = () => {
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach((mutation) => {

      const currentPosts = [...document.body.querySelectorAll('div[data-testid="post-container"]')]
        .map(extractPost)
        .filter((post) => post !== undefined && post.text.length !== 0);

      currentPosts.forEach((post) => {
        if (SEEN_POSTS[post.id]) {
          const seenPost = SEEN_POSTS[post.id];

          // Update the ref.
          seenPost.ref = post.ref;

          // If removed, remove the post.
          if (seenPost.removed) {
            removePost(seenPost.id, 'ad');
          }
        } else {
          SEEN_POSTS[post.id] = post;
          POSTS.push(post);
        }
      })
    });
  });

  observer.observe(document.body, { subtree: true, childList: true });
}
// END FUNCTIONS =======================================================================================  END FUNCTIONS

// MAIN =========================================================================================================  MAIN
window.onload = () => {
  customLog("Arc boost for twitter is running.")
  getInfos();
  addMutationObserver();

  setInterval(reviewPosts, REVIEW_INTERVAL);
}
// END MAIN  ================================================================================================  END MAIN
