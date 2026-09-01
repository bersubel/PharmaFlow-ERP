import {
    useEffect,
    useState,
} from "react";

import {
    X,
    Save,
    Package,
} from "lucide-react";

const emptyProduct = {
    productCode: "",
    name: "",
    genericName: "",
    category: "",
    manufacturer: "",
    brand: "",
    unit: "",
    batchNumber: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
    reorderLevel: "",
    expiryDate: "",
};


const ProductModal = ({
    open,
    onClose,
    onSubmit,
    product,
    loading = false,
}) => {

    const [form, setForm] =
        useState(emptyProduct);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (product) {

            setForm({
                productCode:
                    product.productCode || "",

                name:
                    product.name ||
                    product.productName ||
                    "",

                genericName:
                    product.genericName || "",

                category:
                    typeof product.category === "object"
                        ? product.category?._id ||
                          product.category?.id ||
                          product.category?.name ||
                          ""
                        : product.category || "",

                manufacturer:
                    typeof product.manufacturer === "object"
                        ? product.manufacturer?._id ||
                          product.manufacturer?.id ||
                          product.manufacturer?.name ||
                          ""
                        : product.manufacturer || "",

                brand:
                    typeof product.brand === "object"
                        ? product.brand?._id ||
                          product.brand?.id ||
                          product.brand?.name ||
                          ""
                        : product.brand || "",

                unit:
                    typeof product.unit === "object"
                        ? product.unit?._id ||
                          product.unit?.id ||
                          product.unit?.name ||
                          ""
                        : product.unit || "",

                batchNumber:
                    product.batchNumber || "",

                purchasePrice:
                    product.purchasePrice ??
                    product.costPrice ??
                    "",

                sellingPrice:
                    product.sellingPrice ??
                    product.salePrice ??
                    "",

                quantity:
                    product.quantity ??
                    product.stockQuantity ??
                    "",

                reorderLevel:
                    product.reorderLevel ??
                    product.minimumStock ??
                    product.minStock ??
                    "",

                expiryDate:
                    product.expiryDate
                        ? String(
                              product.expiryDate
                          ).substring(0, 10)
                        : "",
            });

        } else {

            setForm(emptyProduct);

        }

        setError("");

    }, [product, open]);


    if (!open) {
        return null;
    }


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


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (!form.name.trim()) {
            setError("Product name is required.");
            return;
        }


        if (!form.productCode.trim()) {
            setError("Product code is required.");
            return;
        }


        if (!form.sellingPrice) {
            setError("Selling price is required.");
            return;
        }


        try {

            await onSubmit({
                ...form,

                purchasePrice:
                    Number(form.purchasePrice || 0),

                sellingPrice:
                    Number(form.sellingPrice || 0),

                quantity:
                    Number(form.quantity || 0),

                reorderLevel:
                    Number(form.reorderLevel || 0),
            });

        } catch (submitError) {

            setError(
                submitError?.message ||
                "Unable to save product."
            );

        }

    };


    return (
        <div className="product-modal-overlay">

            <div className="product-modal">

                <div className="product-modal-header">

                    <div className="product-modal-title">

                        <div className="product-modal-icon">
                            <Package size={20} />
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
                        className="modal-close-button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    {error && (
                        <div className="product-form-error">
                            {error}
                        </div>
                    )}


                    <div className="form-section">

                        <div className="form-section-title">
                            Basic Information
                        </div>


                        <div className="form-grid">

                            <label>
                                Product Code
                                <input
                                    name="productCode"
                                    value={form.productCode}
                                    onChange={handleChange}
                                    placeholder="e.g. MED-0001"
                                />
                            </label>


                            <label>
                                Product Name
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Paracetamol 500mg"
                                />
                            </label>


                            <label>
                                Generic Name
                                <input
                                    name="genericName"
                                    value={form.genericName}
                                    onChange={handleChange}
                                    placeholder="Generic medicine name"
                                />
                            </label>


                            <label>
                                Category
                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="e.g. Pain Relief"
                                />
                            </label>


                            <label>
                                Manufacturer
                                <input
                                    name="manufacturer"
                                    value={form.manufacturer}
                                    onChange={handleChange}
                                    placeholder="Manufacturer"
                                />
                            </label>


                            <label>
                                Brand
                                <input
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    placeholder="Brand"
                                />
                            </label>

                        </div>

                    </div>


                    <div className="form-section">

                        <div className="form-section-title">
                            Inventory Information
                        </div>


                        <div className="form-grid">

                            <label>
                                Unit
                                <input
                                    name="unit"
                                    value={form.unit}
                                    onChange={handleChange}
                                    placeholder="e.g. Box, Tablet"
                                />
                            </label>


                            <label>
                                Batch Number
                                <input
                                    name="batchNumber"
                                    value={form.batchNumber}
                                    onChange={handleChange}
                                    placeholder="Batch number"
                                />
                            </label>


                            <label>
                                Purchase Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="purchasePrice"
                                    value={form.purchasePrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </label>


                            <label>
                                Selling Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="sellingPrice"
                                    value={form.sellingPrice}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                            </label>


                            <label>
                                Quantity
                                <input
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </label>


                            <label>
                                Reorder Level
                                <input
                                    type="number"
                                    min="0"
                                    name="reorderLevel"
                                    value={form.reorderLevel}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </label>


                            <label>
                                Expiry Date
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={form.expiryDate}
                                    onChange={handleChange}
                                />
                            </label>

                        </div>

                    </div>


                    <div className="product-modal-footer">

                        <button
                            type="button"
                            className="product-secondary-button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="product-primary-button"
                            disabled={loading}
                        >

                            <Save size={17} />

                            {loading
                                ? "Saving..."
                                : product
                                    ? "Update Product"
                                    : "Save Product"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default ProductModal;