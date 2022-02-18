'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
	// console.debug("generateStoryMarkup", story);
	const hostName = story.getHostName();
	return $(`
<li id="${story.storyId}">
<i class="fa-solid fa-heart ${checkForFavorites(story) ? 'red' : ''}"></i>
  <a href="${story.url}" target="a_blank" class="story-link">
    ${story.title}
  </a>
  <small class="story-hostname">(${hostName})</small>
  <small class="story-author">by ${story.author}</small>
  <small class="story-user">posted by ${story.username}</small>
</li>
`);
}

function checkForFavorites(story) {
	return currentUser.favorites.some((s) => s.storyId === story.storyId);
}

function toggleFav(e) {
	$(e.target).toggleClass('red');
	let $storyId = $(e.target).parent().attr('id');
	let story = storyList.stories.find((story) => story.storyId === $storyId);
	!e.target.classList.contains('red')
		? currentUser.removeFavoritedStories(story)
		: currentUser.saveFavoritedStories(story);
}

$allStoriesList.on('click', '.fa-heart', toggleFav);
$favorites.on('click', '.fa-heart', toggleFav);
$myStories.on('click', '.fa-heart', toggleFav);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

function putFavoritesOnPage() {
	$favorites.empty();
	for (let favorite of currentUser.favorites) {
		const $favorite = generateStoryMarkup(favorite);
		$favorites.append($favorite);
	}
}

function putMyStoriesOnPage() {
	$myStories.empty();
	for (let myStory of currentUser.ownStories) {
		const $myStory = generateStoryMarkup(myStory);
		$myStory.prepend($('<i class="fa-solid fa-trash-can"></i>'));
		$myStories.append($myStory);
	}
}

$myStories.on('click', '.fa-trash-can', async function(e) {
	let storyId = e.target.closest('li').id;
	storyList.removeStory(storyId);
	putMyStoriesOnPage();
});

async function submitStory(e) {
	e.preventDefault();
	const story = await storyList.addStory(currentUser, {
		author: $('.author-name').val(),
		title: $('.story-title').val(),
		url: $('.story-url').val()
	});
	$allStoriesList.prepend(generateStoryMarkup(story));
	$submitForm.slideUp('slow');
}

$submitBtn.on('click', submitStory);
