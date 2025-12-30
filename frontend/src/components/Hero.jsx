import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Hero = ({ onSearch, onFilterChange }) => {
  const { user } = useContext(AuthContext);
  const [selectedFilter, setSelectedFilter] = useState('location');

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedFilter(value);
    onFilterChange(value); // notify parent which filter to use
  };

  return (
    <section className="bg-teal text-white py-10 px-4 sm:py-12 md:py-20 lg:py-24 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
          HouseMatch Zambia
        </h1>

        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-8">
          Verified homes. Vibrant communities. Secure connections.
        </p>

        <div className="flex justify-center mb-4 gap-2">
          <select
            value={selectedFilter}
            onChange={handleFilterChange}
            className="px-4 py-2 rounded-lg border border-white bg-lightTeal text-white focus:outline-none focus:ring-2 focus:ring-white"
            style={{color: "black"}}
          >
            <option value="location">Location</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="bathrooms">Bathrooms</option>
          </select>

          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-2/3 px-4 py-2 md:px-5 md:py-3 text-sm md:text-base rounded-lg border border-white bg-lightTeal text-slate focus:outline-none focus:ring-2 focus:ring-white"
            onChange={(e) => onSearch(e.target.value)}
            style={{ color: 'white' }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
