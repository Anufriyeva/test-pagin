import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { getImages } from "./image-api";

const galleryElement = document.querySelector('.gallery');
const searchForm = document.getElementById('search-form');
// const loadMoreBtn = document.querySelector('.load-more');
const prevPageBtn = document.querySelector('.prev-page');
const nextPageBtn = document.querySelector('.next-page');
const currentPageElement = document.querySelector('.current-page');

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

function updatePaginationState(totalPages) {
  currentPageElement.textContent = `Page ${page}`;
  prevPageBtn.disabled = page === 1;
  nextPageBtn.disabled = page === totalPages;

  // Устанавливаем класс "current" для выбранной страницы
  const pageNumbers = document.querySelectorAll('.page-number');
  pageNumbers.forEach((pageNumber, index) => {
    if (index + 1 === page) {
      pageNumber.classList.add('current');
    } else {
      pageNumber.classList.remove('current');
    }
  });
}

let totalHits = 0;

async function submitSearchForm(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const searchQuery = formData.get('searchQuery').trim();

  if (!searchQuery) {
    galleryElement.innerHTML = '';
    return; // Удалили строку loadMoreBtn.style.display = 'none';
  }

  try {
    page = 1;
    currentSearchQuery = searchQuery;

    galleryElement.innerHTML = '';

    const result = await getImages(searchQuery, page);
    totalHits = result.totalHits;
    const { hits } = result;

    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    galleryElement.innerHTML = '';
    createElementGallery(hits);

    if (hits.length < totalHits) {
      loadPage(1); // Загрузка второй страницы, так как первая уже отображена
    }

    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    totalHits = totalHits; // Обновляем значение totalHits
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  } finally {
    isFetching = false;
  }
}

async function loadPage(pageNumber) {
  page = pageNumber;
  try {
    const { hits, totalHits, totalPages } = await getImages(currentSearchQuery, page, 20);
    galleryElement.innerHTML = '';
    createElementGallery(hits);
    updatePaginationState(totalPages); // Передаем общее количество страниц
  } catch (error) {
    Notiflix.Notify.failure('Error fetching images. Please try again later.');
    console.error('Error fetching images:', error);
  }
}

prevPageBtn.addEventListener('click', () => {
  if (page > 1) {
    loadPage(page - 1);
  }
});

nextPageBtn.addEventListener('click', () => {
  if (page * 20 < totalHits) {
    loadPage(page + 1);
  }
});

const pageNumbers = document.querySelectorAll('.page-number');
pageNumbers.forEach((pageNumber, index) => {
  pageNumber.addEventListener('click', () => {
    // Удаляем класс "current-page" у всех кнопок
    pageNumbers.forEach((btn) => btn.classList.remove('current-page'));
    
    // Устанавливаем класс "current-page" для текущей выбранной кнопки
    pageNumber.classList.add('current-page');
    
    loadPage(index + 1); // Загрузка выбранной страницы
  });
});

searchForm.addEventListener('submit', submitSearchForm);

// async function loadMoreImages() {
//   loadMoreBtn.disabled = true;
//   page++;

//   try {
//     const { hits, totalHits } = await getImages(currentSearchQuery, page, 40);
//     createElementGallery(hits);

//     if (hits.length >= totalHits) {
//       loadMoreBtn.style.display = 'none';
//       Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
//     }
//   } catch (error) {
//     Notiflix.Notify.failure('Error fetching more images. Please try again later.');
//     console.error('Error fetching images:', error);
//   } finally {
//     loadMoreBtn.disabled = false;
//   }
// }

// searchForm.addEventListener('submit', submitSearchForm);






