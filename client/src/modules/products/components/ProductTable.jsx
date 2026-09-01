import {
    Edit3,
    Trash2,
    Power,
    Package,
} from "lucide-react";

import "./ProductTable.css";


const getStockStatus = (
    quantity,
    reorderLevel
) => {

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


const ProductTable = ({
    products,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {

    if (!products.length) {

        return (

            <div className="products-empty">

                <div className="products-empty-icon">

                    <Package size={27} />

                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        );

    }


    return (

        <div className="product-table-wrapper">

            <table className="product-table">

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Category
                        </th>

                        <th>
                            Brand
                        </th>

                        <th>
                            Price
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

                    {products.map(
                        (product) => {

                            const stock =
                                getStockStatus(
                                    product.quantity || 0,
                                    product.reorderLevel || 10
                                );


                            return (

                                <tr
                                    key={product._id}
                                >

                                    <td>

                                        <div className="product-name-cell">

                                            <div className="product-row-icon">

                                                <Package size={17} />

                                            </div>

                                            <div>

                                                <strong>
                                                    {product.name}
                                                </strong>

                                                {product.genericName && (

                                                    <span>
                                                        {product.genericName}
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                    </td>


                                    <td>

                                        {product.category?.name ||
                                            "—"}

                                    </td>


                                    <td>

                                        {product.brand?.name ||
                                            "—"}

                                    </td>


                                    <td>

                                        <strong>
                                            ETB{" "}
                                            {Number(
                                                product.sellingPrice || 0
                                            ).toLocaleString()}
                                        </strong>

                                    </td>


                                    <td>

                                        <span className="stock-number">

                                            {product.quantity || 0}

                                            <small>
                                                {" "}
                                                {product.unit?.shortName ||
                                                    product.unit?.name ||
                                                    ""}
                                            </small>

                                        </span>

                                    </td>


                                    <td>

                                        <span
                                            className={`product-status ${stock.className}`}
                                        >
                                            {stock.label}
                                        </span>

                                    </td>


                                    <td>

                                        <div className="product-actions">

                                            <button
                                                type="button"
                                                title="Edit product"
                                                onClick={() =>
                                                    onEdit(product)
                                                }
                                            >

                                                <Edit3 size={15} />

                                            </button>


                                            <button
                                                type="button"
                                                title={
                                                    product.isActive
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(
                                                        product
                                                    )
                                                }
                                            >

                                                <Power size={15} />

                                            </button>


                                            <button
                                                type="button"
                                                className="delete"
                                                title="Delete product"
                                                onClick={() =>
                                                    onDelete(product)
                                                }
                                            >

                                                <Trash2 size={15} />

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

    );

};


export default ProductTable;