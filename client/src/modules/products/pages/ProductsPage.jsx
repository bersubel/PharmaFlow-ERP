import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    Plus,
    Search,
    SlidersHorizontal,
    Package,
    Edit3,
    Trash2,
    Power,
    X,
    Loader2,
    AlertCircle,
    RefreshCw,
    ChevronDown,
} from "lucide-react";

import "./ProductsPage.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.message ||
                data?.errors?.[0]?.msg ||
                "Something went wrong"
        );
    }

    return data;
};

const emptyForm = {
    name: "",
    genericName: "",
    barcode: "",
    category: "",
    brand: "",
    manufacturer: "",
    supplier: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    reorderLevel: "10",
    batchNumber: "",
    expiryDate: "",
    description: "",
};

const ProductsPage = () => {
    const [products, setProducts] = useState([]);

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [units, setUnits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openFilter, setOpenFilter] = useState(null);

    const categoryFilterRef = useRef(null);
    const statusFilterRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const [deleteProduct, setDeleteProduct] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [statusUpdating, setStatusUpdating] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiRequest("/products");

            setProducts(response?.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadOptions = async () => {
        try {
            setOptionsLoading(true);

            const [
                categoryResponse,
                brandResponse,
                manufacturerResponse,
                supplierResponse,
                unitResponse,
            ] = await Promise.all([
                apiRequest("/categories"),
                apiRequest("/brands"),
                apiRequest("/manufacturers"),
                apiRequest("/suppliers"),
                apiRequest("/units"),
            ]);

            setCategories(categoryResponse?.data || []);
            setBrands(brandResponse?.data || []);
            setManufacturers(
                manufacturerResponse?.data || []
            );
            setSuppliers(supplierResponse?.data || []);
            setUnits(unitResponse?.data || []);
        } catch (err) {
            setError(
                `Failed to load product options: ${err.message}`
            );
        } finally {
            setOptionsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
        loadOptions();
    }, []);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (
                !categoryFilterRef.current?.contains(event.target) &&
                !statusFilterRef.current?.contains(event.target)
            ) {
                setOpenFilter(null);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setOpenFilter(null);
                closeModal();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [saving]);

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !query ||
                product.name
                    ?.toLowerCase()
                    .includes(query) ||
                product.genericName
                    ?.toLowerCase()
                    .includes(query) ||
                product.barcode
                    ?.toLowerCase()
                    .includes(query) ||
                product.batchNumber
                    ?.toLowerCase()
                    .includes(query);

            const categoryId =
                product.category?._id ||
                product.category;

            const matchesCategory =
                !categoryFilter ||
                categoryId === categoryFilter;

            const matchesStatus =
                !statusFilter ||
                (statusFilter === "active" &&
                    product.isActive) ||
                (statusFilter === "inactive" &&
                    !product.isActive);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        products,
        search,
        categoryFilter,
        statusFilter,
    ]);

    const openCreateModal = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);

        setForm({
            name: product.name || "",
            genericName: product.genericName || "",
            barcode: product.barcode || "",
            category:
                product.category?._id ||
                product.category ||
                "",
            brand:
                product.brand?._id ||
                product.brand ||
                "",
            manufacturer:
                product.manufacturer?._id ||
                product.manufacturer ||
                "",
            supplier:
                product.supplier?._id ||
                product.supplier ||
                "",
            unit:
                product.unit?._id ||
                product.unit ||
                "",
            purchasePrice:
                product.purchasePrice ?? "",
            sellingPrice:
                product.sellingPrice ?? "",
            quantity:
                product.quantity ?? "",
            reorderLevel:
                product.reorderLevel ?? 10,
            batchNumber:
                product.batchNumber || "",
            expiryDate: product.expiryDate
                ? product.expiryDate.substring(0, 10)
                : "",
            description:
                product.description || "",
        });

        setShowModal(true);
    };

    const closeModal = (force = false) => {
        if (saving && !force) return;

        setShowModal(false);
        setEditingProduct(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!form.category) {
            setError("Please select a category.");
            return;
        }

        if (!form.unit) {
            setError("Please select a unit.");
            return;
        }

        if (form.purchasePrice === "") {
            setError("Purchase price is required.");
            return;
        }

        if (form.sellingPrice === "") {
            setError("Selling price is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            /*
             * IMPORTANT:
             * category, brand, manufacturer, supplier and unit
             * contain MongoDB ObjectId values from the dropdowns.
             */

            const payload = {
                name: form.name.trim(),
                genericName:
                    form.genericName.trim(),
                barcode:
                    form.barcode.trim() || undefined,

                category: form.category,

                brand:
                    form.brand || undefined,

                manufacturer:
                    form.manufacturer || undefined,

                supplier:
                    form.supplier || undefined,

                unit: form.unit,

                purchasePrice:
                    Number(form.purchasePrice),

                sellingPrice:
                    Number(form.sellingPrice),

                quantity:
                    Number(form.quantity || 0),

                reorderLevel:
                    Number(form.reorderLevel || 10),

                batchNumber:
                    form.batchNumber.trim(),

                expiryDate:
                    form.expiryDate || undefined,

                description:
                    form.description.trim(),
            };

            let response;

            if (editingProduct) {
                response = await apiRequest(
                    `/products/${editingProduct._id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                response = await apiRequest(
                    "/products",
                    {
                        method: "POST",
                        body: JSON.stringify(payload),
                    }
                );
            }

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                        "Unable to save product"
                );
            }

            closeModal(true);

            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleStatusToggle = async (product) => {
        try {
            setStatusUpdating(product._id);
            setError("");

            await apiRequest(
                `/products/${product._id}/status`,
                {
                    method: "PATCH",
                    body: JSON.stringify({
                        status: !product.isActive,
                    }),
                }
            );

            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteProduct) return;

        try {
            setDeleting(true);
            setError("");

            await apiRequest(
                `/products/${deleteProduct._id}`,
                {
                    method: "DELETE",
                }
            );

            setDeleteProduct(null);

            await loadProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const getStockState = (product) => {
        const quantity = Number(
            product.quantity || 0
        );

        const reorderLevel = Number(
            product.reorderLevel || 0
        );

        if (quantity <= 0) {
            return {
                label: "Out of stock",
                className: "danger",
            };
        }

        if (quantity <= reorderLevel) {
            return {
                label: "Low stock",
                className: "warning",
            };
        }

        return {
            label: "In stock",
            className: "success",
        };
    };

    const formatCurrency = (value) => {
        return `ETB ${Number(
            value || 0
        ).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="products-page">

            <section className="products-header">

                <div>
                    <span className="products-eyebrow">
                        <Package size={15} />
                        PRODUCT MANAGEMENT
                    </span>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage your pharmacy products,
                        pricing, stock and product information.
                    </p>
                </div>

                <button
                    className="products-primary-button"
                    onClick={openCreateModal}
                >
                    <Plus size={18} />
                    Add Product
                </button>

            </section>

            {error && (
                <div className="products-error">
                    <AlertCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() => setError("")}
                        aria-label="Close error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="products-toolbar">

                <div className="products-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <div
                    className="products-filter"
                    ref={categoryFilterRef}
                >

                    <SlidersHorizontal size={17} />

                    <button
                        type="button"
                        className="products-filter-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={openFilter === "category"}
                        onClick={() =>
                            setOpenFilter((current) =>
                                current === "category"
                                    ? null
                                    : "category"
                            )
                        }
                    >
                        <span>
                            {categories.find(
                                (category) =>
                                    category._id === categoryFilter
                            )?.name || "All Categories"}
                        </span>
                        <ChevronDown size={15} />
                    </button>

                    {openFilter === "category" && (
                        <div
                            className="products-filter-menu"
                            role="listbox"
                            aria-label="Filter by category"
                        >
                            <button
                                type="button"
                                className={!categoryFilter ? "selected" : ""}
                                onClick={() => {
                                    setCategoryFilter("");
                                    setOpenFilter(null);
                                }}
                            >
                                All Categories
                            </button>
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category._id}
                                    className={
                                        categoryFilter === category._id
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() => {
                                        setCategoryFilter(category._id);
                                        setOpenFilter(null);
                                    }}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                <div
                    className="products-filter"
                    ref={statusFilterRef}
                >

                    <button
                        type="button"
                        className="products-filter-trigger"
                        aria-haspopup="listbox"
                        aria-expanded={openFilter === "status"}
                        onClick={() =>
                            setOpenFilter((current) =>
                                current === "status" ? null : "status"
                            )
                        }
                    >
                        <span>
                            {statusFilter === "active"
                                ? "Active"
                                : statusFilter === "inactive"
                                    ? "Inactive"
                                    : "All Status"}
                        </span>
                        <ChevronDown size={15} />
                    </button>

                    {openFilter === "status" && (
                        <div
                            className="products-filter-menu"
                            role="listbox"
                            aria-label="Filter by status"
                        >
                            {[
                                ["", "All Status"],
                                ["active", "Active"],
                                ["inactive", "Inactive"],
                            ].map(([value, label]) => (
                                <button
                                    type="button"
                                    key={label}
                                    className={
                                        statusFilter === value
                                            ? "selected"
                                            : ""
                                    }
                                    onClick={() => {
                                        setStatusFilter(value);
                                        setOpenFilter(null);
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                <button
                    className="products-refresh-button"
                    onClick={() => {
                        loadProducts();
                        loadOptions();
                    }}
                    title="Refresh"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "spinning"
                                : ""
                        }
                    />
                </button>

            </section>

            <section className="products-summary">

                <div className="summary-item">
                    <span>
                        Total products
                    </span>

                    <strong>
                        {products.length}
                    </strong>
                </div>

                <div className="summary-item">
                    <span>
                        Active
                    </span>

                    <strong>
                        {
                            products.filter(
                                (product) =>
                                    product.isActive
                            ).length
                        }
                    </strong>
                </div>

                <div className="summary-item">
                    <span>
                        Low stock
                    </span>

                    <strong>
                        {
                            products.filter(
                                (product) =>
                                    Number(
                                        product.quantity || 0
                                    ) <=
                                    Number(
                                        product.reorderLevel || 0
                                    ) &&
                                    Number(
                                        product.quantity || 0
                                    ) > 0
                            ).length
                        }
                    </strong>
                </div>

                <div className="summary-item">
                    <span>
                        Out of stock
                    </span>

                    <strong>
                        {
                            products.filter(
                                (product) =>
                                    Number(
                                        product.quantity || 0
                                    ) <= 0
                            ).length
                        }
                    </strong>
                </div>

            </section>

            <section className="products-card">

                <div className="products-card-header">

                    <div>
                        <h2>
                            Product Inventory
                        </h2>

                        <p>
                            {filteredProducts.length}{" "}
                            product
                            {filteredProducts.length !== 1
                                ? "s"
                                : ""}{" "}
                            displayed
                        </p>
                    </div>

                </div>

                {loading ? (
                    <div className="products-state">

                        <Loader2
                            size={30}
                            className="spinning"
                        />

                        <strong>
                            Loading products...
                        </strong>

                        <span>
                            Please wait while we load
                            your product inventory.
                        </span>

                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="products-state">

                        <div className="empty-icon">
                            <Package size={28} />
                        </div>

                        <strong>
                            No products found
                        </strong>

                        <span>
                            {search ||
                            categoryFilter ||
                            statusFilter
                                ? "Try changing your search or filters."
                                : "Start by adding your first product."}
                        </span>

                        {!search &&
                            !categoryFilter &&
                            !statusFilter && (
                                <button
                                    className="products-primary-button"
                                    onClick={
                                        openCreateModal
                                    }
                                >
                                    <Plus size={17} />
                                    Add Product
                                </button>
                            )}

                    </div>
                ) : (
                    <div className="products-table-wrapper">

                        <table className="products-table">

                            <thead>
                                <tr>
                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Unit
                                    </th>

                                    <th>
                                        Purchase
                                    </th>

                                    <th>
                                        Selling
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.map(
                                    (product) => {
                                        const stock =
                                            getStockState(
                                                product
                                            );

                                        return (
                                            <tr
                                                key={
                                                    product._id
                                                }
                                            >

                                                <td>
                                                    <div className="product-name-cell">

                                                        <div className="product-avatar">
                                                            <Package
                                                                size={18}
                                                            />
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    product.name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    product.genericName ||
                                                                    "No generic name"
                                                                }
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>

                                                <td>
                                                    {
                                                        product
                                                            .category
                                                            ?.name ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        product
                                                            .unit
                                                            ?.shortName ||
                                                        product
                                                            .unit
                                                            ?.name ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        product.purchasePrice
                                                    )}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatCurrency(
                                                            product.sellingPrice
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="stock-cell">

                                                        <strong>
                                                            {
                                                                product.quantity
                                                            }
                                                        </strong>

                                                        <span
                                                            className={`stock-badge ${stock.className}`}
                                                        >
                                                            {
                                                                stock.label
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            product.isActive
                                                                ? "status-badge active"
                                                                : "status-badge inactive"
                                                        }
                                                    >
                                                        <span />
                                                        {product.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="product-actions">

                                                        <button
                                                            className="action-button edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    product
                                                                )
                                                            }
                                                            title="Edit product"
                                                        >
                                                            <Edit3
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            className="action-button status"
                                                            onClick={() =>
                                                                handleStatusToggle(
                                                                    product
                                                                )
                                                            }
                                                            disabled={
                                                                statusUpdating ===
                                                                product._id
                                                            }
                                                            title={
                                                                product.isActive
                                                                    ? "Deactivate"
                                                                    : "Activate"
                                                            }
                                                        >
                                                            {statusUpdating ===
                                                            product._id ? (
                                                                <Loader2
                                                                    size={16}
                                                                    className="spinning"
                                                                />
                                                            ) : (
                                                                <Power
                                                                    size={16}
                                                                />
                                                            )}
                                                        </button>

                                                        <button
                                                            className="action-button delete"
                                                            onClick={() =>
                                                                setDeleteProduct(
                                                                    product
                                                                )
                                                            }
                                                            title="Delete product"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {showModal && (
                <div
                    className="modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className="product-modal">

                        <div className="modal-header">

                            <div>
                                <span className="modal-eyebrow">
                                    {editingProduct
                                        ? "PRODUCT UPDATE"
                                        : "NEW PRODUCT"}
                                </span>

                                <h2>
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                                <p>
                                    Enter the product
                                    information below.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="product-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-section">

                                <h3>
                                    Basic Information
                                </h3>

                                <div className="form-grid">

                                    <div className="form-field full">
                                        <label>
                                            Product Name
                                            <span>*</span>
                                        </label>

                                        <input
                                            name="name"
                                            value={
                                                form.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Amoxicillin 500mg"
                                            required
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Generic Name
                                        </label>

                                        <input
                                            name="genericName"
                                            value={
                                                form.genericName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Amoxicillin"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Barcode
                                        </label>

                                        <input
                                            name="barcode"
                                            value={
                                                form.barcode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Product barcode"
                                        />
                                    </div>

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Classification
                                </h3>

                                <div className="form-grid">

                                    <SelectField
                                        label="Category"
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={
                                            categories
                                        }
                                        required
                                        loading={
                                            optionsLoading
                                        }
                                    />

                                    <SelectField
                                        label="Brand"
                                        name="brand"
                                        value={
                                            form.brand
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={
                                            brands
                                        }
                                        loading={
                                            optionsLoading
                                        }
                                    />

                                    <SelectField
                                        label="Manufacturer"
                                        name="manufacturer"
                                        value={
                                            form.manufacturer
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={
                                            manufacturers
                                        }
                                        loading={
                                            optionsLoading
                                        }
                                    />

                                    <SelectField
                                        label="Supplier"
                                        name="supplier"
                                        value={
                                            form.supplier
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={
                                            suppliers
                                        }
                                        labelKey="companyName"
                                        loading={
                                            optionsLoading
                                        }
                                    />

                                    <SelectField
                                        label="Unit"
                                        name="unit"
                                        value={
                                            form.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        options={
                                            units
                                        }
                                        required
                                        loading={
                                            optionsLoading
                                        }
                                    />

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Pricing & Inventory
                                </h3>

                                <div className="form-grid">

                                    <NumberField
                                        label="Purchase Price"
                                        name="purchasePrice"
                                        value={
                                            form.purchasePrice
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0.00"
                                        required
                                    />

                                    <NumberField
                                        label="Selling Price"
                                        name="sellingPrice"
                                        value={
                                            form.sellingPrice
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0.00"
                                        required
                                    />

                                    <NumberField
                                        label="Quantity"
                                        name="quantity"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0"
                                    />

                                    <NumberField
                                        label="Reorder Level"
                                        name="reorderLevel"
                                        value={
                                            form.reorderLevel
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10"
                                    />

                                </div>

                            </div>

                            <div className="form-section">

                                <h3>
                                    Batch & Expiry
                                </h3>

                                <div className="form-grid">

                                    <div className="form-field">
                                        <label>
                                            Batch Number
                                        </label>

                                        <input
                                            name="batchNumber"
                                            value={
                                                form.batchNumber
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. AMX-2026-01"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>
                                            Expiry Date
                                        </label>

                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={
                                                form.expiryDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </div>

                                    <div className="form-field full">
                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                form.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="3"
                                            placeholder="Additional product information..."
                                        />
                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="products-primary-button"
                                    disabled={
                                        saving ||
                                        optionsLoading
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="spinning"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={17}
                                            />
                                            {editingProduct
                                                ? "Save Changes"
                                                : "Create Product"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {deleteProduct && (
                <div className="modal-backdrop">

                    <div className="delete-modal">

                        <div className="delete-icon">
                            <Trash2 size={23} />
                        </div>

                        <h2>
                            Delete product?
                        </h2>

                        <p>
                            You're about to delete{" "}
                            <strong>
                                {deleteProduct.name}
                            </strong>
                            . This action cannot be
                            undone.
                        </p>

                        <div className="delete-actions">

                            <button
                                className="modal-cancel"
                                onClick={() =>
                                    setDeleteProduct(
                                        null
                                    )
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="delete-confirm"
                                onClick={
                                    handleDelete
                                }
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="spinning"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={17}
                                        />
                                        Delete Product
                                    </>
                                )}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

const SelectField = ({
    label,
    name,
    value,
    onChange,
    options = [],
    labelKey = "name",
    required = false,
    loading = false,
}) => {
    return (
        <div className="form-field">

            <label>
                {label}

                {required && (
                    <span>*</span>
                )}
            </label>

            <div className="select-wrapper">

                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={loading}
                >
                    <option value="">
                        {loading
                            ? "Loading..."
                            : `Select ${label}`}
                    </option>

                    {options.map((option) => (
                        <option
                            key={option._id}
                            value={option._id}
                        >
                            {option[labelKey] ||
                                option.name}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                />

            </div>

        </div>
    );
};

const NumberField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) => {
    return (
        <div className="form-field">

            <label>
                {label}

                {required && (
                    <span>*</span>
                )}
            </label>

            <input
                type="number"
                min="0"
                step="0.01"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />

        </div>
    );
};

export default ProductsPage;
