import api from "../../../services/api";


export const getProducts = async () => {

    const response =
        await api.get("/products");

    return response.data;

};


export const getProduct = async (id) => {

    const response =
        await api.get(`/products/${id}`);

    return response.data;

};


export const createProduct = async (data) => {

    const response =
        await api.post(
            "/products",
            data
        );

    return response.data;

};


export const updateProduct = async (
    id,
    data
) => {

    const response =
        await api.put(
            `/products/${id}`,
            data
        );

    return response.data;

};


export const deleteProduct = async (id) => {

    const response =
        await api.delete(
            `/products/${id}`
        );

    return response.data;

};


export const getProductOptions =
    async () => {

        const [
            categoriesResponse,
            brandsResponse,
            manufacturersResponse,
            suppliersResponse,
            unitsResponse,
        ] = await Promise.all([

            api.get("/categories"),

            api.get("/brands"),

            api.get("/manufacturers"),

            api.get("/suppliers"),

            api.get("/units"),

        ]);


        return {

            categories:
                categoriesResponse.data?.data || [],

            brands:
                brandsResponse.data?.data || [],

            manufacturers:
                manufacturersResponse.data?.data || [],

            suppliers:
                suppliersResponse.data?.data || [],

            units:
                unitsResponse.data?.data || [],

        };

    };