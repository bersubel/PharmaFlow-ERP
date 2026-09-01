import {
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

const ProductFilters = ({
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    categories = [],
}) => {
    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setStatus("");
    };

    const hasFilters =
        search ||
        category ||
        status;

    return (
        <div className="product-filters">

            <div className="product-search">

                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search products, code or brand..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                {search && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={() => setSearch("")}
                    >
                        <X size={16} />
                    </button>
                )}

            </div>


            <div className="product-filter-group">

                <div className="filter-select-wrapper">

                    <SlidersHorizontal size={16} />

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(event.target.value)
                        }
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        ))}
                    </select>

                </div>


                <select
                    className="status-filter"
                    value={status}
                    onChange={(event) =>
                        setStatus(event.target.value)
                    }
                >
                    <option value="">
                        All Status
                    </option>

                    <option value="in-stock">
                        In Stock
                    </option>

                    <option value="low-stock">
                        Low Stock
                    </option>

                    <option value="expired">
                        Expired
                    </option>

                    <option value="expiring">
                        Expiring Soon
                    </option>
                </select>


                {hasFilters && (
                    <button
                        type="button"
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>
                )}

            </div>

        </div>
    );
};

export default ProductFilters;