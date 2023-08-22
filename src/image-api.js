import axios from 'axios';

const API_KEY = "38734674-7bb0a4a530548aef0bc7ad612";
const API_BASE_URL = "https://pixabay.com/api/";

export async function getImages(query, page = 1) {
  try {
    const resp = await axios.get(API_BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 20,
        page: page,
      },
    });

    if (resp.status >= 400) {
      throw new Error('API error');
    }

    return resp.data;
  } catch (error) {
    throw new Error('Error while fetching images:', error);
  }
}

