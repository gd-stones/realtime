import React, { useContext, useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { DataContext } from '../../../GlobalState'
import { getData } from '../../utils/FetchData'

import DetailProductCard from '../../utils/detailProductCard/DetailProductCard'
import FormInput from '../../utils/formInput/FormInput'
import CommentItem from '../../utils/commentItem/CommentItem'
import Loading from '../../utils/images/loading.gif'

function DetailProduct() {
    const { id } = useParams(); // Lấy được id của product ở trên URL
    const state = useContext(DataContext); // state có 2 cặp key: value là products và socket -- file GlobalState.js
    const [products] = state.products; // Lấy tất cả products từ mongodb
    const socket = state.socket; // Theo mình hiểu thì socket đại diện cho trang cả web
    // console.log(socket)
    const [detailProduct, setDetailProduct] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1); // 1 docs comment (cmt to) thì gọi là 1 page
    const pageEnd = useRef();

    useEffect(() => {
        setDetailProduct(products.filter(product => product._id === id))
        // console.log(products.filter(product => product._id === id))
    }, [id, products])

    useEffect(() => {// Lấy tất cả những docs của collection comments có pruduct_id = _id của sản phẩm -- xem kỹ lại 33:54_MERN Stack + Socket.io Realtime website (chat, comments ...)
        setLoading(true)
        getData(`/api/comments/${id}?limit=${page * 5}`) // mấy cái tham số phía sau liên quan tới phần paginating trong file commentCtrll.js 
            // Lần đầu khi người dùng vào room chỉ tải tối đa 5 page = 5 comment TO    
            .then(res => {
                console.log(res.data)
                setComments(r => r = res.data.comments)
                // console.log(comments)
                setLoading(false)
            })
            .catch(err => console.log(err.response.data.msg))
    }, [id, page])

    // Realtime -- Join room
    useEffect(() => {
        if (socket) {
            socket.emit('joinRoom', id)
        }
    }, [socket, id]) // Tại sao useEffect lại có id, comments -- trình duyệt warning_02:09:45

    // Comment -- sendCommentToClient
    useEffect(() => {
        if (socket) {
            socket.on('sendCommentToClient', msg => { // msg = newComment -- file server.js
                setComments([msg, ...comments])
            })
            return () => socket.off('sendCommentToClient')
        }
    }, [socket, comments])

    // Infiniti scroll
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prev => prev + 1)
            }
        }, {
            threshold: 0.1
        })
        observer.observe(pageEnd.current)
    }, [])

    // Reply Comments
    useEffect(() => {
        if (socket) {
            socket.on('sendReplyCommentToClient', msg => { // msg = comment -- file server.js
                const newArr = [...comments]
                // Đoạn code này để nối thêm một reply mới vào giao diện
                newArr.forEach(cm => {
                    if (cm._id === msg._id) {
                        cm.reply = msg.reply
                    }
                })
                setComments(newArr)
            })
            return () => socket.off('sendReplyCommentToClient')
        }
    }, [socket, comments])

    return (
        <div className="detail_product_page">
            {
                detailProduct.map(product => (
                    <DetailProductCard key={product._id} product={product} />
                ))
            }

            <div className="comments">
                <h2 className="app_title">
                    Bình luận
                </h2>

                <FormInput id={id} socket={socket} id_prd_stan={id} />

                <div className="comments_list">
                    {
                        comments.map(comment => (
                            <CommentItem key={comment._id} comment={comment} socket={socket} id_prd_stan={id} />
                        ))
                    }
                </div>

            </div>

            {
                loading && <div className="loading"><img src={Loading} alt="" /></div>
            }
            <button ref={pageEnd} style={{ opacity: 0 }}>Load more</button>
        </div>
    )
}

export default DetailProduct
