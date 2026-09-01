import {
    useEffect,
    useState,
} from "react";

import {
    X,
    Save,
    Package,
} from "lucide-react";

import {
    createProduct,
    updateProduct,
    getCategories,
    getBrands,
    getManufacturers,
    getSuppliers,
    getUnits,
} from "../services/productService";

import "./ProductForm.css";


const initialForm = {

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


const ProductForm = ({
    product,
    onSuccess,
    onClose,
}) => {

    const [form, setForm] =
        useState(initialForm);

    const [categories, setCategories] =
        useState([]);

    const [brands, setBrands] =
        useState([]);

    const [manufacturers, setManufacturers] =
        useState([]);

    const [suppliers, setSuppliers] =
        useState([]);

    const [units, setUnits] =
        useState([]);


    const [loading, setLoading] =
        useState(false);

    const [optionsLoading, setOptionsLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ================================
    // LOAD FORM OPTIONS
    // ================================

    useEffect(() => {

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

                    getCategories(),
                    getBrands(),
                    getManufacturers(),
                    getSuppliers(),
                    getUnits(),

                ]);


                setCategories(
                    categoryResponse.data || []
                );

                setBrands(
                    brandResponse.data || []
                );

                setManufacturers(
                    manufacturerResponse.data || []
                );

                setSuppliers(
                    supplierResponse.data || []
                );

                setUnits(
                    unitResponse.data || []
                );


            } catch (err) {

                console.error(err);

                setError(
                    "Unable to load product options."
                );

            } finally {

                setOptionsLoading(false);

            }

        };


        loadOptions();

    }, []);


    // ================================
    // EDIT MODE
    // ================================

    useEffect(() => {

        if (!product) {

            setForm(initialForm);

            return;

        }


        setForm({

            name: product.name || "",

            genericName:
                product.genericName || "",

            barcode:
                product.barcode || "",


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

            expiryDate:
                product.expiryDate
                    ? product.expiryDate.slice(0, 10)
                    : "",

            description:
                product.description || "",

        });

    }, [product]);


    // ================================
    // HANDLE CHANGE
    // ================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value,

        }));

    };


    // ================================
    // SUBMIT
    // ================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (!form.name.trim()) {

            setError(
                "Product name is required."
            );

            return;

        }


        if (!form.category) {

            setError(
                "Please select a category."
            );

            return;

        }


        if (!form.unit) {

            setError(
                "Please select a unit."
            );

            return;

        }


        if (
            form.purchasePrice === "" ||
            form.sellingPrice === ""
        ) {

            setError(
                "Purchase and selling prices are required."
            );

            return;

        }


        const payload = {

            name: form.name.trim(),

            genericName:
                form.genericName.trim(),

            barcode:
                form.barcode.trim() || undefined,


            // IMPORTANT:
            // These are MongoDB IDs.
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


        try {

            setLoading(true);


            let response;


            if (product?._id) {

                response =
                    await updateProduct(
                        product._id,
                        payload
                    );

            } else {

                response =
                    await createProduct(
                        payload
                    );

            }


            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Unable to save product."
                );

            }


            onSuccess(response.data);


        } catch (err) {

            console.error(err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.[0]?.msg ||
                err.message ||
                "Unable to save product.";

            setError(message);

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="product-form-overlay">

            <div className="product-form-modal">


                {/* HEADER */}

                <div className="product-form-header">

                    <div className="product-form-title">

                        <div className="product-form-title-icon">

                            <Package size={21} />

                        </div>

                        <div>

                            <h2>
                                {product
                                    ? "Edit Product"
                                    : "Add Product"}
                            </h2>

                            <p>
                                {product
                                    ? "Update product information"
                                    : "Add a new medicine to your inventory"}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="product-form-close"
                        onClick={onClose}
                    >

                        <X size={20} />

                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="product-form-error">

                        {error}

                    </div>

                )}


                {/* FORM */}

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >


                    <div className="form-section">

                        <div className="form-section-title">

                            Basic Information

                        </div>


                        <div className="form-grid">

                            <div className="form-field form-field-full">

                                <label>
                                    Product Name *
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Amoxicillin 500mg"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Generic Name
                                </label>

                                <input
                                    name="genericName"
                                    value={form.genericName}
                                    onChange={handleChange}
                                    placeholder="e.g. Amoxicillin"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Barcode
                                </label>

                                <input
                                    name="barcode"
                                    value={form.barcode}
                                    onChange={handleChange}
                                    placeholder="Enter barcode"
                                />

                            </div>

                        </div>

                    </div>


                    {/* CLASSIFICATION */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Product Classification

                        </div>


                        <div className="form-grid">


                            <div className="form-field">

                                <label>
                                    Category *
                                </label>

                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (item) => (

                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Brand
                                </label>

                                <select
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                >

                                    <option value="">
                                        Select brand
                                    </option>

                                    {brands.map(
                                        (item) => (

                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Manufacturer
                                </label>

                                <select
                                    name="manufacturer"
                                    value={form.manufacturer}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                >

                                    <option value="">
                                        Select manufacturer
                                    </option>

                                    {manufacturers.map(
                                        (item) => (

                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Supplier
                                </label>

                                <select
                                    name="supplier"
                                    value={form.supplier}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                >

                                    <option value="">
                                        Select supplier
                                    </option>

                                    {suppliers.map(
                                        (item) => (

                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.companyName ||
                                                    item.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div className="form-field">

                                <label>
                                    Unit *
                                </label>

                                <select
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    disabled={optionsLoading}
                                >

                                    <option value="">
                                        Select unit
                                    </option>

                                    {units.map(
                                        (item) => (

                                            <option
                                                key={item._id}
                                                value={item._id}
                                            >
                                                {item.name}
                                                {item.shortName
                                                    ? ` (${item.shortName})`
                                                    : ""}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* PRICING */}

                    <div className="form-section">

                        <div className="form-section-title">

                            Pricing & Inventory

                        </div>


                        <div className="form-grid">


                            <div className="form-field">

                                <label>
                                    Purchase Price *
                                </label>

                                <div className="input-with-prefix">

                                    <span>
                                        ETB
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="purchasePrice"
                                        value={form.purchasePrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />

                                </div>

                            </div>


                            <div className="form-field">

                                <label>
                                    Selling Price *
                                </label>

                                <div className="input-with-prefix">

                                    <span>
                                        ETB
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="sellingPrice"
                                        value={form.sellingPrice}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />

                                </div>

                            </div>


                            <div className="form-field">

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Reorder Level
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    name="reorderLevel"
                                    value={form.reorderLevel}
                                    onChange={handleChange}
                                    placeholder="10"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Batch Number
                                </label>

                                <input
                                    name="batchNumber"
                                    value={form.batchNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. BTH-2026-001"
                                />

                            </div>


                            <div className="form-field">

                                <label>
                                    Expiry Date
                                </label>

                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={form.expiryDate}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-section">

                        <div className="form-field">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Add additional product information..."
                            />

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="product-form-footer">

                        <button
                            type="button"
                            className="product-form-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="product-form-submit"
                            disabled={
                                loading ||
                                optionsLoading
                            }
                        >

                            <Save size={18} />

                            {loading
                                ? "Saving..."
                                : product
                                    ? "Save Changes"
                                    : "Add Product"}

                        </button>

                    </div>


                </form>

            </div>

        </div>

    );

};


export default ProductForm;