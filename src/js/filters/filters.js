import { getCategoryList, getCurrentProducts } from '../services/food-api';
import { loadFromLS, saveToLS } from '../services/helpers';
import { mainProductMarkup } from '../home-content/main-products/markup-main-product';

const categoryList = document.querySelector('.category-list');
const form = document.querySelector('.form');
const input = document.querySelector('.keyword');
const filtersABClist = document.querySelector('.filters-all-param-list');

const LOCALSTORAGE_KEY = 'params of search';
const defaultParams = {
  keyword: null,
  category: null,
  page: 1,
  limit: 9,
  byABC: true,
};

loadFromLS(LOCALSTORAGE_KEY) ?? saveToLS(LOCALSTORAGE_KEY, defaultParams);

async function createCategoryList() {
  const categories = await getCategoryList();
  const markup = categories
    .map(
      category =>
        `<li data-category="${category}" class="category-type">${replaceText(
          category
        )}</li>`
    )
    .join('');
  categoryList.insertAdjacentHTML('afterbegin', markup);
}

async function changeCategory(e) {
  if (!e.target.classList.contains('category-type')) {
    return;
  }

  const currentCategory = e.target.dataset.category;
  const oldParams = loadFromLS(LOCALSTORAGE_KEY);
  let newParams;
  if (currentCategory !== 'show-all') {
    newParams = { ...oldParams, category: currentCategory };
  } else {
    newParams = { ...oldParams, category: null };
  }
  const currentProduct = await getCurrentProducts(newParams);

  if (!currentProduct) {
    console.log('Ploha');
  } else {
    mainProductMarkup(currentProduct);
  }
  saveToLS(LOCALSTORAGE_KEY, newParams);
}

async function changeKeyword(e) {
  const oldParams = loadFromLS(LOCALSTORAGE_KEY);
  const newParams = { ...oldParams, keyword: e.target.value };
  const newFilterBy = await getCurrentProducts(newParams);
  mainProductMarkup(newFilterBy);
  saveToLS(LOCALSTORAGE_KEY, newParams);
}

async function formSub(e) {
  e.preventDefault();
  const currentParams = loadFromLS(LOCALSTORAGE_KEY);
  const currentProduct = await getCurrentProducts(currentParams);
  if (!currentProduct) {
    console.log('Ploha');
  } else {
    mainProductMarkup(currentProduct);
  }
}

function replaceText(arg) {
  return arg.replaceAll('_', ' ');
}

async function getFilter(e) {
  let filter;
  let state;
  let args = e.target.dataset.filterparam;
  switch (args) {
    case 'byAtoZ':
      filter = 'byABC';
      state = true;
      break;
    case 'byZtoA':
      filter = 'byABC';
      state = false;
      break;
    case 'byCheaperfirst':
      filter = 'byPrice';
      state = true;
      break;
    case 'byExpensivefirst':
      filter = 'byPrice';
      state = false;
      break;
    case 'byPopular':
      filter = 'byPopularity';
      state = false;
      break;
    case 'byNotpopular':
      filter = 'byPopularity';
      state = true;
      break;
    default:
      filter = 'byABC';
      state = true;
      break;
  }

  changeFilter(filter, state);
}

async function changeFilter(filter, state) {
  const oldParams = loadFromLS(LOCALSTORAGE_KEY);
  const { [Object.keys(oldParams).pop()]: _, ...rest } = oldParams;
  const newParams = { ...rest, [filter]: state };
  const newFilterBy = await getCurrentProducts(newParams);
  mainProductMarkup(newFilterBy);
  saveToLS(LOCALSTORAGE_KEY, newParams);
}

async function loadMarkup() {
  const defaultParams = loadFromLS(LOCALSTORAGE_KEY);
  const currentProduct = await getCurrentProducts(defaultParams);
  mainProductMarkup(currentProduct);

  if (defaultParams.category !== null) {
    categoryName.textContent = replaceText(defaultParams.category);
  } else {
    categoryName.textContent = 'Categories';
  }
}

form.addEventListener('submit', formSub);
filtersABClist.addEventListener('click', getFilter);
categoryList.addEventListener('click', changeCategory);
input.addEventListener('input', changeKeyword);
document.addEventListener('DOMContentLoaded', createCategoryList);
document.addEventListener('DOMContentLoaded', loadMarkup);

// ! -------------Style Choice JS-------------

const selectFilterCategories = document.querySelector('.select-filter');
const selectParamCategories = document.querySelector('.select-param');
const categoryName = document.querySelector('.category-name');
const paramName = document.querySelector('.param-name');

selectFilterCategories.addEventListener('click', () =>
  toggleFilterVisibility(categoryList)
);
selectParamCategories.addEventListener('click', () =>
  toggleFilterVisibility(filtersABClist)
);
document.addEventListener('click', hideFilterOnOutsideClick);

function toggleFilterVisibility(list) {
  list.classList.toggle('filter-hidden');
}

function handleCategorySelection(e, list, nameElement) {
  const target = e.target;
  if (
    target.classList.contains('category-type') ||
    target.classList.contains('filter-type')
  ) {
    nameElement.textContent = target.textContent;
    list.classList.add('filter-hidden');
  }
}

function hideFilterOnOutsideClick(e) {
  const isClickInsideFirstList = selectFilterCategories.contains(e.target);
  const isClickInsideSecondList = selectParamCategories.contains(e.target);

  if (
    !isClickInsideFirstList &&
    !categoryList.classList.contains('filter-hidden')
  ) {
    categoryList.classList.add('filter-hidden');
  }

  if (
    !isClickInsideSecondList &&
    !filtersABClist.classList.contains('filter-hidden')
  ) {
    filtersABClist.classList.add('filter-hidden');
  }
}

categoryList.addEventListener('click', e =>
  handleCategorySelection(e, categoryList, categoryName)
);
filtersABClist.addEventListener('click', e =>
  handleCategorySelection(e, filtersABClist, paramName)
);
