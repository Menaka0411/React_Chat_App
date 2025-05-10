import React, { useState } from "react";
import { MdSort } from "react-icons/md";

const Archives = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [setSortOrder] = useState("asc");

  const handleSort = (order) => {
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  return (
    <div className="w-full h-full">
      <div className="p-4">
        {/* Search + Sort */}
        <div className="flex justify-between items-center mb-4 relative">
          <div className="w-full sm:w-72 relative">
            <input
              type="text"
              placeholder="Search archives ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-4 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex space-x-3 relative">
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition flex items-center gap-2"
              >
                <MdSort className="text-lg" /> Sort
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-md z-10">
                  <div
                    className="p-2 hover:bg-purple-100 text-sm cursor-pointer"
                    onClick={() => handleSort("asc")}
                  >
                    A - Z
                  </div>
                  <div
                    className="p-2 hover:bg-purple-100 text-sm cursor-pointer"
                    onClick={() => handleSort("desc")}
                  >
                    Z - A
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-300 mb-4" />
        
        {/* Empty state */}
        <p className="text-gray-500 text-center mt-10">
          No archives yet
        </p>
      </div>
    </div>
  );
};

export default Archives;
