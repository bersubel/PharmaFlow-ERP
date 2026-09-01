import { useEffect, useMemo, useRef, useState } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Boxes,
    CalendarClock,
    Check,
    ChevronDown,
    ClipboardList,
    Loader2,
    Package,
    Plus,
    RefreshCw,
    Search,
    X,
} from "lucide-react";

import "./InventoryPage.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


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


    let data = null;

    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.errors?.[0]?.msg ||
            "Something went wrong"
        );

    }


    return data;

};


/* =========================================================
   EMPTY MOVEMENT
========================================================= */

const emptyMovement = {

    product: "",

    type: "IN",

    quantity: "",

    reference: "",

    remarks: "",

};


/* =========================================================
   FILTER OPTIONS
========================================================= */

const filterOptions = [

    {
        value: "all",
        label: "All stock",
    },

    {
        value: "low",
        label: "Low stock",
    },

    {
        value: "out",
        label: "Out of stock",
    },

    {
        value: "expiring",
        label: "Expiring soon",
    },

];


/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

const InventoryDropdown = ({
    value,
    onChange,
}) => {

    const [open, setOpen] =
        useState(false);

    const dropdownRef =
        useRef(null);


    const selectedOption =
        filterOptions.find(
            (option) =>
                option.value === value
        ) ||
        filterOptions[0];


    useEffect(() => {

        const handleOutsideClick =
            (event) => {

                if (
                    dropdownRef.current &&
                    !dropdownRef.current.contains(
                        event.target
                    )
                ) {

                    setOpen(false);

                }

            };


        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    const handleSelect = (
        option
    ) => {

        onChange(option.value);

        setOpen(false);

    };


    return (

        <div
            ref={dropdownRef}
            className={
                `inventory-dropdown ${
                    open
                        ? "open"
                        : ""
                }`
            }
        >

            <button
                type="button"
                className="inventory-dropdown-trigger"
                onClick={() =>
                    setOpen(
                        (previous) =>
                            !previous
                    )
                }
                aria-haspopup="listbox"
                aria-expanded={open}
            >

                <span>
                    {selectedOption.label}
                </span>


                <ChevronDown
                    size={16}
                    className="inventory-dropdown-arrow"
                />

            </button>


            {open && (

                <div
                    className="inventory-dropdown-menu"
                    role="listbox"
                >

                    {filterOptions.map(
                        (option) => {

                            const active =
                                option.value ===
                                value;


                            return (

                                <button
                                    key={
                                        option.value
                                    }
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        active
                                    }
                                    className={
                                        `inventory-dropdown-option ${
                                            active
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        handleSelect(
                                            option
                                        )
                                    }
                                >

                                    <span>
                                        {
                                            option.label
                                        }
                                    </span>


                                    {active && (

                                        <Check
                                            size={16}
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
   INVENTORY PAGE
========================================================= */

const InventoryPage = () => {

    const [
        products,
        setProducts,
    ] = useState([]);


    const [
        movements,
        setMovements,
    ] = useState([]);


    const [
        summary,
        setSummary,
    ] = useState(null);


    const [
        expiring,
        setExpiring,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        saving,
        setSaving,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        filter,
        setFilter,
    ] = useState("all");


    const [
        tab,
        setTab,
    ] = useState("stock");


    const [
        showModal,
        setShowModal,
    ] = useState(false);


    const [
        movement,
        setMovement,
    ] = useState(
        emptyMovement
    );


    /* =====================================================
       LOAD INVENTORY
    ===================================================== */

    const loadInventory = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                productsResult,
                movementsResult,
                summaryResult,
                expiringResult,
            ] = await Promise.all([

                apiRequest(
                    "/products"
                ),

                apiRequest(
                    "/inventory"
                ),

                apiRequest(
                    "/inventory/summary"
                ),

                apiRequest(
                    "/inventory/expiring?days=90"
                ),

            ]);


            setProducts(
                productsResult?.data ||
                []
            );


            setMovements(
                movementsResult?.data ||
                []
            );


            setSummary(
                summaryResult?.data ||
                null
            );


            setExpiring(
                expiringResult?.data ||
                []
            );

        } catch (
            requestError
        ) {

            setError(
                requestError.message
            );

        } finally {

            setLoading(false);

        }

    };


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadInventory();

    }, []);


    /* =====================================================
       ESCAPE MODAL
    ===================================================== */

    useEffect(() => {

        const onKeyDown =
            (event) => {

                if (
                    event.key ===
                    "Escape" &&
                    !saving
                ) {

                    setShowModal(false);

                }

            };


        window.addEventListener(
            "keydown",
            onKeyDown
        );


        return () => {

            window.removeEventListener(
                "keydown",
                onKeyDown
            );

        };

    }, [saving]);


    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const visibleProducts =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            const today =
                new Date();


            const cutoff =
                new Date();


            cutoff.setDate(
                cutoff.getDate() + 90
            );


            return products.filter(
                (product) => {

                    const quantity =
                        Number(
                            product.quantity ||
                            0
                        );


                    const reorderLevel =
                        Number(
                            product.reorderLevel ||
                            0
                        );


                    const expiry =
                        product.expiryDate
                            ? new Date(
                                product.expiryDate
                            )
                            : null;


                    const matchesQuery =
                        !query ||
                        [
                            product.name,
                            product.genericName,
                            product.barcode,
                        ].some(
                            (value) =>
                                value
                                    ?.toLowerCase()
                                    .includes(
                                        query
                                    )
                        );


                    const matchesFilter =
                        filter === "all" ||

                        (
                            filter === "low" &&
                            quantity > 0 &&
                            quantity <=
                                reorderLevel
                        ) ||

                        (
                            filter === "out" &&
                            quantity <= 0
                        ) ||

                        (
                            filter === "expiring" &&
                            expiry &&
                            expiry >= today &&
                            expiry <= cutoff
                        );


                    return (
                        matchesQuery &&
                        matchesFilter
                    );

                }
            );

        }, [
            products,
            search,
            filter,
        ]);


    /* =====================================================
       MODAL
    ===================================================== */

    const closeModal = () => {

        if (saving) return;


        setShowModal(false);

        setMovement(
            emptyMovement
        );

    };


    const openModal = (
        product
    ) => {

        setMovement({

            ...emptyMovement,

            product:
                product?._id || "",

        });


        setShowModal(true);

    };


    /* =====================================================
       SAVE MOVEMENT
    ===================================================== */

    const saveMovement = async (
        event
    ) => {

        event.preventDefault();


        if (!movement.product) {

            setError(
                "Please select a product."
            );

            return;

        }


        if (
            !Number.isInteger(
                Number(
                    movement.quantity
                )
            ) ||
            Number(
                movement.quantity
            ) < 1
        ) {

            setError(
                "Quantity must be a whole number greater than zero."
            );

            return;

        }


        try {

            setSaving(true);

            setError("");


            const result =
                await apiRequest(
                    "/inventory",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({

                                ...movement,

                                quantity:
                                    Number(
                                        movement.quantity
                                    ),

                            }),

                    }
                );


            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    "Unable to update inventory"
                );

            }


            setShowModal(false);

            setMovement(
                emptyMovement
            );


            await loadInventory();

        } catch (
            requestError
        ) {

            setError(
                requestError.message
            );

        } finally {

            setSaving(false);

        }

    };


    /* =====================================================
       STOCK STATE
    ===================================================== */

    const stockState = (
        product
    ) => {

        const quantity =
            Number(
                product.quantity ||
                0
            );


        if (
            quantity <= 0
        ) {

            return [
                "Out of stock",
                "danger",
            ];

        }


        if (
            quantity <=
            Number(
                product.reorderLevel ||
                0
            )
        ) {

            return [
                "Low stock",
                "warning",
            ];

        }


        return [
            "In stock",
            "success",
        ];

    };


    /* =====================================================
       DATE
    ===================================================== */

    const formatDate = (
        date
    ) => {

        if (!date) return "—";


        return new Intl.DateTimeFormat(
            "en",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        ).format(
            new Date(date)
        );

    };


    /* =====================================================
       EXPIRY STATE
    ===================================================== */

    const expiryState = (
        date
    ) => {

        if (!date) {

            return [
                "No expiry",
                "neutral",
            ];

        }


        const days =
            Math.ceil(
                (
                    new Date(date) -
                    new Date()
                ) /
                86400000
            );


        if (days < 0) {

            return [
                "Expired",
                "danger",
            ];

        }


        if (days <= 90) {

            return [
                `${days} days`,
                "warning",
            ];

        }


        return [
            formatDate(date),
            "neutral",
        ];

    };


    /* =====================================================
       STAT CARDS
    ===================================================== */

    const cards = [

        [
            "Total products",
            summary?.totalProducts ??
                products.length,
            Package,
            "green",
        ],

        [
            "Units in stock",
            summary?.totalUnits ??
                0,
            Boxes,
            "blue",
        ],

        [
            "Low stock items",
            summary?.lowStockProducts ??
                0,
            AlertCircle,
            "orange",
        ],

        [
            "Expiring within 90 days",
            expiring.length,
            CalendarClock,
            "purple",
        ],

    ];


    /* =====================================================
       RENDER
    ===================================================== */

    return (

        <div className="inventory-page">


            {/* =============================================
                HEADER
            ============================================= */}

            <section className="inventory-header">

                <div>

                    <span className="inventory-eyebrow">

                        <Boxes size={15} />

                        STOCK CONTROL

                    </span>


                    <h1>
                        Inventory
                    </h1>


                    <p>
                        Monitor stock levels,
                        expiry dates and
                        inventory movements.
                    </p>

                </div>


                <button
                    type="button"
                    className="inventory-primary"
                    onClick={() =>
                        openModal()
                    }
                >

                    <Plus size={18} />

                    Adjust Stock

                </button>

            </section>


            {/* =============================================
                ERROR
            ============================================= */}

            {error && (

                <div
                    className="inventory-error"
                >

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


            {/* =============================================
                STATS
            ============================================= */}

            <section
                className="inventory-stats"
            >

                {cards.map(
                    ([
                        label,
                        value,
                        Icon,
                        tone,
                    ]) => (

                        <div
                            className="inventory-stat"
                            key={label}
                        >

                            <span
                                className={
                                    `inventory-stat-icon ${tone}`
                                }
                            >

                                <Icon
                                    size={19}
                                />

                            </span>


                            <div>

                                <span>
                                    {label}
                                </span>


                                <strong>
                                    {Number(
                                        value
                                    ).toLocaleString()}
                                </strong>

                            </div>

                        </div>

                    )
                )}

            </section>


            {/* =============================================
                MAIN CARD
            ============================================= */}

            <section
                className="inventory-card"
            >


                {/* CARD HEADER */}

                <header
                    className="inventory-card-header"
                >

                    <div
                        className="inventory-tabs"
                        role="tablist"
                    >

                        <button
                            type="button"
                            className={
                                tab === "stock"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setTab("stock")
                            }
                        >
                            Stock levels
                        </button>


                        <button
                            type="button"
                            className={
                                tab ===
                                "movements"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setTab(
                                    "movements"
                                )
                            }
                        >
                            Movement history
                        </button>

                    </div>


                    <button
                        type="button"
                        className="inventory-refresh"
                        onClick={
                            loadInventory
                        }
                        title="Refresh inventory"
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

                </header>


                {/* =========================================
                    STOCK TAB
                ========================================= */}

                {tab === "stock" ? (

                    <>


                        {/* TOOLBAR */}

                        <div
                            className="inventory-toolbar"
                        >


                            {/* SEARCH */}

                            <div
                                className="inventory-search"
                            >

                                <Search
                                    size={18}
                                />


                                <input
                                    type="search"
                                    value={
                                        search
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setSearch(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                    placeholder="Search products..."
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

                                        <X
                                            size={15}
                                        />

                                    </button>

                                )}

                            </div>


                            {/* CUSTOM FILTER */}

                            <InventoryDropdown
                                value={filter}
                                onChange={
                                    setFilter
                                }
                            />

                        </div>


                        {/* TABLE */}

                        <div
                            className="inventory-table-wrap"
                        >

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Available stock
                                        </th>

                                        <th>
                                            Reorder level
                                        </th>

                                        <th>
                                            Expiry
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th />

                                    </tr>

                                </thead>


                                <tbody>

                                    {loading ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                            >

                                                <State
                                                    icon={
                                                        Loader2
                                                    }
                                                    text="Loading inventory..."
                                                    spin
                                                />

                                            </td>

                                        </tr>

                                    ) : visibleProducts.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                            >

                                                <State
                                                    icon={
                                                        Package
                                                    }
                                                    text="No matching products found."
                                                />

                                            </td>

                                        </tr>

                                    ) : (

                                        visibleProducts.map(
                                            (
                                                product
                                            ) => {

                                                const [
                                                    stockLabel,
                                                    stockClass,
                                                ] =
                                                    stockState(
                                                        product
                                                    );


                                                const [
                                                    expiryLabel,
                                                    expiryClass,
                                                ] =
                                                    expiryState(
                                                        product.expiryDate
                                                    );


                                                return (

                                                    <tr
                                                        key={
                                                            product._id
                                                        }
                                                    >

                                                        <td>

                                                            <div
                                                                className="inventory-product"
                                                            >

                                                                <span>

                                                                    <Package
                                                                        size={
                                                                            17
                                                                        }
                                                                    />

                                                                </span>


                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </strong>


                                                                    <small>
                                                                        {
                                                                            product.barcode ||
                                                                            product.genericName ||
                                                                            "No barcode"
                                                                        }
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            {
                                                                product
                                                                    .category
                                                                    ?.name ||
                                                                "Uncategorized"
                                                            }

                                                        </td>


                                                        <td>

                                                            <strong>
                                                                {Number(
                                                                    product.quantity ||
                                                                    0
                                                                ).toLocaleString()}
                                                            </strong>{" "}

                                                            {
                                                                product
                                                                    .unit
                                                                    ?.shortName ||
                                                                product
                                                                    .unit
                                                                    ?.name ||
                                                                "units"
                                                            }

                                                        </td>


                                                        <td>

                                                            {Number(
                                                                product.reorderLevel ||
                                                                0
                                                            ).toLocaleString()}

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `inventory-expiry ${expiryClass}`
                                                                }
                                                            >
                                                                {
                                                                    expiryLabel
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    `inventory-badge ${stockClass}`
                                                                }
                                                            >
                                                                {
                                                                    stockLabel
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="inventory-adjust"
                                                                onClick={() =>
                                                                    openModal(
                                                                        product
                                                                    )
                                                                }
                                                            >
                                                                Adjust
                                                            </button>

                                                        </td>

                                                    </tr>

                                                );

                                            }
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </>

                ) : (

                    /* =========================================
                       MOVEMENT HISTORY
                    ========================================= */

                    <div
                        className="inventory-table-wrap"
                    >

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Movement
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Reference
                                    </th>

                                    <th>
                                        Recorded by
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {loading ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                        >

                                            <State
                                                icon={
                                                    Loader2
                                                }
                                                text="Loading movements..."
                                                spin
                                            />

                                        </td>

                                    </tr>

                                ) : movements.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                        >

                                            <State
                                                icon={
                                                    ClipboardList
                                                }
                                                text="No inventory movements yet."
                                            />

                                        </td>

                                    </tr>

                                ) : (

                                    movements.map(
                                        (
                                            item
                                        ) => {

                                            const isIn =
                                                item.type ===
                                                "IN";


                                            return (

                                                <tr
                                                    key={
                                                        item._id
                                                    }
                                                >

                                                    <td>

                                                        <strong>
                                                            {
                                                                item
                                                                    .product
                                                                    ?.name ||
                                                                "Unknown product"
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                `inventory-movement ${
                                                                    isIn
                                                                        ? "in"
                                                                        : "out"
                                                                }`
                                                            }
                                                        >

                                                            {isIn ? (

                                                                <ArrowUpRight
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                            ) : (

                                                                <ArrowDownRight
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                            )}


                                                            {isIn
                                                                ? "Stock in"
                                                                : "Stock out"}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <strong>

                                                            {isIn
                                                                ? "+"
                                                                : "−"}

                                                            {Number(
                                                                item.quantity
                                                            ).toLocaleString()}

                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            item.reference ||
                                                            "—"
                                                        }
                                                    </td>


                                                    <td>

                                                        {item.createdBy

                                                            ? `${item.createdBy.firstName || ""} ${item.createdBy.lastName || ""}`.trim()

                                                            : "—"}

                                                    </td>


                                                    <td>

                                                        {
                                                            formatDate(
                                                                item.createdAt
                                                            )
                                                        }

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* =============================================
                MODAL
            ============================================= */}

            {showModal && (

                <div
                    className="inventory-backdrop"
                    onMouseDown={
                        (event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {

                                closeModal();

                            }

                        }
                    }
                >

                    <div
                        className="inventory-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inventory-modal-title"
                    >

                        <header>

                            <div>

                                <span className="inventory-eyebrow">
                                    STOCK MOVEMENT
                                </span>


                                <h2
                                    id="inventory-modal-title"
                                >
                                    Adjust inventory
                                </h2>


                                <p>
                                    Record stock
                                    entering or
                                    leaving your
                                    pharmacy.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                                aria-label="Close form"
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </header>


                        <form
                            onSubmit={
                                saveMovement
                            }
                        >


                            <label>

                                Product{" "}

                                <em>
                                    *
                                </em>


                                <select
                                    name="product"
                                    value={
                                        movement.product
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setMovement(
                                                {
                                                    ...movement,
                                                    product:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                    }
                                    required
                                    disabled={
                                        saving
                                    }
                                >

                                    <option value="">
                                        Select a product
                                    </option>


                                    {products.map(
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
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            <div
                                className="inventory-form-grid"
                            >

                                <label>

                                    Movement type{" "}

                                    <em>
                                        *
                                    </em>


                                    <select
                                        name="type"
                                        value={
                                            movement.type
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setMovement(
                                                    {
                                                        ...movement,
                                                        type:
                                                            event
                                                                .target
                                                                .value,
                                                    }
                                                )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >

                                        <option value="IN">
                                            Stock in
                                        </option>

                                        <option value="OUT">
                                            Stock out
                                        </option>

                                    </select>

                                </label>


                                <label>

                                    Quantity{" "}

                                    <em>
                                        *
                                    </em>


                                    <input
                                        type="number"
                                        value={
                                            movement.quantity
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setMovement(
                                                    {
                                                        ...movement,
                                                        quantity:
                                                            event
                                                                .target
                                                                .value,
                                                    }
                                                )
                                        }
                                        min="1"
                                        step="1"
                                        placeholder="0"
                                        required
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                            </div>


                            <label>

                                Reference


                                <input
                                    value={
                                        movement.reference
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setMovement(
                                                {
                                                    ...movement,
                                                    reference:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                    }
                                    placeholder="e.g. Stock count, damaged item"
                                    disabled={
                                        saving
                                    }
                                />

                            </label>


                            <label>

                                Remarks


                                <textarea
                                    value={
                                        movement.remarks
                                    }
                                    onChange={
                                        (
                                            event
                                        ) =>
                                            setMovement(
                                                {
                                                    ...movement,
                                                    remarks:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                    }
                                    rows="3"
                                    placeholder="Add a note about this adjustment..."
                                    disabled={
                                        saving
                                    }
                                />

                            </label>


                            <footer>

                                <button
                                    type="button"
                                    className="inventory-secondary"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="inventory-primary"
                                    disabled={
                                        saving
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

                                            Save movement
                                        </>

                                    )}

                                </button>

                            </footer>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

};


/* =========================================================
   STATE COMPONENT
========================================================= */

const State = ({
    icon: Icon,
    text,
    spin = false,
}) => (

    <div
        className="inventory-state"
    >

        <Icon
            size={24}
            className={
                spin
                    ? "spinning"
                    : ""
            }
        />

        {text}

    </div>

);


export default InventoryPage;