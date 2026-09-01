import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    CalendarDays,
    Check,
    ChevronDown,
    CircleDollarSign,
    Eye,
    FileText,
    Loader2,
    Package,
    Plus,
    RefreshCw,
    Search,
    Truck,
    Trash2,
    User,
    X,
    XCircle,
} from "lucide-react";

import "./PurchasesPage.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyPurchase = {
    supplier: "",
    tax: "",
    discount: "",
    notes: "",
};

const initialProduct = {
    product: "",
    quantity: 1,
    purchasePrice: "",
};

/* =========================================================
   API REQUEST
========================================================= */

const apiRequest = async (
    endpoint,
    options = {}
) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type":
                    "application/json",

                ...(token
                    ? {
                          Authorization:
                              `Bearer ${token}`,
                      }
                    : {}),

                ...(options.headers || {}),
            },
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
                data?.errors?.[0]?.msg ||
                "Something went wrong."
        );
    }

    return data;
};

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    );
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    try {
        return new Intl.DateTimeFormat(
            "en-US",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(new Date(date));
    } catch {
        return "—";
    }
};

const getSupplierName = (supplier) => {
    if (!supplier) {
        return "Unknown supplier";
    }

    if (typeof supplier === "string") {
        return supplier;
    }

    return (
        supplier.companyName ||
        supplier.contactPerson ||
        supplier.phone ||
        supplier.email ||
        "Supplier"
    );
};

const getProductName = (product) => {
    if (!product) {
        return "Unknown product";
    }

    if (typeof product === "string") {
        return product;
    }

    return (
        product.name ||
        product.barcode ||
        "Product"
    );
};

const getProductPurchasePrice = (
    product
) => {
    return Number(
        product?.purchasePrice ??
            product?.costPrice ??
            product?.buyingPrice ??
            product?.price ??
            0
    );
};

const getStatusClass = (status) => {
    switch (status) {
        case "RECEIVED":
            return "received";

        case "CANCELLED":
            return "cancelled";

        case "DRAFT":
        default:
            return "draft";
    }
};

/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder = "Select",
    ariaLabel,
    disabled = false,
    searchable = false,
}) => {
    const [open, setOpen] =
        useState(false);

    const [searchValue, setSearchValue] =
        useState("");

    const dropdownRef =
        useRef(null);

    useEffect(() => {
        const handleOutsideClick = (
            event
        ) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {
                setOpen(false);
                setSearchValue("");
            }
        };

        const handleEscape = (event) => {
            if (
                event.key === "Escape"
            ) {
                setOpen(false);
                setSearchValue("");
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    const selectedOption =
        options.find(
            (option) =>
                option.value === value
        );

    const filteredOptions =
        searchable && searchValue
            ? options.filter((option) =>
                  option.label
                      .toLowerCase()
                      .includes(
                          searchValue
                              .toLowerCase()
                      )
              )
            : options;

    const handleSelect = (
        optionValue
    ) => {
        onChange(optionValue);

        setOpen(false);
        setSearchValue("");
    };

    return (
        <div
            ref={dropdownRef}
            className={`purchase-custom-dropdown ${
                open ? "open" : ""
            } ${
                disabled ? "disabled" : ""
            }`}
        >
            <button
                type="button"
                className="purchase-dropdown-trigger"
                onClick={() => {
                    if (!disabled) {
                        setOpen(
                            (current) =>
                                !current
                        );
                    }
                }}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                disabled={disabled}
            >
                <span
                    className={
                        selectedOption
                            ? "has-value"
                            : "placeholder"
                    }
                >
                    {selectedOption
                        ? selectedOption.label
                        : placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className="purchase-dropdown-chevron"
                />
            </button>

            {open && (
                <div
                    className="purchase-dropdown-menu"
                    role="listbox"
                >
                    {searchable && (
                        <div className="purchase-dropdown-search">
                            <Search
                                size={15}
                            />

                            <input
                                type="text"
                                value={
                                    searchValue
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearchValue(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search..."
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="purchase-dropdown-options">
                        {filteredOptions.length ===
                        0 ? (
                            <div className="purchase-dropdown-empty">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map(
                                (
                                    option
                                ) => {
                                    const selected =
                                        option.value ===
                                        value;

                                    return (
                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            className={`purchase-dropdown-option ${
                                                selected
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleSelect(
                                                    option.value
                                                )
                                            }
                                            role="option"
                                            aria-selected={
                                                selected
                                            }
                                        >
                                            <span>
                                                {
                                                    option.label
                                                }
                                            </span>

                                            {selected && (
                                                <Check
                                                    size={
                                                        15
                                                    }
                                                />
                                            )}
                                        </button>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================================================
   PURCHASE PAGE
========================================================= */

const PurchasesPage = () => {
    const [purchases, setPurchases] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [suppliers, setSuppliers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState("");

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [
        showCreateModal,
        setShowCreateModal,
    ] = useState(false);

    const [
        showDetailsModal,
        setShowDetailsModal,
    ] = useState(false);

    const [
        selectedPurchase,
        setSelectedPurchase,
    ] = useState(null);

    const [purchaseForm, setPurchaseForm] =
        useState(emptyPurchase);

    const [items, setItems] =
        useState([]);

    const [
        productToAdd,
        setProductToAdd,
    ] = useState("");

    const [
        quantityToAdd,
        setQuantityToAdd,
    ] = useState(1);

    const [
        priceToAdd,
        setPriceToAdd,
    ] = useState("");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadPurchases = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                purchasesResult,
                productsResult,
                suppliersResult,
            ] = await Promise.all([
                apiRequest("/purchases"),
                apiRequest("/products"),
                apiRequest("/suppliers"),
            ]);

            setPurchases(
                purchasesResult?.data || []
            );

            setProducts(
                productsResult?.data || []
            );

            setSuppliers(
                suppliersResult?.data || []
            );
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchases();
    }, []);

    /* =====================================================
       ESCAPE
    ===================================================== */

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (
                event.key !== "Escape" ||
                saving
            ) {
                return;
            }

            setShowCreateModal(false);
            setShowDetailsModal(false);
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [saving]);

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredPurchases =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return purchases.filter(
                (purchase) => {
                    const supplierName =
                        getSupplierName(
                            purchase.supplier
                        ).toLowerCase();

                    const purchaseNumber =
                        String(
                            purchase.purchaseNumber ||
                                ""
                        ).toLowerCase();

                    const matchesSearch =
                        !query ||
                        purchaseNumber.includes(
                            query
                        ) ||
                        supplierName.includes(
                            query
                        );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        purchase.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            purchases,
            search,
            statusFilter,
        ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const stats = useMemo(() => {
        const receivedPurchases =
            purchases.filter(
                (purchase) =>
                    purchase.status ===
                    "RECEIVED"
            );

        const totalPurchased =
            receivedPurchases.reduce(
                (sum, purchase) =>
                    sum +
                    Number(
                        purchase.total || 0
                    ),
                0
            );

        const draftPurchases =
            purchases.filter(
                (purchase) =>
                    purchase.status ===
                    "DRAFT"
            ).length;

        return [
            {
                label: "Total Purchases",
                value: purchases.length,
                icon: Truck,
                tone: "green",
            },
            {
                label: "Received",
                value:
                    receivedPurchases.length,
                icon: Check,
                tone: "blue",
            },
            {
                label: "Purchase Cost",
                value:
                    formatMoney(
                        totalPurchased
                    ),
                icon: CircleDollarSign,
                tone: "orange",
            },
            {
                label: "Draft Purchases",
                value: draftPurchases,
                icon: FileText,
                tone: "purple",
            },
        ];
    }, [purchases]);

    /* =====================================================
       FORM CALCULATIONS
    ===================================================== */

    const formSubtotal = useMemo(() => {
        return items.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 0
                ) *
                    Number(
                        item.purchasePrice ||
                            0
                    ),
            0
        );
    }, [items]);

    const formTax =
        Number(purchaseForm.tax) || 0;

    const formDiscount =
        Number(
            purchaseForm.discount
        ) || 0;

    const formTotal = Math.max(
        0,
        formSubtotal +
            formTax -
            formDiscount
    );

    /* =====================================================
       RESET FORM
    ===================================================== */

    const resetCreateForm = () => {
        setPurchaseForm({
            ...emptyPurchase,
        });

        setItems([]);

        setProductToAdd("");

        setQuantityToAdd(1);

        setPriceToAdd("");
    };

    const openCreateModal = () => {
        setError("");

        resetCreateForm();

        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (saving) {
            return;
        }

        setShowCreateModal(false);

        resetCreateForm();
    };

    /* =====================================================
       PRODUCT CHANGE
    ===================================================== */

    const handleProductChange = (
        value
    ) => {
        setProductToAdd(value);

        const product =
            products.find(
                (item) =>
                    item._id === value
            );

        if (product) {
            setPriceToAdd(
                String(
                    getProductPurchasePrice(
                        product
                    )
                )
            );
        } else {
            setPriceToAdd("");
        }
    };

    /* =====================================================
       ADD PRODUCT
    ===================================================== */

    const addProduct = () => {
        if (!productToAdd) {
            setError(
                "Please select a product."
            );
            return;
        }

        const product =
            products.find(
                (item) =>
                    item._id ===
                    productToAdd
            );

        if (!product) {
            setError(
                "Selected product was not found."
            );
            return;
        }

        const quantity =
            Number(quantityToAdd);

        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 1
        ) {
            setError(
                "Quantity must be a whole number greater than zero."
            );
            return;
        }

        const purchasePrice =
            Number(priceToAdd);

        if (
            Number.isNaN(
                purchasePrice
            ) ||
            purchasePrice < 0
        ) {
            setError(
                "Purchase price must be a valid number."
            );
            return;
        }

        const existingIndex =
            items.findIndex(
                (item) =>
                    item.product ===
                    product._id
            );

        if (existingIndex !== -1) {
            setItems((current) =>
                current.map(
                    (
                        item,
                        index
                    ) =>
                        index ===
                        existingIndex
                            ? {
                                  ...item,
                                  quantity:
                                      Number(
                                          item.quantity
                                      ) +
                                      quantity,
                                  purchasePrice,
                              }
                            : item
                )
            );
        } else {
            setItems((current) => [
                ...current,
                {
                    product:
                        product._id,
                    name:
                        product.name,
                    barcode:
                        product.barcode ||
                        "",
                    quantity,
                    purchasePrice,
                },
            ]);
        }

        setProductToAdd("");

        setQuantityToAdd(1);

        setPriceToAdd("");

        setError("");
    };

    /* =====================================================
       ITEM QUANTITY
    ===================================================== */

    const updateItemQuantity = (
        index,
        value
    ) => {
        const quantity =
            Number(value);

        if (
            !Number.isInteger(
                quantity
            ) ||
            quantity < 1
        ) {
            return;
        }

        setItems((current) =>
            current.map(
                (
                    item,
                    itemIndex
                ) =>
                    itemIndex === index
                        ? {
                              ...item,
                              quantity,
                          }
                        : item
            )
        );
    };

    /* =====================================================
       ITEM PRICE
    ===================================================== */

    const updateItemPrice = (
        index,
        value
    ) => {
        setItems((current) =>
            current.map(
                (
                    item,
                    itemIndex
                ) =>
                    itemIndex === index
                        ? {
                              ...item,
                              purchasePrice:
                                  value,
                          }
                        : item
            )
        );
    };

    /* =====================================================
       REMOVE ITEM
    ===================================================== */

    const removeItem = (index) => {
        setItems((current) =>
            current.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    /* =====================================================
       CREATE PURCHASE
    ===================================================== */

    const createPurchase = async (
        event
    ) => {
        event.preventDefault();

        if (!purchaseForm.supplier) {
            setError(
                "Please select a supplier."
            );
            return;
        }

        if (items.length === 0) {
            setError(
                "Please add at least one product."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                supplier:
                    purchaseForm.supplier,

                items: items.map(
                    (item) => ({
                        product:
                            item.product,

                        quantity:
                            Number(
                                item.quantity
                            ),

                        purchasePrice:
                            Number(
                                item.purchasePrice
                            ),
                    })
                ),

                tax: formTax,

                discount:
                    formDiscount,

                notes:
                    purchaseForm.notes ||
                    "",
            };

            const result =
                await apiRequest(
                    "/purchases",
                    {
                        method: "POST",
                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to create purchase."
                );
            }

            setShowCreateModal(
                false
            );

            resetCreateForm();

            await loadPurchases();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       VIEW PURCHASE
    ===================================================== */

    const viewPurchase = async (
        purchase
    ) => {
        try {
            setActionLoading(
                `view-${purchase._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/purchases/${purchase._id}`
                );

            setSelectedPurchase(
                result?.data || purchase
            );

            setShowDetailsModal(true);
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       RECEIVE PURCHASE
    ===================================================== */

    const receivePurchase = async (
        purchase
    ) => {
        if (
            !window.confirm(
                `Receive ${purchase.purchaseNumber}? This will increase product inventory stock.`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `receive-${purchase._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/purchases/${purchase._id}/receive`,
                    {
                        method: "PATCH",
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to receive purchase."
                );
            }

            await loadPurchases();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       CANCEL PURCHASE
    ===================================================== */

    const cancelPurchase = async (
        purchase
    ) => {
        if (
            !window.confirm(
                `Cancel ${purchase.purchaseNumber}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `cancel-${purchase._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/purchases/${purchase._id}/cancel`,
                    {
                        method: "PATCH",
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to cancel purchase."
                );
            }

            await loadPurchases();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       DROPDOWN OPTIONS
    ===================================================== */

    const supplierOptions =
        suppliers
            .filter(
                (supplier) =>
                    supplier.isActive !==
                    false
            )
            .map((supplier) => ({
                value:
                    supplier._id,
                label:
                    supplier.companyName ||
                    supplier.contactPerson ||
                    supplier.phone ||
                    "Supplier",
            }));

    const productOptions =
        products
            .filter(
                (product) =>
                    product.isActive !==
                    false
            )
            .map((product) => ({
                value:
                    product._id,
                label: `${product.name} — ${formatMoney(
                    getProductPurchasePrice(
                        product
                    )
                )}`,
            }));

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="purchases-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="purchases-header">

                <div>
                    <span className="purchases-eyebrow">
                        <Truck
                            size={14}
                        />
                        PURCHASE MANAGEMENT
                    </span>

                    <h1>
                        Purchases
                    </h1>

                    <p>
                        Create purchase orders,
                        receive products and
                        manage supplier
                        transactions.
                    </p>
                </div>

                <div className="purchases-header-actions">

                    <button
                        type="button"
                        className="purchases-secondary-button"
                        onClick={
                            loadPurchases
                        }
                        disabled={
                            loading
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "purchases-spinning"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        className="purchases-primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus
                            size={17}
                        />

                        New Purchase
                    </button>

                </div>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="purchases-error">

                    <AlertCircle
                        size={18}
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Close error"
                    >
                        <X
                            size={16}
                        />
                    </button>

                </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <section className="purchases-stats">

                {stats.map(
                    ({
                        label,
                        value,
                        icon: Icon,
                        tone,
                    }) => (
                        <div
                            className="purchases-stat-card"
                            key={label}
                        >

                            <div
                                className={`purchases-stat-icon ${tone}`}
                            >
                                <Icon
                                    size={19}
                                />
                            </div>

                            <div className="purchases-stat-content">

                                <span>
                                    {label}
                                </span>

                                <strong>
                                    {value}
                                </strong>

                            </div>

                        </div>
                    )
                )}

            </section>

            {/* =================================================
                ALL PURCHASES
            ================================================= */}

            <section className="purchases-card">

                <header className="purchases-card-header">

                    <div>

                        <h2>
                            All Purchases
                        </h2>

                        <p>
                            View and manage
                            pharmacy supplier
                            purchases.
                        </p>

                    </div>

                </header>

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="purchases-toolbar">

                    <div className="purchases-search">

                        <Search
                            size={17}
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder="Search purchase number or supplier..."
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                <X
                                    size={15}
                                />
                            </button>
                        )}

                    </div>

                    <CustomDropdown
                        value={
                            statusFilter
                        }
                        onChange={
                            setStatusFilter
                        }
                        ariaLabel="Filter purchases by status"
                        options={[
                            {
                                value:
                                    "ALL",
                                label:
                                    "All status",
                            },
                            {
                                value:
                                    "DRAFT",
                                label:
                                    "Draft",
                            },
                            {
                                value:
                                    "RECEIVED",
                                label:
                                    "Received",
                            },
                            {
                                value:
                                    "CANCELLED",
                                label:
                                    "Cancelled",
                            },
                        ]}
                    />

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="purchases-table-wrap">

                    <table className="purchases-table">

                        <thead>

                            <tr>

                                <th>
                                    Purchase
                                </th>

                                <th>
                                    Supplier
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>

                                    <td
                                        colSpan="7"
                                    >

                                        <div className="purchases-state">

                                            <Loader2
                                                size={
                                                    25
                                                }
                                                className="purchases-spinning"
                                            />

                                            <strong>
                                                Loading
                                                purchases...
                                            </strong>

                                        </div>

                                    </td>

                                </tr>
                            ) : filteredPurchases.length ===
                              0 ? (
                                <tr>

                                    <td
                                        colSpan="7"
                                    >

                                        <div className="purchases-state">

                                            <Truck
                                                size={
                                                    28
                                                }
                                            />

                                            <strong>
                                                No purchases
                                                found
                                            </strong>

                                            <span>
                                                Try changing
                                                your search
                                                or filter.
                                            </span>

                                        </div>

                                    </td>

                                </tr>
                            ) : (
                                filteredPurchases.map(
                                    (
                                        purchase
                                    ) => {

                                        const isActionLoading =
                                            actionLoading.includes(
                                                purchase._id
                                            );

                                        return (
                                            <tr
                                                key={
                                                    purchase._id
                                                }
                                            >

                                                <td>

                                                    <div className="purchase-number">

                                                        <span>
                                                            <FileText
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </span>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    purchase.purchaseNumber
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    purchase.items
                                                                        ?.length ||
                                                                    0
                                                                }{" "}
                                                                products
                                                            </small>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="purchase-supplier">

                                                        <Truck
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {
                                                            getSupplierName(
                                                                purchase.supplier
                                                            )
                                                        }

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="purchase-items-count">

                                                        {
                                                            purchase.items
                                                                ?.length ||
                                                            0
                                                        }{" "}
                                                        item
                                                        {purchase
                                                            .items
                                                            ?.length ===
                                                        1
                                                            ? ""
                                                            : "s"}

                                                    </span>

                                                </td>

                                                <td>

                                                    <strong className="purchase-total">

                                                        {formatMoney(
                                                            purchase.total
                                                        )}

                                                    </strong>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`purchases-status-badge ${getStatusClass(
                                                            purchase.status
                                                        )}`}
                                                    >
                                                        {
                                                            purchase.status
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="purchase-date">

                                                        <CalendarDays
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {formatDate(
                                                            purchase.createdAt
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="purchase-actions">

                                                        <button
                                                            type="button"
                                                            className="purchase-action view"
                                                            title="View purchase"
                                                            onClick={() =>
                                                                viewPurchase(
                                                                    purchase
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                        >

                                                            {actionLoading ===
                                                            `view-${purchase._id}` ? (
                                                                <Loader2
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="purchases-spinning"
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}

                                                        </button>

                                                        {purchase.status ===
                                                            "DRAFT" && (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    className="purchase-action receive"
                                                                    title="Receive purchase"
                                                                    onClick={() =>
                                                                        receivePurchase(
                                                                            purchase
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >

                                                                    {actionLoading ===
                                                                    `receive-${purchase._id}` ? (
                                                                        <Loader2
                                                                            size={
                                                                                15
                                                                            }
                                                                            className="purchases-spinning"
                                                                        />
                                                                    ) : (
                                                                        <Check
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    )}

                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="purchase-action cancel"
                                                                    title="Cancel purchase"
                                                                    onClick={() =>
                                                                        cancelPurchase(
                                                                            purchase
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >

                                                                    {actionLoading ===
                                                                    `cancel-${purchase._id}` ? (
                                                                        <Loader2
                                                                            size={
                                                                                15
                                                                            }
                                                                            className="purchases-spinning"
                                                                        />
                                                                    ) : (
                                                                        <XCircle
                                                                            size={
                                                                                15
                                                                            }
                                                                        />
                                                                    )}

                                                                </button>

                                                            </>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </section>

            {/* =================================================
                CREATE PURCHASE MODAL
            ================================================= */}

            {showCreateModal && (
                <div
                    className="purchases-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >

                    <div
                        className="purchases-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <header className="purchases-modal-header">

                            <div>

                                <span className="purchases-eyebrow">
                                    NEW PROCUREMENT
                                </span>

                                <h2>
                                    Create Purchase
                                </h2>

                                <p>
                                    Add products and
                                    record a supplier
                                    purchase.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="purchases-modal-close"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X
                                    size={19}
                                />
                            </button>

                        </header>

                        <form
                            className="purchases-form"
                            onSubmit={
                                createPurchase
                            }
                        >

                            {/* =================================================
                                SUPPLIER
                            ================================================= */}

                            <label className="purchases-field">

                                <span>
                                    Supplier
                                </span>

                                <CustomDropdown
                                    value={
                                        purchaseForm.supplier
                                    }
                                    onChange={(
                                        value
                                    ) =>
                                        setPurchaseForm(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                supplier:
                                                    value,
                                            })
                                        )
                                    }
                                    placeholder="Select supplier"
                                    ariaLabel="Select supplier"
                                    options={
                                        supplierOptions
                                    }
                                    searchable
                                    disabled={
                                        saving
                                    }
                                />

                            </label>

                            {/* =================================================
                                PRODUCT ADDER
                            ================================================= */}

                            <div className="purchases-product-adder">

                                <label className="purchases-field">

                                    <span>
                                        Product
                                    </span>

                                    <CustomDropdown
                                        value={
                                            productToAdd
                                        }
                                        onChange={
                                            handleProductChange
                                        }
                                        placeholder="Select product"
                                        ariaLabel="Select product"
                                        options={
                                            productOptions
                                        }
                                        searchable
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                                <label className="purchases-field">

                                    <span>
                                        Quantity
                                    </span>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            quantityToAdd
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setQuantityToAdd(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                                <label className="purchases-field">

                                    <span>
                                        Purchase Price
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            priceToAdd
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPriceToAdd(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                                <button
                                    type="button"
                                    className="purchases-add-product"
                                    onClick={
                                        addProduct
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    <Plus
                                        size={15}
                                    />

                                    Add Product
                                </button>

                            </div>

                            {/* =================================================
                                ITEMS
                            ================================================= */}

                            <div className="purchases-items-box">

                                <div className="purchases-items-heading">

                                    <span>
                                        Purchase Items
                                    </span>

                                    <strong>
                                        {
                                            items.length
                                        }
                                    </strong>

                                </div>

                                {items.length ===
                                0 ? (
                                    <div className="purchases-empty-items">

                                        <Package
                                            size={
                                                25
                                            }
                                        />

                                        <span>
                                            No products
                                            added yet.
                                        </span>

                                    </div>
                                ) : (
                                    <div className="purchases-form-items">

                                        {items.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="purchases-form-item"
                                                    key={
                                                        item.product
                                                    }
                                                >

                                                    <div className="purchases-form-item-info">

                                                        <strong>
                                                            {
                                                                item.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {item.barcode ||
                                                                "No barcode"}
                                                        </small>

                                                    </div>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateItemQuantity(
                                                                index,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={
                                                            item.purchasePrice
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateItemPrice(
                                                                index,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    />

                                                    <strong className="purchases-item-subtotal">

                                                        {formatMoney(
                                                            Number(
                                                                item.quantity
                                                            ) *
                                                                Number(
                                                                    item.purchasePrice
                                                                )
                                                        )}

                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="purchases-remove-item"
                                                        onClick={() =>
                                                            removeItem(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                    >

                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                        />

                                                    </button>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>

                            {/* =================================================
                                TAX / DISCOUNT
                            ================================================= */}

                            <div className="purchases-form-grid">

                                <label className="purchases-field">

                                    <span>
                                        Tax
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            purchaseForm.tax
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPurchaseForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    tax: event
                                                        .target
                                                        .value,
                                                })
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                                <label className="purchases-field">

                                    <span>
                                        Discount
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            purchaseForm.discount
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPurchaseForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    discount:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                        placeholder="0.00"
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                            </div>

                            {/* =================================================
                                NOTES
                            ================================================= */}

                            <label className="purchases-field">

                                <span>
                                    Notes
                                </span>

                                <textarea
                                    rows="3"
                                    value={
                                        purchaseForm.notes
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPurchaseForm(
                                            (
                                                previous
                                            ) => ({
                                                ...previous,
                                                notes: event
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                    placeholder="Optional note about this purchase..."
                                    disabled={
                                        saving
                                    }
                                />

                            </label>

                            {/* =================================================
                                TOTAL
                            ================================================= */}

                            <div className="purchases-total-box">

                                <div>

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            formSubtotal
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Tax
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            formTax
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        -
                                        {formatMoney(
                                            formDiscount
                                        )}
                                    </strong>

                                </div>

                                <div className="purchases-grand-total">

                                    <span>
                                        Grand Total
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            formTotal
                                        )}
                                    </strong>

                                </div>

                            </div>

                            {/* =================================================
                                FOOTER
                            ================================================= */}

                            <footer className="purchases-modal-footer">

                                <button
                                    type="button"
                                    className="purchases-secondary-button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="purchases-primary-button"
                                    disabled={
                                        saving ||
                                        !purchaseForm.supplier ||
                                        items.length ===
                                            0
                                    }
                                >

                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={
                                                    17
                                                }
                                                className="purchases-spinning"
                                            />

                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Check
                                                size={
                                                    17
                                                }
                                            />

                                            Create Purchase
                                        </>
                                    )}

                                </button>

                            </footer>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                DETAILS MODAL
            ================================================= */}

            {showDetailsModal &&
                selectedPurchase && (
                    <div
                        className="purchases-backdrop"
                        onMouseDown={(
                            event
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                setShowDetailsModal(
                                    false
                                );
                            }
                        }}
                    >

                        <div
                            className="purchases-modal purchases-details-modal"
                            role="dialog"
                            aria-modal="true"
                        >

                            <header className="purchases-modal-header">

                                <div>

                                    <span className="purchases-eyebrow">
                                        PURCHASE DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedPurchase.purchaseNumber
                                        }
                                    </h2>

                                    <p>
                                        Created{" "}
                                        {formatDate(
                                            selectedPurchase.createdAt
                                        )}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="purchases-modal-close"
                                    onClick={() =>
                                        setShowDetailsModal(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={19}
                                    />
                                </button>

                            </header>

                            <div className="purchases-details-content">

                                <div className="purchases-detail-grid">

                                    <div>

                                        <span>
                                            Supplier
                                        </span>

                                        <strong>
                                            {getSupplierName(
                                                selectedPurchase.supplier
                                            )}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                selectedPurchase.status
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Created By
                                        </span>

                                        <strong>
                                            {selectedPurchase.createdBy
                                                ? [
                                                      selectedPurchase
                                                          .createdBy
                                                          .firstName,
                                                      selectedPurchase
                                                          .createdBy
                                                          .lastName,
                                                  ]
                                                      .filter(
                                                          Boolean
                                                      )
                                                      .join(
                                                          " "
                                                      )
                                                : "—"}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Received
                                        </span>

                                        <strong>
                                            {selectedPurchase.receivedAt
                                                ? formatDate(
                                                      selectedPurchase.receivedAt
                                                  )
                                                : "Not received"}
                                        </strong>

                                    </div>

                                </div>

                                <div className="purchases-details-items">

                                    <h3>
                                        Products
                                    </h3>

                                    {(
                                        selectedPurchase.items ||
                                        []
                                    ).map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="purchases-details-item"
                                                key={
                                                    item._id
                                                }
                                            >

                                                <div>

                                                    <strong>
                                                        {getProductName(
                                                            item.product
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.quantity
                                                        }{" "}
                                                        ×{" "}
                                                        {formatMoney(
                                                            item.purchasePrice
                                                        )}
                                                    </span>

                                                </div>

                                                <strong>
                                                    {formatMoney(
                                                        item.subtotal
                                                    )}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>

                                <div className="purchases-details-total">

                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatMoney(
                                                selectedPurchase.subtotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Tax
                                        </span>

                                        <strong>
                                            {formatMoney(
                                                selectedPurchase.tax
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Discount
                                        </span>

                                        <strong>
                                            -
                                            {formatMoney(
                                                selectedPurchase.discount
                                            )}
                                        </strong>
                                    </div>

                                    <div className="purchase-final-total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatMoney(
                                                selectedPurchase.total
                                            )}
                                        </strong>

                                    </div>

                                </div>

                                {selectedPurchase.notes && (
                                    <div className="purchases-details-notes">

                                        <span>
                                            Notes
                                        </span>

                                        <p>
                                            {
                                                selectedPurchase.notes
                                            }
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default PurchasesPage;