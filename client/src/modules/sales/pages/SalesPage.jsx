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
    ShoppingCart,
    Trash2,
    User,
    X,
    XCircle,
} from "lucide-react";

import "./SalesPage.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptySale = {
    customer: "",
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    tax: "",
    discount: "",
    notes: "",
};

const initialItem = {
    product: "",
    quantity: 1,
    sellingPrice: "",
};

/* =========================================================
   API
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

const getCustomerName = (customer) => {
    if (!customer) {
        return "Walk-in customer";
    }

    if (typeof customer === "string") {
        return customer;
    }

    const fullName = [
        customer.firstName,
        customer.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        fullName ||
        customer.name ||
        customer.phone ||
        customer.email ||
        "Customer"
    );
};

const getProductPrice = (product) => {
    return Number(
        product?.sellingPrice ??
            product?.price ??
            0
    );
};

const getStatusClass = (status) => {
    switch (status) {
        case "COMPLETED":
            return "completed";

        case "CANCELLED":
            return "cancelled";

        case "DRAFT":
        default:
            return "draft";
    }
};

const getPaymentClass = (status) => {
    switch (status) {
        case "PAID":
            return "paid";

        case "PARTIAL":
            return "partial";

        case "UNPAID":
        default:
            return "unpaid";
    }
};

/* =========================================================
   CUSTOM FILTER DROPDOWN
========================================================= */

const CustomFilter = ({
    value,
    onChange,
    options,
    ariaLabel,
}) => {
    const [open, setOpen] =
        useState(false);

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
            }
        };

        const handleEscape = (event) => {
            if (
                event.key ===
                "Escape"
            ) {
                setOpen(false);
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
        ) || options[0];

    const handleSelect = (
        optionValue
    ) => {
        onChange(optionValue);
        setOpen(false);
    };

    return (
        <div
            ref={dropdownRef}
            className={`sales-filter-custom ${
                open ? "open" : ""
            }`}
        >
            <button
                type="button"
                className="sales-filter-trigger"
                onClick={() =>
                    setOpen(
                        (current) =>
                            !current
                    )
                }
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
            >
                <span className="sales-filter-selected-label">
                    {selectedOption?.label}
                </span>

                <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="sales-filter-arrow"
                />
            </button>

            {open && (
                <div
                    className="sales-filter-menu"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map(
                        (option) => {
                            const isSelected =
                                option.value ===
                                value;

                            return (
                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    className={`sales-filter-option ${
                                        isSelected
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
                                        isSelected
                                    }
                                >
                                    <span>
                                        {
                                            option.label
                                        }
                                    </span>

                                    {isSelected && (
                                        <Check
                                            size={
                                                15
                                            }
                                            strokeWidth={
                                                2.5
                                            }
                                        />
                                    )}
                                </button>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
};

/* =========================================================
   SALES PAGE
========================================================= */

const SalesPage = () => {
    const [sales, setSales] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [customers, setCustomers] =
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

    const [paymentFilter, setPaymentFilter] =
        useState("ALL");

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [selectedSale, setSelectedSale] =
        useState(null);

    const [saleForm, setSaleForm] =
        useState(emptySale);

    const [items, setItems] =
        useState([]);

    const [productToAdd, setProductToAdd] =
        useState("");

    const [quantityToAdd, setQuantityToAdd] =
        useState(1);

    const [priceToAdd, setPriceToAdd] =
        useState("");

    /* =====================================================
       LOAD DATA
    ===================================================== */

    const loadSales = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                salesResult,
                productsResult,
                customersResult,
            ] = await Promise.all([
                apiRequest("/sales"),
                apiRequest("/products"),
                apiRequest("/customers"),
            ]);

            setSales(
                salesResult?.data || []
            );

            setProducts(
                productsResult?.data || []
            );

            setCustomers(
                customersResult?.data || []
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
        loadSales();
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

    const filteredSales = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return sales.filter((sale) => {
            const customerName =
                getCustomerName(
                    sale.customer
                ).toLowerCase();

            const saleNumber =
                String(
                    sale.saleNumber || ""
                ).toLowerCase();

            const matchesSearch =
                !query ||
                saleNumber.includes(query) ||
                customerName.includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                sale.status ===
                    statusFilter;

            const matchesPayment =
                paymentFilter === "ALL" ||
                sale.paymentStatus ===
                    paymentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );
        });
    }, [
        sales,
        search,
        statusFilter,
        paymentFilter,
    ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const stats = useMemo(() => {
        const completedSales =
            sales.filter(
                (sale) =>
                    sale.status ===
                    "COMPLETED"
            );

        const totalRevenue =
            completedSales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.total || 0
                    ),
                0
            );

        const pendingPayments =
            sales.filter(
                (sale) =>
                    sale.paymentStatus ===
                        "UNPAID" ||
                    sale.paymentStatus ===
                        "PARTIAL"
            ).length;

        return [
            {
                label: "Total Sales",
                value: sales.length,
                icon: ShoppingCart,
                tone: "green",
            },
            {
                label: "Completed Sales",
                value:
                    completedSales.length,
                icon: Check,
                tone: "blue",
            },
            {
                label: "Total Revenue",
                value:
                    formatMoney(
                        totalRevenue
                    ),
                icon: CircleDollarSign,
                tone: "orange",
            },
            {
                label: "Pending Payments",
                value: pendingPayments,
                icon: FileText,
                tone: "purple",
            },
        ];
    }, [sales]);

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
                        item.sellingPrice ||
                            0
                    ),
            0
        );
    }, [items]);

    const formTax =
        Number(saleForm.tax) || 0;

    const formDiscount =
        Number(saleForm.discount) || 0;

    const formTotal = Math.max(
        0,
        formSubtotal +
            formTax -
            formDiscount
    );

    /* =====================================================
       FORM RESET
    ===================================================== */

    const resetCreateForm = () => {
        setSaleForm({
            ...emptySale,
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
       CUSTOMER
    ===================================================== */

    const handleCustomerChange = (
        event
    ) => {
        setSaleForm((previous) => ({
            ...previous,
            customer:
                event.target.value,
        }));
    };

    /* =====================================================
       PRODUCT
    ===================================================== */

    const handleProductChange = (
        event
    ) => {
        const value =
            event.target.value;

        setProductToAdd(value);

        const product =
            products.find(
                (item) =>
                    item._id === value
            );

        if (product) {
            setPriceToAdd(
                String(
                    getProductPrice(
                        product
                    )
                )
            );
        } else {
            setPriceToAdd("");
        }
    };

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

        const sellingPrice =
            Number(priceToAdd);

        if (
            Number.isNaN(
                sellingPrice
            ) ||
            sellingPrice < 0
        ) {
            setError(
                "Selling price must be a valid number."
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
                                  sellingPrice,
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
                    sellingPrice,
                },
            ]);
        }

        setProductToAdd("");

        setQuantityToAdd(1);

        setPriceToAdd("");

        setError("");
    };

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
                              sellingPrice:
                                  value,
                          }
                        : item
            )
        );
    };

    const removeItem = (index) => {
        setItems((current) =>
            current.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    /* =====================================================
       CREATE SALE
    ===================================================== */

    const createSale = async (event) => {
        event.preventDefault();

        if (items.length === 0) {
            setError(
                "Please add at least one product."
            );
            return;
        }

        if (formTotal < 0) {
            setError(
                "Sale total cannot be negative."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                ...(saleForm.customer
                    ? {
                          customer:
                              saleForm.customer,
                      }
                    : {
                          customer: null,
                      }),

                items: items.map(
                    (item) => ({
                        product:
                            item.product,

                        quantity:
                            Number(
                                item.quantity
                            ),

                        sellingPrice:
                            Number(
                                item.sellingPrice
                            ),
                    })
                ),

                tax: formTax,

                discount:
                    formDiscount,

                paymentMethod:
                    saleForm.paymentMethod,

                paymentStatus:
                    saleForm.paymentStatus,

                notes:
                    saleForm.notes || "",
            };

            const result =
                await apiRequest(
                    "/sales",
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
                        "Unable to create sale."
                );
            }

            setShowCreateModal(
                false
            );

            resetCreateForm();

            await loadSales();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       VIEW SALE
    ===================================================== */

    const viewSale = async (sale) => {
        try {
            setActionLoading(
                `view-${sale._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/sales/${sale._id}`
                );

            setSelectedSale(
                result?.data || sale
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
       COMPLETE SALE
    ===================================================== */

    const completeSale = async (
        sale
    ) => {
        if (
            !window.confirm(
                `Complete ${sale.saleNumber}? This will reduce inventory stock.`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `complete-${sale._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/sales/${sale._id}/complete`,
                    {
                        method: "PATCH",
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to complete sale."
                );
            }

            await loadSales();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       CANCEL SALE
    ===================================================== */

    const cancelSale = async (
        sale
    ) => {
        if (
            !window.confirm(
                `Cancel ${sale.saleNumber}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `cancel-${sale._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/sales/${sale._id}/cancel`,
                    {
                        method: "PATCH",
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to cancel sale."
                );
            }

            await loadSales();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="sales-page">

            <section className="sales-header">
                <div>
                    <span className="sales-eyebrow">
                        <ShoppingCart
                            size={14}
                        />
                        SALES MANAGEMENT
                    </span>

                    <h1>Sales</h1>

                    <p>
                        Create sales, track
                        payments and manage
                        completed
                        transactions.
                    </p>
                </div>

                <div className="sales-header-actions">
                    <button
                        type="button"
                        className="sales-secondary-button"
                        onClick={
                            loadSales
                        }
                        disabled={
                            loading
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "sales-spinning"
                                    : ""
                            }
                        />
                        Refresh
                    </button>

                    <button
                        type="button"
                        className="sales-primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus size={17} />
                        New Sale
                    </button>
                </div>
            </section>

            {error && (
                <div className="sales-error">
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
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="sales-stats">
                {stats.map(
                    ({
                        label,
                        value,
                        icon: Icon,
                        tone,
                    }) => (
                        <div
                            className="sales-stat-card"
                            key={label}
                        >
                            <div
                                className={`sales-stat-icon ${tone}`}
                            >
                                <Icon
                                    size={19}
                                />
                            </div>

                            <div className="sales-stat-content">
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

            <section className="sales-card">

                <header className="sales-card-header">
                    <div>
                        <h2>
                            All Sales
                        </h2>

                        <p>
                            View and manage
                            pharmacy sales
                            transactions.
                        </p>
                    </div>
                </header>

                <div className="sales-toolbar">

                    <div className="sales-search">
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
                            placeholder="Search sale number or customer..."
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                                aria-label="Clear search"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* =================================================
                        CUSTOM STATUS DROPDOWN
                    ================================================= */}

                    <CustomFilter
                        value={
                            statusFilter
                        }
                        onChange={
                            setStatusFilter
                        }
                        ariaLabel="Filter sales by status"
                        options={[
                            {
                                value: "ALL",
                                label: "All status",
                            },
                            {
                                value: "DRAFT",
                                label: "Draft",
                            },
                            {
                                value: "COMPLETED",
                                label: "Completed",
                            },
                            {
                                value: "CANCELLED",
                                label: "Cancelled",
                            },
                        ]}
                    />

                    {/* =================================================
                        CUSTOM PAYMENT DROPDOWN
                    ================================================= */}

                    <CustomFilter
                        value={
                            paymentFilter
                        }
                        onChange={
                            setPaymentFilter
                        }
                        ariaLabel="Filter sales by payment status"
                        options={[
                            {
                                value: "ALL",
                                label: "All payment",
                            },
                            {
                                value: "PAID",
                                label: "Paid",
                            },
                            {
                                value: "PARTIAL",
                                label: "Partial",
                            },
                            {
                                value: "UNPAID",
                                label: "Unpaid",
                            },
                        ]}
                    />
                </div>

                <div className="sales-table-wrap">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Sale</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="sales-state">
                                            <Loader2
                                                size={25}
                                                className="sales-spinning"
                                            />

                                            <strong>
                                                Loading
                                                sales...
                                            </strong>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length ===
                              0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="sales-state">
                                            <ShoppingCart
                                                size={28}
                                            />

                                            <strong>
                                                No sales
                                                found
                                            </strong>

                                            <span>
                                                Try changing
                                                your search
                                                or filters.
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map(
                                    (sale) => {
                                        const isActionLoading =
                                            actionLoading.includes(
                                                sale._id
                                            );

                                        return (
                                            <tr
                                                key={
                                                    sale._id
                                                }
                                            >
                                                <td>
                                                    <div className="sale-number">
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
                                                                    sale.saleNumber
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    sale.paymentMethod
                                                                }
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="sale-customer">
                                                        <User
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {getCustomerName(
                                                            sale.customer
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="sale-items-count">
                                                        {
                                                            sale
                                                                .items
                                                                ?.length
                                                        }{" "}
                                                        item
                                                        {sale
                                                            .items
                                                            ?.length ===
                                                        1
                                                            ? ""
                                                            : "s"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="sale-total">
                                                        {formatMoney(
                                                            sale.total
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`sales-payment-badge ${getPaymentClass(
                                                            sale.paymentStatus
                                                        )}`}
                                                    >
                                                        {
                                                            sale.paymentStatus
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`sales-status-badge ${getStatusClass(
                                                            sale.status
                                                        )}`}
                                                    >
                                                        {
                                                            sale.status
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="sale-date">
                                                        <CalendarDays
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {formatDate(
                                                            sale.createdAt
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="sale-actions">

                                                        <button
                                                            type="button"
                                                            className="sale-action view"
                                                            title="View sale"
                                                            onClick={() =>
                                                                viewSale(
                                                                    sale
                                                                )
                                                            }
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `view-${sale._id}` ? (
                                                                <Loader2
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="sales-spinning"
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                        {sale.status ===
                                                            "DRAFT" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="sale-action complete"
                                                                    title="Complete sale"
                                                                    onClick={() =>
                                                                        completeSale(
                                                                            sale
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                    `complete-${sale._id}` ? (
                                                                        <Loader2
                                                                            size={
                                                                                15
                                                                            }
                                                                            className="sales-spinning"
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
                                                                    className="sale-action cancel"
                                                                    title="Cancel sale"
                                                                    onClick={() =>
                                                                        cancelSale(
                                                                            sale
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >
                                                                    {actionLoading ===
                                                                    `cancel-${sale._id}` ? (
                                                                        <Loader2
                                                                            size={
                                                                                15
                                                                            }
                                                                            className="sales-spinning"
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
                CREATE SALE MODAL
            ================================================= */}

            {showCreateModal && (
                <div
                    className="sales-backdrop"
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
                        className="sales-modal"
                        role="dialog"
                        aria-modal="true"
                    >
                        <header className="sales-modal-header">
                            <div>
                                <span className="sales-eyebrow">
                                    NEW TRANSACTION
                                </span>

                                <h2>
                                    Create Sale
                                </h2>

                                <p>
                                    Add products and
                                    record the
                                    customer's
                                    payment.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="sales-modal-close"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={19} />
                            </button>
                        </header>

                        <form
                            className="sales-form"
                            onSubmit={
                                createSale
                            }
                        >
                            <label className="sales-field">
                                <span>
                                    Customer
                                </span>

                                <div className="sales-select-wrap">
                                    <select
                                        value={
                                            saleForm.customer
                                        }
                                        onChange={
                                            handleCustomerChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <option value="">
                                            Walk-in customer
                                        </option>

                                        {customers.map(
                                            (
                                                customer
                                            ) => (
                                                <option
                                                    key={
                                                        customer._id
                                                    }
                                                    value={
                                                        customer._id
                                                    }
                                                >
                                                    {getCustomerName(
                                                        customer
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown
                                        size={16}
                                    />
                                </div>
                            </label>

                            <div className="sales-product-adder">
                                <label className="sales-field">
                                    <span>
                                        Product
                                    </span>

                                    <div className="sales-select-wrap">
                                        <select
                                            value={
                                                productToAdd
                                            }
                                            onChange={
                                                handleProductChange
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="">
                                                Select
                                                product
                                            </option>

                                            {products
                                                .filter(
                                                    (
                                                        product
                                                    ) =>
                                                        product.isActive !==
                                                        false
                                                )
                                                .map(
                                                    (
                                                        product
                                                    ) => (
                                                        <option
                                                            key={
                                                                product._id
                                                            }
                                                            value={
                                                                product._id
                                                            }
                                                        >
                                                            {
                                                                product.name
                                                            }{" "}
                                                            —{" "}
                                                            {formatMoney(
                                                                getProductPrice(
                                                                    product
                                                                )
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                        </select>

                                        <ChevronDown
                                            size={16}
                                        />
                                    </div>
                                </label>

                                <label className="sales-field">
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

                                <label className="sales-field">
                                    <span>
                                        Price
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
                                    className="sales-add-product"
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

                            <div className="sales-items-box">
                                <div className="sales-items-heading">
                                    <span>
                                        Sale Items
                                    </span>

                                    <strong>
                                        {
                                            items.length
                                        }
                                    </strong>
                                </div>

                                {items.length ===
                                0 ? (
                                    <div className="sales-empty-items">
                                        <Package
                                            size={25}
                                        />

                                        <span>
                                            No products
                                            added yet.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="sales-form-items">
                                        {items.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="sales-form-item"
                                                    key={
                                                        item.product
                                                    }
                                                >
                                                    <div className="sales-form-item-info">
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
                                                            item.sellingPrice
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

                                                    <strong className="sales-item-subtotal">
                                                        {formatMoney(
                                                            Number(
                                                                item.quantity
                                                            ) *
                                                                Number(
                                                                    item.sellingPrice
                                                                )
                                                        )}
                                                    </strong>

                                                    <button
                                                        type="button"
                                                        className="sales-remove-item"
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

                            <div className="sales-form-grid">
                                <label className="sales-field">
                                    <span>
                                        Payment
                                        Method
                                    </span>

                                    <div className="sales-select-wrap">
                                        <select
                                            value={
                                                saleForm.paymentMethod
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSaleForm(
                                                    (
                                                        previous
                                                    ) => ({
                                                        ...previous,
                                                        paymentMethod:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="CASH">
                                                Cash
                                            </option>

                                            <option value="CARD">
                                                Card
                                            </option>

                                            <option value="TRANSFER">
                                                Bank Transfer
                                            </option>

                                            <option value="CREDIT">
                                                Credit
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                        />
                                    </div>
                                </label>

                                <label className="sales-field">
                                    <span>
                                        Payment
                                        Status
                                    </span>

                                    <div className="sales-select-wrap">
                                        <select
                                            value={
                                                saleForm.paymentStatus
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSaleForm(
                                                    (
                                                        previous
                                                    ) => ({
                                                        ...previous,
                                                        paymentStatus:
                                                            event
                                                                .target
                                                                .value,
                                                    })
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            <option value="PAID">
                                                Paid
                                            </option>

                                            <option value="PARTIAL">
                                                Partial
                                            </option>

                                            <option value="UNPAID">
                                                Unpaid
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                        />
                                    </div>
                                </label>

                                <label className="sales-field">
                                    <span>
                                        Tax
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            saleForm.tax
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSaleForm(
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

                                <label className="sales-field">
                                    <span>
                                        Discount
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            saleForm.discount
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSaleForm(
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

                            <label className="sales-field">
                                <span>
                                    Notes
                                </span>

                                <textarea
                                    rows="3"
                                    value={
                                        saleForm.notes
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSaleForm(
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
                                    placeholder="Optional note about this sale..."
                                    disabled={
                                        saving
                                    }
                                />
                            </label>

                            <div className="sales-total-box">
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

                                <div className="sales-grand-total">
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

                            <footer className="sales-modal-footer">
                                <button
                                    type="button"
                                    className="sales-secondary-button"
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
                                    className="sales-primary-button"
                                    disabled={
                                        saving ||
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
                                                className="sales-spinning"
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
                                            Create Sale
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
                selectedSale && (
                    <div
                        className="sales-backdrop"
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
                            className="sales-modal sales-details-modal"
                            role="dialog"
                            aria-modal="true"
                        >
                            <header className="sales-modal-header">
                                <div>
                                    <span className="sales-eyebrow">
                                        SALE DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedSale.saleNumber
                                        }
                                    </h2>

                                    <p>
                                        Created{" "}
                                        {formatDate(
                                            selectedSale.createdAt
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="sales-modal-close"
                                    onClick={() =>
                                        setShowDetailsModal(
                                            false
                                        )
                                    }
                                >
                                    <X size={19} />
                                </button>
                            </header>

                            <div className="sales-details-content">
                                <div className="sales-detail-grid">
                                    <div>
                                        <span>
                                            Customer
                                        </span>

                                        <strong>
                                            {getCustomerName(
                                                selectedSale.customer
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Payment
                                        </span>

                                        <strong>
                                            {
                                                selectedSale.paymentMethod
                                            }{" "}
                                            ·{" "}
                                            {
                                                selectedSale.paymentStatus
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                selectedSale.status
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Created
                                            By
                                        </span>

                                        <strong>
                                            {selectedSale.createdBy
                                                ? [
                                                      selectedSale
                                                          .createdBy
                                                          .firstName,
                                                      selectedSale
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
                                </div>

                                <div className="sales-details-items">
                                    <h3>
                                        Products
                                    </h3>

                                    {(
                                        selectedSale.items ||
                                        []
                                    ).map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="sales-details-item"
                                                key={
                                                    item._id
                                                }
                                            >
                                                <div>
                                                    <strong>
                                                        {item
                                                            .product
                                                            ?.name ||
                                                            "Unknown product"}
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.quantity
                                                        }{" "}
                                                        ×{" "}
                                                        {formatMoney(
                                                            item.sellingPrice
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

                                <div className="sales-details-total">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            selectedSale.total
                                        )}
                                    </strong>
                                </div>

                                {selectedSale.notes && (
                                    <div className="sales-details-notes">
                                        <span>
                                            Notes
                                        </span>

                                        <p>
                                            {
                                                selectedSale.notes
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

export default SalesPage;