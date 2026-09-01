import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    Check,
    ChevronDown,
    Edit3,
    Mail,
    MapPin,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    User,
    Users,
    X,
    UserRoundPlus,
    UserRoundCheck,
    UserRoundX,
    Loader2,
} from "lucide-react";

import "./CustomersPage.css";


/* =========================================================
   API
========================================================= */

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


const apiRequest = async (
    endpoint,
    options = {}
) => {

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");


    const response =
        await fetch(
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
        data =
            await response.json();
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
   EMPTY FORM
========================================================= */

const emptyCustomer = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    isActive: true,
};


/* =========================================================
   HELPERS
========================================================= */

const getCustomerName = (
    customer
) => {

    if (!customer) {
        return "Unknown Customer";
    }


    const firstName =
        customer.firstName || "";

    const lastName =
        customer.lastName || "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    return (
        fullName ||
        customer.name ||
        "Customer"
    );
};


const getInitials = (
    customer
) => {

    const first =
        customer?.firstName
            ?.charAt(0)
            ?.toUpperCase() || "";

    const last =
        customer?.lastName
            ?.charAt(0)
            ?.toUpperCase() || "";


    if (first || last) {
        return `${first}${last}`;
    }


    return "CU";
};


/* =========================================================
   CUSTOM DROPDOWN
========================================================= */

const CustomDropdown = ({
    value,
    options,
    onChange,
    placeholder = "Select",
    className = "",
}) => {

    const [open, setOpen] =
        useState(false);

    const dropdownRef =
        useRef(null);


    useEffect(() => {

        const handleOutside =
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


        const handleEscape =
            (event) => {

                if (
                    event.key ===
                    "Escape"
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


    return (
        <div
            ref={dropdownRef}
            className={`customer-dropdown ${className} ${
                open ? "is-open" : ""
            }`}
        >

            <button
                type="button"
                className="customer-dropdown-trigger"
                onClick={() =>
                    setOpen(
                        (current) =>
                            !current
                    )
                }
                aria-haspopup="listbox"
                aria-expanded={open}
            >

                <span>
                    {selected?.label ||
                        placeholder}
                </span>

                <ChevronDown
                    size={16}
                    className="customer-dropdown-chevron"
                />

            </button>


            {open && (
                <div
                    className="customer-dropdown-menu"
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
                                    className={`customer-dropdown-option ${
                                        active
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {

                                        onChange(
                                            option.value
                                        );

                                        setOpen(
                                            false
                                        );

                                    }}
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
   CUSTOMERS PAGE
========================================================= */

const CustomersPage = () => {

    const [
        customers,
        setCustomers,
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
        deleting,
        setDeleting,
    ] = useState("");


    const [
        search,
        setSearch,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");


    const [
        showModal,
        setShowModal,
    ] = useState(false);


    const [
        editingCustomer,
        setEditingCustomer,
    ] = useState(null);


    const [
        customerToDelete,
        setCustomerToDelete,
    ] = useState(null);


    const [
        form,
        setForm,
    ] = useState(
        emptyCustomer
    );


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    /* =====================================================
       LOAD CUSTOMERS
    ===================================================== */

    const loadCustomers =
        async () => {

            try {

                setLoading(true);

                setError("");

                const result =
                    await apiRequest(
                        "/customers"
                    );


                setCustomers(
                    result?.data || []
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


    useEffect(() => {

        loadCustomers();

    }, []);


    /* =====================================================
       CLEAR MESSAGES
    ===================================================== */

    useEffect(() => {

        if (!success) {
            return;
        }


        const timer =
            setTimeout(
                () =>
                    setSuccess(""),
                3500
            );


        return () =>
            clearTimeout(timer);

    }, [success]);


    /* =====================================================
       ESCAPE
    ===================================================== */

    useEffect(() => {

        const handleEscape =
            (event) => {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }


                if (saving) {
                    return;
                }


                setShowModal(false);

                setCustomerToDelete(
                    null
                );

            };


        window.addEventListener(
            "keydown",
            handleEscape
        );


        return () =>
            window.removeEventListener(
                "keydown",
                handleEscape
            );

    }, [saving]);


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredCustomers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return customers.filter(
                (customer) => {

                    const name =
                        getCustomerName(
                            customer
                        ).toLowerCase();


                    const phone =
                        String(
                            customer.phone ||
                                ""
                        ).toLowerCase();


                    const email =
                        String(
                            customer.email ||
                                ""
                        ).toLowerCase();


                    const matchesSearch =
                        !query ||
                        name.includes(
                            query
                        ) ||
                        phone.includes(
                            query
                        ) ||
                        email.includes(
                            query
                        );


                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        (
                            statusFilter ===
                                "ACTIVE" &&
                            customer.isActive
                        ) ||
                        (
                            statusFilter ===
                                "INACTIVE" &&
                            !customer.isActive
                        );


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            customers,
            search,
            statusFilter,
        ]);


    /* =====================================================
       STATISTICS
    ===================================================== */

    const statistics =
        useMemo(() => {

            const active =
                customers.filter(
                    (customer) =>
                        customer.isActive
                ).length;


            const inactive =
                customers.length -
                active;


            return {
                total:
                    customers.length,
                active,
                inactive,
            };

        }, [customers]);


    /* =====================================================
       FORM
    ===================================================== */

    const updateForm =
        (field, value) => {

            setForm(
                (previous) => ({
                    ...previous,
                    [field]: value,
                })
            );

        };


    const openCreateModal =
        () => {

            setEditingCustomer(
                null
            );

            setForm({
                ...emptyCustomer,
            });

            setError("");

            setShowModal(true);

        };


    const openEditModal =
        (customer) => {

            setEditingCustomer(
                customer
            );


            setForm({
                firstName:
                    customer.firstName ||
                    "",

                lastName:
                    customer.lastName ||
                    "",

                phone:
                    customer.phone ||
                    "",

                email:
                    customer.email ||
                    "",

                address:
                    customer.address ||
                    "",

                isActive:
                    customer.isActive !==
                    false,
            });


            setError("");

            setShowModal(true);

        };


    const closeModal =
        () => {

            if (saving) {
                return;
            }


            setShowModal(false);

            setEditingCustomer(
                null
            );

            setForm({
                ...emptyCustomer,
            });

        };


    /* =====================================================
       SAVE CUSTOMER
    ===================================================== */

    const saveCustomer =
        async (event) => {

            event.preventDefault();


            if (
                !form.firstName.trim()
            ) {

                setError(
                    "First name is required."
                );

                return;

            }


            if (
                !form.lastName.trim()
            ) {

                setError(
                    "Last name is required."
                );

                return;

            }


            if (
                !form.phone.trim()
            ) {

                setError(
                    "Phone number is required."
                );

                return;

            }


            try {

                setSaving(true);

                setError("");


                if (editingCustomer) {

                    await apiRequest(
                        `/customers/${editingCustomer._id}`,
                        {
                            method: "PUT",

                            body:
                                JSON.stringify(
                                    form
                                ),
                        }
                    );


                    setSuccess(
                        "Customer updated successfully."
                    );

                } else {

                    await apiRequest(
                        "/customers",
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    form
                                ),
                        }
                    );


                    setSuccess(
                        "Customer created successfully."
                    );

                }


                closeModal();

                await loadCustomers();

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
       DELETE
    ===================================================== */

    const deleteCustomer =
        async () => {

            if (
                !customerToDelete
            ) {
                return;
            }


            try {

                setDeleting(
                    customerToDelete._id
                );

                setError("");


                await apiRequest(
                    `/customers/${customerToDelete._id}`,
                    {
                        method: "DELETE",
                    }
                );


                setCustomerToDelete(
                    null
                );


                setSuccess(
                    "Customer deleted successfully."
                );


                await loadCustomers();

            } catch (
                requestError
            ) {

                setError(
                    requestError.message
                );

            } finally {

                setDeleting("");

            }

        };


    return (
        <div className="customers-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="customers-header">

                <div className="customers-header-copy">

                    <span className="customers-eyebrow">

                        <Users size={14} />

                        CUSTOMER MANAGEMENT

                    </span>


                    <h1>
                        Customers
                    </h1>


                    <p>
                        Manage your pharmacy
                        customers, contact
                        information and account
                        status.
                    </p>

                </div>


                <div className="customers-header-actions">

                    <button
                        type="button"
                        className="customers-refresh-button"
                        onClick={
                            loadCustomers
                        }
                        disabled={
                            loading
                        }
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "customers-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>


                    <button
                        type="button"
                        className="customers-primary-button"
                        onClick={
                            openCreateModal
                        }
                    >

                        <Plus size={17} />

                        New Customer

                    </button>

                </div>

            </section>


            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
                <div className="customers-alert error">

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


            {success && (
                <div className="customers-alert success">

                    <Check size={18} />

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="customers-stats">

                <div className="customers-stat-card">

                    <div className="customers-stat-icon total">
                        <Users size={19} />
                    </div>

                    <div>
                        <span>
                            Total Customers
                        </span>

                        <strong>
                            {
                                statistics.total
                            }
                        </strong>

                        <small>
                            Registered customers
                        </small>
                    </div>

                </div>


                <div className="customers-stat-card">

                    <div className="customers-stat-icon active">
                        <UserRoundCheck
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            Active Customers
                        </span>

                        <strong>
                            {
                                statistics.active
                            }
                        </strong>

                        <small>
                            Currently active
                        </small>
                    </div>

                </div>


                <div className="customers-stat-card">

                    <div className="customers-stat-icon inactive">
                        <UserRoundX
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            Inactive Customers
                        </span>

                        <strong>
                            {
                                statistics.inactive
                            }
                        </strong>

                        <small>
                            Currently inactive
                        </small>
                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <section className="customers-card">

                <header className="customers-card-header">

                    <div>

                        <div className="customers-card-title">

                            <div className="customers-card-title-icon">
                                <Users
                                    size={17}
                                />
                            </div>

                            <div>

                                <h2>
                                    All Customers
                                </h2>

                                <p>
                                    View and manage
                                    your pharmacy
                                    customers.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="customers-result-count">

                        <strong>
                            {
                                filteredCustomers.length
                            }
                        </strong>

                        <span>
                            results
                        </span>

                    </div>

                </header>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="customers-toolbar">

                    <div className="customers-search">

                        <Search
                            size={17}
                        />

                        <input
                            type="search"
                            placeholder="Search by name, phone or email..."
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
                        options={[
                            {
                                value:
                                    "ALL",
                                label:
                                    "All Customers",
                            },
                            {
                                value:
                                    "ACTIVE",
                                label:
                                    "Active",
                            },
                            {
                                value:
                                    "INACTIVE",
                                label:
                                    "Inactive",
                            },
                        ]}
                    />

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="customers-table-wrap">

                    <table className="customers-table">

                        <thead>

                            <tr>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                    Address
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

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                    >

                                        <div className="customers-state">

                                            <Loader2
                                                size={28}
                                                className="customers-spin"
                                            />

                                            <strong>
                                                Loading customers...
                                            </strong>

                                            <span>
                                                Please wait while
                                                we load your
                                                customer records.
                                            </span>

                                        </div>

                                    </td>

                                </tr>

                            ) : filteredCustomers.length ===
                              0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                    >

                                        <div className="customers-state">

                                            <div className="customers-empty-icon">
                                                <User
                                                    size={27}
                                                />
                                            </div>

                                            <strong>
                                                No customers found
                                            </strong>

                                            <span>
                                                Try changing your
                                                search or filter,
                                                or create a new
                                                customer.
                                            </span>


                                            {!search &&
                                                statusFilter ===
                                                    "ALL" && (
                                                    <button
                                                        type="button"
                                                        className="customers-empty-button"
                                                        onClick={
                                                            openCreateModal
                                                        }
                                                    >
                                                        <Plus
                                                            size={
                                                                15
                                                            }
                                                        />
                                                        Add Customer
                                                    </button>
                                                )}

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredCustomers.map(
                                    (
                                        customer
                                    ) => (

                                        <tr
                                            key={
                                                customer._id
                                            }
                                        >

                                            {/* CUSTOMER */}

                                            <td>

                                                <div className="customer-person">

                                                    <div className="customer-avatar">
                                                        {
                                                            getInitials(
                                                                customer
                                                            )
                                                        }
                                                    </div>


                                                    <div className="customer-person-info">

                                                        <strong>
                                                            {
                                                                getCustomerName(
                                                                    customer
                                                                )
                                                            }
                                                        </strong>

                                                        <span>
                                                            Customer
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* CONTACT */}

                                            <td>

                                                <div className="customer-contact">

                                                    {customer.phone && (
                                                        <div>

                                                            <Phone
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    customer.phone
                                                                }
                                                            </span>

                                                        </div>
                                                    )}


                                                    {customer.email && (
                                                        <div>

                                                            <Mail
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    customer.email
                                                                }
                                                            </span>

                                                        </div>
                                                    )}


                                                    {!customer.phone &&
                                                        !customer.email && (
                                                            <span className="customer-muted">
                                                                No contact
                                                                information
                                                            </span>
                                                        )}

                                                </div>

                                            </td>


                                            {/* ADDRESS */}

                                            <td>

                                                <div className="customer-address">

                                                    <MapPin
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    <span>
                                                        {
                                                            customer.address ||
                                                            "No address provided"
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`customer-status ${
                                                        customer.isActive
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >

                                                    <span className="customer-status-dot" />

                                                    {
                                                        customer.isActive
                                                            ? "ACTIVE"
                                                            : "INACTIVE"
                                                    }

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="customer-actions">

                                                    <button
                                                        type="button"
                                                        className="customer-action edit"
                                                        title="Edit customer"
                                                        onClick={() =>
                                                            openEditModal(
                                                                customer
                                                            )
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
                                                        className="customer-action delete"
                                                        title="Delete customer"
                                                        onClick={() =>
                                                            setCustomerToDelete(
                                                                customer
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={
                                                                15
                                                            }
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =================================================
                CREATE / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="customers-modal-backdrop"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div
                        className="customers-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        {/* MODAL HEADER */}

                        <header className="customers-modal-header">

                            <div className="customers-modal-heading">

                                <div className="customers-modal-icon">

                                    {editingCustomer ? (
                                        <Edit3
                                            size={19}
                                        />
                                    ) : (
                                        <UserRoundPlus
                                            size={19}
                                        />
                                    )}

                                </div>


                                <div>

                                    <span>
                                        {editingCustomer
                                            ? "CUSTOMER PROFILE"
                                            : "NEW CUSTOMER"}
                                    </span>

                                    <h2>
                                        {editingCustomer
                                            ? "Edit Customer"
                                            : "Create Customer"}
                                    </h2>

                                    <p>
                                        {editingCustomer
                                            ? "Update the customer's information below."
                                            : "Add a new customer to your pharmacy records."}
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="customers-modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >

                                <X size={18} />

                            </button>

                        </header>


                        {/* FORM */}

                        <form
                            className="customers-form"
                            onSubmit={
                                saveCustomer
                            }
                        >

                            {/* PERSONAL INFORMATION */}

                            <div className="customers-form-section">

                                <div className="customers-form-section-heading">

                                    <div>
                                        <User
                                            size={
                                                16
                                            }
                                        />
                                    </div>

                                    <span>
                                        Personal Information
                                    </span>

                                </div>


                                <div className="customers-form-grid">

                                    <label className="customers-field">

                                        <span>
                                            First Name
                                            <b>*</b>
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.firstName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "firstName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter first name"
                                            disabled={
                                                saving
                                            }
                                            autoFocus
                                        />

                                    </label>


                                    <label className="customers-field">

                                        <span>
                                            Last Name
                                            <b>*</b>
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                form.lastName
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateForm(
                                                    "lastName",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Enter last name"
                                            disabled={
                                                saving
                                            }
                                        />

                                    </label>

                                </div>

                            </div>


                            {/* CONTACT */}

                            <div className="customers-form-section">

                                <div className="customers-form-section-heading">

                                    <div>
                                        <Phone
                                            size={
                                                16
                                            }
                                        />
                                    </div>

                                    <span>
                                        Contact Information
                                    </span>

                                </div>


                                <div className="customers-form-grid">

                                    <label className="customers-field">

                                        <span>
                                            Phone Number
                                            <b>*</b>
                                        </span>

                                        <div className="customers-input-icon">

                                            <Phone
                                                size={
                                                    15
                                                }
                                            />

                                            <input
                                                type="tel"
                                                value={
                                                    form.phone
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateForm(
                                                        "phone",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="e.g. 0912345678"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>


                                    <label className="customers-field">

                                        <span>
                                            Email Address
                                        </span>

                                        <div className="customers-input-icon">

                                            <Mail
                                                size={
                                                    15
                                                }
                                            />

                                            <input
                                                type="email"
                                                value={
                                                    form.email
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateForm(
                                                        "email",
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="customer@email.com"
                                                disabled={
                                                    saving
                                                }
                                            />

                                        </div>

                                    </label>

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div className="customers-form-section">

                                <div className="customers-form-section-heading">

                                    <div>
                                        <MapPin
                                            size={
                                                16
                                            }
                                        />
                                    </div>

                                    <span>
                                        Address
                                    </span>

                                </div>


                                <label className="customers-field">

                                    <span>
                                        Customer Address
                                    </span>

                                    <textarea
                                        value={
                                            form.address
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateForm(
                                                "address",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Enter customer address..."
                                        rows="3"
                                        disabled={
                                            saving
                                        }
                                    />

                                </label>

                            </div>


                            {/* STATUS */}

                            <div className="customers-form-section">

                                <div className="customers-form-section-heading">

                                    <div>
                                        <UserRoundCheck
                                            size={
                                                16
                                            }
                                        />
                                    </div>

                                    <span>
                                        Account Status
                                    </span>

                                </div>


                                <label className="customers-field">

                                    <span>
                                        Status
                                    </span>

                                    <CustomDropdown
                                        value={
                                            form.isActive
                                                ? "ACTIVE"
                                                : "INACTIVE"
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            updateForm(
                                                "isActive",
                                                value ===
                                                    "ACTIVE"
                                            )
                                        }
                                        options={[
                                            {
                                                value:
                                                    "ACTIVE",
                                                label:
                                                    "Active",
                                            },
                                            {
                                                value:
                                                    "INACTIVE",
                                                label:
                                                    "Inactive",
                                            },
                                        ]}
                                    />

                                </label>

                            </div>


                            {/* FOOTER */}

                            <footer className="customers-modal-footer">

                                <button
                                    type="button"
                                    className="customers-cancel-button"
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
                                    className="customers-save-button"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={
                                                    16
                                                }
                                                className="customers-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check
                                                size={
                                                    16
                                                }
                                            />

                                            {editingCustomer
                                                ? "Save Changes"
                                                : "Create Customer"}
                                        </>
                                    )}

                                </button>

                            </footer>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {customerToDelete && (

                <div
                    className="customers-modal-backdrop delete-backdrop"
                    onMouseDown={(
                        event
                    ) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setCustomerToDelete(
                                null
                            );
                        }

                    }}
                >

                    <div
                        className="customers-delete-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="customers-delete-icon">

                            <Trash2
                                size={22}
                            />

                        </div>


                        <h2>
                            Delete Customer?
                        </h2>


                        <p>
                            You're about to delete{" "}
                            <strong>
                                {
                                    getCustomerName(
                                        customerToDelete
                                    )
                                }
                            </strong>
                            . This action cannot
                            be undone.
                        </p>


                        <div className="customers-delete-actions">

                            <button
                                type="button"
                                className="customers-cancel-button"
                                onClick={() =>
                                    setCustomerToDelete(
                                        null
                                    )
                                }
                                disabled={
                                    Boolean(
                                        deleting
                                    )
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="customers-delete-confirm"
                                onClick={
                                    deleteCustomer
                                }
                                disabled={
                                    Boolean(
                                        deleting
                                    )
                                }
                            >

                                {deleting ? (
                                    <>
                                        <Loader2
                                            size={
                                                16
                                            }
                                            className="customers-spin"
                                        />

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={
                                                16
                                            }
                                        />

                                        Delete Customer
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


export default CustomersPage;