import React, { createContext, useState, useEffect } from 'react'
import { getData } from './components/utils/FetchData'
import io from 'socket.io-client'

export const DataContext = createContext()

export const DataProvider = ({ children }) => {
    const [products, setProducts] = useState([])
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        getData('/api/products') // Thêm một cấu hình trong package.json (client) -- 40:40_https://www.youtube.com/watch?v=tBKUxOdK5Q8&t=2400s
            .then(res => setProducts(res.data.products))
            .catch(err => console.log(err.response.data.msg))

        const socket = io()
        setSocket(socket)
        return () => socket.close()
    }, [])

    const state = {
        products: [products, setProducts],
        socket
    }

    return ( // Một người dùng mới vào thì thêm state -- socket = io() === socket.io (đại diện cho người dùng)
        <DataContext.Provider value={state}>
            {children}
        </DataContext.Provider>
    )
}