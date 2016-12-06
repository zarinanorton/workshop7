var token = 'eyJpZCI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNCJ9';
/**
 * Properly configure+send an XMLHttpRequest with error handling, authorization token,
 * and other needed properties.
 */
function sendXHR(verb, resource, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(verb, resource);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);

  // The below comment tells ESLint that FacebookError is a global.
  // Otherwise, ESLint would complain about it! (See what happens in Atom if
  // you remove the comment...)
  /* global FacebookError */

  // Response received from server. It could be a failure, though!
  xhr.addEventListener('load', function() {
    var statusCode = xhr.status;
    var statusText = xhr.statusText;
    if (statusCode >= 200 && statusCode < 300) {
      // Success: Status code is in the [200, 300) range.
      // Call the callback with the final XHR object.
      cb(xhr);
    } else {
      // Client or server error.
      // The server may have included some response text with details concerning
      // the error.
      var responseText = xhr.responseText;
      FacebookError('Could not ' + verb + " " + resource + ": Received " + statusCode + " " + statusText + ": " + responseText);
    }
  });

  // Time out the request if it takes longer than 10,000 milliseconds (10 seconds)
  xhr.timeout = 10000;

  // Network failure: Could not connect to server.
  xhr.addEventListener('error', function() {
    FacebookError('Could not ' + verb + " " + resource + ": Could not connect to the server.");
  });

  // Network failure: request took too long to complete.
  xhr.addEventListener('timeout', function() {
    FacebookError('Could not ' + verb + " " + resource + ": Request timed out.");
  });

  switch (typeof(body)) {
    case 'undefined':
      // No body to send.
      xhr.send();
      break;
    case 'string':
      // Tell the server we are sending text.
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.send(body);
      break;
    case 'object':
      // Tell the server we are sending JSON.
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      // Convert body into a JSON string.
      xhr.send(JSON.stringify(body));
      break;
    default:
      throw new Error('Unknown body type: ' + typeof(body));
  }
}

/**
 * Emulates a REST call to get the feed data for a particular user.
 */
export function getFeedData(user, cb) {
  sendXHR('GET', '/user/000000000000000000000004/feed', undefined, (xhr) => {
    // Call the callback with the data.
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a new status update to the database.
 */
export function postStatusUpdate(user, location, contents, image, cb) {
  sendXHR('POST', '/feeditem', {
    userId: user,
    location: location,
    image: image,
    contents: contents
  }, (xhr) => {
    // Return the new status update.
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a new comment to the database on the given feed item.
 */
export function postComment(feedItemId, author, contents, cb) {
  sendXHR('POST', '/feeditem/' + feedItemId + '/comments', {
    "author": author,
    "contents": contents,
    "postDate": new Date().getTime()
  }, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Updates a feed item's likeCounter by adding the user to the likeCounter.
 * Provides an updated likeCounter in the response.
 */
export function likeFeedItem(feedItemId, userId, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/likelist/' + userId, undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Updates a feed item's likeCounter by removing the user from the likeCounter.
 * Provides an updated likeCounter in the response.
 */
export function unlikeFeedItem(feedItemId, userId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId + '/likelist/' + userId, undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a 'like' to a comment.
 */
export function likeComment(feedItemId, commentIdx, userId, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/comments/' + commentIdx + '/likelist/' + userId, undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Removes a 'like' from a comment.
 */
export function unlikeComment(feedItemId, commentIdx, userId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId + '/comments/' + commentIdx + '/likelist/' + userId, undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Updates the text in a feed item (assumes a status update)
 */
export function updateFeedItemText(feedItemId, newContent, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/content', newContent, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Deletes a feed item.
 */
export function deleteFeedItem(feedItemId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId, undefined, () => {
    cb();
  });
}

/**
 * Searches for feed items with the given text.
 */
export function searchForFeedItems(queryText, cb) {
  sendXHR('POST', '/search', queryText, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}
