import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { getImages } from "./image-api";

const galleryElement = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentSearchQuery = '';
let isFetching = false;

async function createElementGallery(images) {
  const imgMarkup = images
    .map(image => {
      return `
      <a href="${image.largeImageURL}" class="photo-card">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </a>
    `;
    })
    .join('');

  galleryElement.insertAdjacentHTML('beforeend', imgMarkup);
  lightbox.refresh();
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

async function submitSearchForm(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const searchQuery = formData.get('searchQuery').trim();

  if (!searchQuery) {
    galleryElement.innerHTML = '';
    loadMoreBtn.style.display = 'none';
  return;
}

  try {
    page = 1;
    currentSearchQuery = searchQuery;

    galleryElement.innerHTML = '';
    loadMoreBtn.style.display = 'none';

    const { hits, totalHits } = await getImages(searchQuery, page);

    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    galleryElement.innerHTML = '';
    createElementGallery(hits);

    if (hits.length < totalHits) {
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.addEventListener('click', loadMoreImages);
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    isFetching = false;
  }
}

async function loadMoreImages() {
  loadMoreBtn.disabled = true;
  page++;

  try {
    const { hits, totalHits } = await getImages(currentSearchQuery, page, 40);
    createElementGallery(hits);

    if (hits.length >= totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    Notiflix.Notify.failure('Error fetching more images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    loadMoreBtn.disabled = false;
  }
}

searchForm.addEventListener('submit', submitSearchForm);


