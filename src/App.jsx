import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "react-activity";
import FilterIcon from "./Icons/FilterIcon";
import ReactStars from "react-rating-stars-component";

import "react-activity/dist/library.css";

const ProductFilter = ({ categories, selectedCategory, setSelectedCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, toggleFilter, showFilter, rating, setRating, closeFilter }) => {
  const handleOutsideClick = useCallback((event) => {
    if (!event.target.closest(`#filter-container`)) {
      closeFilter();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div className={`absolute ${showFilter ? 'left-10 md:left-20' : '-left-full'} transition-all bg-white rounded w-80 shadow p-5 z-10 flex flex-col gap-4`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Categories</h2>
        <select
          className="border border-gray-800 px-3 py-2 rounded"
          onChange={(ev) => {
            setSelectedCategory(ev.target.value);
            toggleFilter();
          }}
          value={selectedCategory}
        >
          <option value="">All</option>
          {categories?.map(category => (
            <option key={category.slug} value={category.slug}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Price</h2>
        <div className="flex gap-5">
          <input
            value={minPrice}
            onChange={ev => setMinPrice(ev.target.value)}
            placeholder="Min"
            className="h-8 w-full text-sm border border-gray-800 rounded p-1"
            type="number"
          />
          <input
            value={maxPrice}
            onChange={ev => setMaxPrice(ev.target.value)}
            placeholder="Max"
            className="h-8 w-full text-sm border border-gray-800 rounded p-1"
            type="number"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Rating</h2>
        <input
          value={rating}
          onChange={ev => {
            if (ev.target.value > 5 || ev.target.value < 1) {
              return;
            }
            setRating(parseInt(ev.target.value))
          }}
          placeholder="Rating"
          className="h-8 w-full text-sm border border-gray-800 rounded p-1"
          type="number"
        />
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  return (
    <li key={product.id} className="border rounded shadow-sm bg-gray-200 flex flex-col items-center p-4">
      <div className="relative">
        <img className="h-80 w-80 object-contain" loading="lazy" src={product.thumbnail} alt={product.title} />
        <span className="absolute bg-white right-0 top-0 p-0.5 rounded-sm text-xs">{product.availabilityStatus}</span>
      </div>
      <h2 className="text-xl font-bold leading-tight text-gray-900 mt-4 mb-2">
        {product.title}
      </h2>
      <p className={`text-sm ${product.discountPercentage && 'text-red-600'}`}>
        <b>PRICE:</b> <s>${product.price}</s> ${discountedPrice}
      </p>
      <p className="text-sm"><b>{product.brand ? 'Brand' : 'Tag'}:</b> {product.brand || product.tags[0]}</p>
      <p className="text-xs"><b>Description: </b>{product.description}</p>
      <ReactStars
        count={5}
        value={product.rating}
        size={14}
        edit={false}
        activeColor="#ffd700"
      />
    </li>
  );
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://dummyjson.com/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('https://dummyjson.com/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const toggleFilter = useCallback(() => {
    setShowFilter(prev => !prev);
  }, []);


  const filteredProducts = useMemo(() =>
    products.filter(product => (
      (product.category === selectedCategory || selectedCategory === '') &&
      ((product.price * (1 - product.discountPercentage / 100)) > minPrice &&
        (product.price * (1 - product.discountPercentage / 100)) < maxPrice) &&
      (product.rating <= rating)
    ))
    , [products, selectedCategory, minPrice, maxPrice, rating]);

  return (
    <div className="py-10 px-10 md:px-20 transition-all">
      <h1 className="text-4xl text-center font-bold leading-tight text-gray-900 mb-4">
        Products
      </h1>
      <div id="filter-container" className="shadow">
        <button onClick={toggleFilter} className="flex items-center gap-2">
          Filters <FilterIcon />
        </button>
        <ProductFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          rating={rating}
          setRating={setRating}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          showFilter={showFilter}
          toggleFilter={toggleFilter}
          closeFilter={() => setShowFilter(false)}
        />
      </div>
      {isLoading ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Spinner size={50} color="#333" />
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-center mt-10">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 mt-4 md:col-span-2 lg:col-span-3">No products found</p>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </ul>
      )}
    </div>
  );
}