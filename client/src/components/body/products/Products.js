import React, { useContext } from 'react'
import { DataContext } from '../../../GlobalState'
import ProductCard from '../../utils/productCard/ProductCard'

function Products() {
    const state = useContext(DataContext) // Lấy dữ liệu từ mongodb
    const [products] = state.products
    // console.log(products) // products là tập dữ liệu từ mongodb

    return (
        <>
            <h2 className="app_title">
                Realtime website (comments, reaction) with MERN stack and socket.io
            </h2>
            <div className="products_page">
            {/* Muốn ghim một pin vào vị trí đầu tiên của web thì thêm vào chính dòng này */}
                {
                    products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))
                }
            </div>
        </>
    )
}

export default Products
