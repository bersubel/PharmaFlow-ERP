import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    Building2,
    Check,
    ChevronDown,
    CircleCheck,
    CircleX,
    Edit3,
    Eye,
    FileText,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash2,
    User,
    Users,
    X,
} from "lucide-react";

import "./SuppliersPage.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptySupplier = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
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

const getInitials = (name = "") => {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(
                (part) =>
                    part.charAt(0).toUpperCase()
            )
            .join("") || "S"
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

/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    ariaLabel,
    disabled = false,
}) => {
    const [open, setOpen] =
        useState(false);

    const dropdownRef =
        useRef(null);

    useEffect(() => {
        const handleOutside = (event) => {
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
                event.key === "Escape"
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    const selected =
        options.find(
            (option) =>
                option.value === value
        );

    const handleSelect = (
        option
    ) => {
        onChange(option.value);
        setOpen(false);
    };

    return (
        <div
            className={`supplier-dropdown ${
                open ? "open" : ""
            } ${
                disabled ? "disabled" : ""
            }`}
            ref={dropdownRef}
        >
            <button
                type="button"
                className="supplier-dropdown-trigger"
                onClick={() => {
                    if (!disabled) {
                        setOpen(
                            (current) =>
                                !current
                        );
                    }
                }}
                aria-label={ariaLabel}
                aria-expanded={open}
                disabled={disabled}
            >
                <span
                    className={
                        selected
                            ? ""
                            : "placeholder"
                    }
                >
                    {selected?.label ||
                        placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className="supplier-dropdown-chevron"
                />
            </button>

            {open && (
                <div
                    className="supplier-dropdown-menu"
                    role="listbox"
                >
                    {options.map(
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
                                    className={`supplier-dropdown-option ${
                                        active
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleSelect(
                                            option
                                        )
                                    }
                                    role="option"
                                    aria-selected={
                                        active
                                    }
                                >
                                    <span>
                                        {
                                            option.label
                                        }
                                    </span>

                                    {active && (
                                        <Check
                                            size={
                                                15
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
   SUPPLIERS PAGE
========================================================= */

const SuppliersPage = () => {
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
        showSupplierModal,
        setShowSupplierModal,
    ] = useState(false);

    const [
        showDetailsModal,
        setShowDetailsModal,
    ] = useState(false);

    const [
        editingSupplier,
        setEditingSupplier,
    ] = useState(null);

    const [
        selectedSupplier,
        setSelectedSupplier,
    ] = useState(null);

    const [
        supplierForm,
        setSupplierForm,
    ] = useState(emptySupplier);

    /* =====================================================
       LOAD SUPPLIERS
    ===================================================== */

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            setError("");

            const result =
                await apiRequest(
                    "/suppliers"
                );

            setSuppliers(
                result?.data || []
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
        loadSuppliers();
    }, []);

    /* =====================================================
       ESCAPE
    ===================================================== */

    useEffect(() => {
        const handleEscape = (event) => {
            if (
                event.key !== "Escape" ||
                saving
            ) {
                return;
            }

            setShowSupplierModal(
                false
            );

            setShowDetailsModal(
                false
            );
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [saving]);

    /* =====================================================
       FILTERED SUPPLIERS
    ===================================================== */

    const filteredSuppliers =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return suppliers.filter(
                (supplier) => {
                    const company =
                        String(
                            supplier.companyName ||
                                ""
                        ).toLowerCase();

                    const contact =
                        String(
                            supplier.contactPerson ||
                                ""
                        ).toLowerCase();

                    const email =
                        String(
                            supplier.email ||
                                ""
                        ).toLowerCase();

                    const phone =
                        String(
                            supplier.phone ||
                                ""
                        ).toLowerCase();

                    const matchesSearch =
                        !query ||
                        company.includes(
                            query
                        ) ||
                        contact.includes(
                            query
                        ) ||
                        email.includes(
                            query
                        ) ||
                        phone.includes(
                            query
                        );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        (statusFilter ===
                            "ACTIVE" &&
                            supplier.isActive !==
                                false) ||
                        (statusFilter ===
                            "INACTIVE" &&
                            supplier.isActive ===
                                false);

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            suppliers,
            search,
            statusFilter,
        ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const stats = useMemo(() => {
        const active =
            suppliers.filter(
                (supplier) =>
                    supplier.isActive !==
                    false
            ).length;

        const inactive =
            suppliers.filter(
                (supplier) =>
                    supplier.isActive ===
                    false
            ).length;

        const withContact =
            suppliers.filter(
                (supplier) =>
                    supplier.email ||
                    supplier.phone
            ).length;

        return [
            {
                label: "Total Suppliers",
                value: suppliers.length,
                icon: Building2,
                tone: "green",
            },
            {
                label: "Active Suppliers",
                value: active,
                icon: CircleCheck,
                tone: "blue",
            },
            {
                label: "Inactive",
                value: inactive,
                icon: CircleX,
                tone: "orange",
            },
            {
                label: "With Contact Info",
                value: withContact,
                icon: ShieldCheck,
                tone: "purple",
            },
        ];
    }, [suppliers]);

    /* =====================================================
       FORM
    ===================================================== */

    const resetForm = () => {
        setSupplierForm({
            ...emptySupplier,
        });

        setEditingSupplier(null);
    };

    const openCreateModal = () => {
        setError("");
        resetForm();
        setShowSupplierModal(true);
    };

    const openEditModal = (
        supplier
    ) => {
        setError("");

        setEditingSupplier(
            supplier
        );

        setSupplierForm({
            companyName:
                supplier.companyName ||
                "",
            contactPerson:
                supplier.contactPerson ||
                "",
            email:
                supplier.email || "",
            phone:
                supplier.phone || "",
            address:
                supplier.address || "",
            taxNumber:
                supplier.taxNumber ||
                "",
        });

        setShowSupplierModal(true);
    };

    const closeSupplierModal = () => {
        if (saving) {
            return;
        }

        setShowSupplierModal(false);
        resetForm();
    };

    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;

        setSupplierForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );
    };

    /* =====================================================
       SAVE SUPPLIER
    ===================================================== */

    const saveSupplier = async (
        event
    ) => {
        event.preventDefault();

        if (
            !supplierForm.companyName.trim()
        ) {
            setError(
                "Company name is required."
            );
            return;
        }

        if (
            supplierForm.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                supplierForm.email
            )
        ) {
            setError(
                "Please enter a valid email address."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                companyName:
                    supplierForm.companyName.trim(),

                contactPerson:
                    supplierForm.contactPerson.trim(),

                email:
                    supplierForm.email.trim(),

                phone:
                    supplierForm.phone.trim(),

                address:
                    supplierForm.address.trim(),

                taxNumber:
                    supplierForm.taxNumber.trim(),
            };

            const endpoint =
                editingSupplier
                    ? `/suppliers/${editingSupplier._id}`
                    : "/suppliers";

            const result =
                await apiRequest(
                    endpoint,
                    {
                        method:
                            editingSupplier
                                ? "PUT"
                                : "POST",

                        body:
                            JSON.stringify(
                                payload
                            ),
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to save supplier."
                );
            }

            setShowSupplierModal(
                false
            );

            resetForm();

            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       VIEW SUPPLIER
    ===================================================== */

    const viewSupplier = async (
        supplier
    ) => {
        try {
            setActionLoading(
                `view-${supplier._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/suppliers/${supplier._id}`
                );

            setSelectedSupplier(
                result?.data ||
                    supplier
            );

            setShowDetailsModal(
                true
            );
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       STATUS
    ===================================================== */

    const toggleStatus = async (
        supplier
    ) => {
        const nextStatus =
            supplier.isActive ===
            false;

        const actionText = nextStatus
            ? "activate"
            : "deactivate";

        if (
            !window.confirm(
                `Are you sure you want to ${actionText} ${supplier.companyName}?`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `status-${supplier._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/suppliers/${supplier._id}/status`,
                    {
                        method: "PATCH",

                        body:
                            JSON.stringify({
                                isActive:
                                    nextStatus,
                            }),
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to update supplier status."
                );
            }

            await loadSuppliers();
        } catch (requestError) {
            setError(
                requestError.message
            );
        } finally {
            setActionLoading("");
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const deleteSupplier = async (
        supplier
    ) => {
        if (
            !window.confirm(
                `Delete ${supplier.companyName}? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setActionLoading(
                `delete-${supplier._id}`
            );

            setError("");

            const result =
                await apiRequest(
                    `/suppliers/${supplier._id}`,
                    {
                        method: "DELETE",
                    }
                );

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Unable to delete supplier."
                );
            }

            await loadSuppliers();
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
        <div className="suppliers-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="suppliers-header">

                <div>
                    <span className="suppliers-eyebrow">
                        <Building2
                            size={14}
                        />
                        SUPPLIER MANAGEMENT
                    </span>

                    <h1>
                        Suppliers
                    </h1>

                    <p>
                        Manage supplier
                        relationships,
                        contact details and
                        supplier status.
                    </p>
                </div>

                <div className="suppliers-header-actions">

                    <button
                        type="button"
                        className="supplier-secondary-button"
                        onClick={
                            loadSuppliers
                        }
                        disabled={
                            loading
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "supplier-spinning"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        className="supplier-primary-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus size={17} />

                        New Supplier
                    </button>

                </div>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="supplier-error">

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
                    >
                        <X size={16} />
                    </button>

                </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <section className="supplier-stats">

                {stats.map(
                    ({
                        label,
                        value,
                        icon: Icon,
                        tone,
                    }) => (
                        <div
                            className="supplier-stat-card"
                            key={label}
                        >

                            <div
                                className={`supplier-stat-icon ${tone}`}
                            >
                                <Icon
                                    size={19}
                                />
                            </div>

                            <div className="supplier-stat-content">

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
                MAIN CARD
            ================================================= */}

            <section className="suppliers-card">

                <header className="suppliers-card-header">

                    <div>
                        <h2>
                            Supplier Directory
                        </h2>

                        <p>
                            View, manage and
                            update your
                            pharmacy
                            suppliers.
                        </p>
                    </div>

                    <div className="supplier-count">
                        <Users size={15} />

                        {filteredSuppliers.length}
                    </div>

                </header>

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="suppliers-toolbar">

                    <div className="supplier-search">

                        <Search size={17} />

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
                            placeholder="Search company, contact, email..."
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
                                <X size={15} />
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
                        ariaLabel="Filter suppliers by status"
                        options={[
                            {
                                value: "ALL",
                                label: "All suppliers",
                            },
                            {
                                value: "ACTIVE",
                                label: "Active",
                            },
                            {
                                value: "INACTIVE",
                                label: "Inactive",
                            },
                        ]}
                    />

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="suppliers-table-wrap">

                    <table className="suppliers-table">

                        <thead>
                            <tr>

                                <th>
                                    Supplier
                                </th>

                                <th>
                                    Contact Person
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                    Tax Number
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Added
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
                                        <div className="supplier-state">

                                            <Loader2
                                                size={26}
                                                className="supplier-spinning"
                                            />

                                            <strong>
                                                Loading suppliers...
                                            </strong>

                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSuppliers.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                    >
                                        <div className="supplier-state">

                                            <Building2
                                                size={30}
                                            />

                                            <strong>
                                                No suppliers found
                                            </strong>

                                            <span>
                                                Try changing your search or filters.
                                            </span>

                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map(
                                    (
                                        supplier
                                    ) => {

                                        const isActive =
                                            supplier.isActive !==
                                            false;

                                        const busy =
                                            actionLoading.includes(
                                                supplier._id
                                            );

                                        return (
                                            <tr
                                                key={
                                                    supplier._id
                                                }
                                            >

                                                <td>

                                                    <div className="supplier-company">

                                                        <div className="supplier-avatar">
                                                            {
                                                                getInitials(
                                                                    supplier.companyName
                                                                )
                                                            }
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    supplier.companyName
                                                                }
                                                            </strong>

                                                            <small>
                                                                {supplier.email ||
                                                                    "No email provided"}
                                                            </small>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="supplier-contact-person">

                                                        <User
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        <span>
                                                            {
                                                                supplier.contactPerson ||
                                                                    "—"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="supplier-contact-details">

                                                        {supplier.phone && (
                                                            <span>
                                                                <Phone
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    supplier.phone
                                                                }
                                                            </span>
                                                        )}

                                                        {supplier.email && (
                                                            <span>
                                                                <Mail
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                {
                                                                    supplier.email
                                                                }
                                                            </span>
                                                        )}

                                                        {!supplier.phone &&
                                                            !supplier.email && (
                                                                <span className="muted">
                                                                    No contact info
                                                                </span>
                                                            )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="supplier-tax">
                                                        {supplier.taxNumber ||
                                                            "—"}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`supplier-status ${
                                                            isActive
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        <span className="supplier-status-dot" />

                                                        {isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="supplier-date">

                                                        <FileText
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {formatDate(
                                                            supplier.createdAt
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="supplier-actions">

                                                        <button
                                                            type="button"
                                                            className="supplier-action view"
                                                            title="View supplier"
                                                            onClick={() =>
                                                                viewSupplier(
                                                                    supplier
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `view-${supplier._id}` ? (
                                                                <Loader2
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="supplier-spinning"
                                                                />
                                                            ) : (
                                                                <Eye
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="supplier-action edit"
                                                            title="Edit supplier"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    supplier
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            <Edit3
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`supplier-action ${
                                                                isActive
                                                                    ? "deactivate"
                                                                    : "activate"
                                                            }`}
                                                            title={
                                                                isActive
                                                                    ? "Deactivate supplier"
                                                                    : "Activate supplier"
                                                            }
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    supplier
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `status-${supplier._id}` ? (
                                                                <Loader2
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="supplier-spinning"
                                                                />
                                                            ) : isActive ? (
                                                                <CircleX
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            ) : (
                                                                <CircleCheck
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="supplier-action delete"
                                                            title="Delete supplier"
                                                            onClick={() =>
                                                                deleteSupplier(
                                                                    supplier
                                                                )
                                                            }
                                                            disabled={
                                                                busy
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            `delete-${supplier._id}` ? (
                                                                <Loader2
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="supplier-spinning"
                                                                />
                                                            ) : (
                                                                <Trash2
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}
                                                        </button>

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
                CREATE / EDIT MODAL
            ================================================= */}

            {showSupplierModal && (
                <div
                    className="supplier-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeSupplierModal();
                        }
                    }}
                >

                    <div
                        className="supplier-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <header className="supplier-modal-header">

                            <div>

                                <span className="suppliers-eyebrow">
                                    {editingSupplier
                                        ? "SUPPLIER MANAGEMENT"
                                        : "NEW SUPPLIER"}
                                </span>

                                <h2>
                                    {editingSupplier
                                        ? "Edit Supplier"
                                        : "Add Supplier"}
                                </h2>

                                <p>
                                    {editingSupplier
                                        ? "Update the supplier's information below."
                                        : "Add a supplier to your pharmacy directory."}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="supplier-modal-close"
                                onClick={
                                    closeSupplierModal
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={19} />
                            </button>

                        </header>

                        <form
                            className="supplier-form"
                            onSubmit={
                                saveSupplier
                            }
                        >

                            <div className="supplier-form-section">

                                <div className="supplier-section-title">
                                    <Building2
                                        size={
                                            17
                                        }
                                    />

                                    <div>
                                        <strong>
                                            Company Information
                                        </strong>

                                        <span>
                                            Basic supplier details
                                        </span>
                                    </div>
                                </div>

                                <div className="supplier-form-grid">

                                    <label className="supplier-field full">

                                        <span>
                                            Company Name
                                            <b>*</b>
                                        </span>

                                        <div className="supplier-input-wrap">

                                            <Building2
                                                size={
                                                    16
                                                }
                                            />

                                            <input
                                                name="companyName"
                                                value={
                                                    supplierForm.companyName
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="e.g. MedSupply PLC"
                                                disabled={
                                                    saving
                                                }
                                                autoFocus
                                            />

                                        </div>

                                    </label>

                                    <label className="supplier-field">

                                        <span>
                                            Contact Person
                                        </span>

                                        <div className="supplier-input-wrap">

                                            <User
                                                size={
                                                    16
                                                }
                                            />

                                            <input
                                                name="contactPerson"
                                                value={
                                                    supplierForm.contactPerson
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Full name"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                    <label className="supplier-field">

                                        <span>
                                            Tax Number
                                        </span>

                                        <div className="supplier-input-wrap">

                                            <FileText
                                                size={
                                                    16
                                                }
                                            />

                                            <input
                                                name="taxNumber"
                                                value={
                                                    supplierForm.taxNumber
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Tax identification number"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                </div>

                            </div>

                            <div className="supplier-form-section">

                                <div className="supplier-section-title">

                                    <Phone
                                        size={
                                            17
                                        }
                                    />

                                    <div>
                                        <strong>
                                            Contact Information
                                        </strong>

                                        <span>
                                            How your team can reach the supplier
                                        </span>
                                    </div>

                                </div>

                                <div className="supplier-form-grid">

                                    <label className="supplier-field">

                                        <span>
                                            Phone
                                        </span>

                                        <div className="supplier-input-wrap">

                                            <Phone
                                                size={
                                                    16
                                                }
                                            />

                                            <input
                                                name="phone"
                                                value={
                                                    supplierForm.phone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="+251 ..."
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                    <label className="supplier-field">

                                        <span>
                                            Email
                                        </span>

                                        <div className="supplier-input-wrap">

                                            <Mail
                                                size={
                                                    16
                                                }
                                            />

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    supplierForm.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="supplier@example.com"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                    <label className="supplier-field full">

                                        <span>
                                            Address
                                        </span>

                                        <div className="supplier-input-wrap textarea-wrap">

                                            <MapPin
                                                size={
                                                    16
                                                }
                                            />

                                            <textarea
                                                name="address"
                                                value={
                                                    supplierForm.address
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows="3"
                                                placeholder="Supplier address..."
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                </div>

                            </div>

                            <footer className="supplier-modal-footer">

                                <button
                                    type="button"
                                    className="supplier-secondary-button"
                                    onClick={
                                        closeSupplierModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="supplier-primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={
                                                    17
                                                }
                                                className="supplier-spinning"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check
                                                size={
                                                    17
                                                }
                                            />

                                            {editingSupplier
                                                ? "Save Changes"
                                                : "Create Supplier"}
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
                selectedSupplier && (
                    <div
                        className="supplier-backdrop"
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
                            className="supplier-details-modal"
                            role="dialog"
                            aria-modal="true"
                        >

                            <header className="supplier-modal-header">

                                <div>

                                    <span className="suppliers-eyebrow">
                                        SUPPLIER PROFILE
                                    </span>

                                    <h2>
                                        {
                                            selectedSupplier.companyName
                                        }
                                    </h2>

                                    <p>
                                        Added{" "}
                                        {formatDate(
                                            selectedSupplier.createdAt
                                        )}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="supplier-modal-close"
                                    onClick={() =>
                                        setShowDetailsModal(
                                            false
                                        )
                                    }
                                >
                                    <X size={19} />
                                </button>

                            </header>

                            <div className="supplier-details-content">

                                <div className="supplier-profile-top">

                                    <div className="supplier-profile-avatar">
                                        {getInitials(
                                            selectedSupplier.companyName
                                        )}
                                    </div>

                                    <div>

                                        <h3>
                                            {
                                                selectedSupplier.companyName
                                            }
                                        </h3>

                                        <span
                                            className={`supplier-status ${
                                                selectedSupplier.isActive !==
                                                false
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            <span className="supplier-status-dot" />

                                            {selectedSupplier.isActive !==
                                            false
                                                ? "Active supplier"
                                                : "Inactive supplier"}
                                        </span>

                                    </div>

                                </div>

                                <div className="supplier-details-grid">

                                    <div>
                                        <span>
                                            Contact Person
                                        </span>

                                        <strong>
                                            {selectedSupplier.contactPerson ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Tax Number
                                        </span>

                                        <strong>
                                            {selectedSupplier.taxNumber ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Phone
                                        </span>

                                        <strong>
                                            {selectedSupplier.phone ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {selectedSupplier.email ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="full">
                                        <span>
                                            Address
                                        </span>

                                        <strong>
                                            {selectedSupplier.address ||
                                                "—"}
                                        </strong>
                                    </div>

                                </div>

                                <div className="supplier-details-footer">

                                    <button
                                        type="button"
                                        className="supplier-secondary-button"
                                        onClick={() => {
                                            setShowDetailsModal(
                                                false
                                            );

                                            openEditModal(
                                                selectedSupplier
                                            );
                                        }}
                                    >
                                        <Edit3
                                            size={
                                                16
                                            }
                                        />

                                        Edit Supplier
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default SuppliersPage;