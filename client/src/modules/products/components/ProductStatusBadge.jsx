const ProductStatusBadge = ({ product }) => {
    const quantity = Number(
        product.quantity ??
        product.stockQuantity ??
        0
    );

    const reorderLevel = Number(
        product.reorderLevel ??
        product.minimumStock ??
        product.minStock ??
        0
    );

    if (quantity <= reorderLevel) {
        return (
            <span className="product-status-badge warning">
                Low Stock
            </span>
        );
    }

    if (product.expiryDate) {
        const expiry = new Date(product.expiryDate);
        const today = new Date();

        const days =
            (expiry - today) /
            (1000 * 60 * 60 * 24);

        if (days < 0) {
            return (
                <span className="product-status-badge danger">
                    Expired
                </span>
            );
        }

        if (days <= 90) {
            return (
                <span className="product-status-badge warning">
                    Expiring Soon
                </span>
            );
        }
    }

    return (
        <span className="product-status-badge success">
            In Stock
        </span>
    );
};

export default ProductStatusBadge;