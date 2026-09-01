import {
    Package,
    AlertTriangle,
    Boxes,
    CircleDollarSign,
} from "lucide-react";

const ProductStats = ({ products = [] }) => {
    const totalProducts = products.length;

    const lowStock = products.filter((product) => {
        const quantity = Number(product.quantity ?? product.stockQuantity ?? 0);
        const reorderLevel = Number(
            product.reorderLevel ??
            product.minimumStock ??
            product.minStock ??
            0
        );

        return quantity <= reorderLevel;
    }).length;

    const expiringSoon = products.filter((product) => {
        if (!product.expiryDate) return false;

        const expiry = new Date(product.expiryDate);
        const today = new Date();

        const difference =
            (expiry - today) / (1000 * 60 * 60 * 24);

        return difference >= 0 && difference <= 90;
    }).length;

    const inventoryValue = products.reduce((total, product) => {
        const quantity = Number(
            product.quantity ??
            product.stockQuantity ??
            0
        );

        const price = Number(
            product.purchasePrice ??
            product.costPrice ??
            0
        );

        return total + quantity * price;
    }, 0);

    const stats = [
        {
            title: "Total Products",
            value: totalProducts,
            icon: Package,
            className: "green",
        },
        {
            title: "Low Stock",
            value: lowStock,
            icon: AlertTriangle,
            className: "orange",
        },
        {
            title: "Expiring Soon",
            value: expiringSoon,
            icon: Boxes,
            className: "purple",
        },
        {
            title: "Inventory Value",
            value: `ETB ${inventoryValue.toLocaleString()}`,
            icon: CircleDollarSign,
            className: "blue",
        },
    ];

    return (
        <section className="product-stats-grid">

            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <article
                        className="product-stat-card"
                        key={stat.title}
                    >
                        <div className={`product-stat-icon ${stat.className}`}>
                            <Icon size={21} />
                        </div>

                        <div className="product-stat-content">
                            <span>
                                {stat.title}
                            </span>

                            <strong>
                                {stat.value}
                            </strong>
                        </div>
                    </article>
                );
            })}

        </section>
    );
};

export default ProductStats;