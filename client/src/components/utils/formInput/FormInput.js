import React, { useRef, useEffect } from 'react'
import './FormInput.css'
import { patchData } from '../../utils/FetchData'

function FormInput({ id, socket, setReply, send, name, id_prd_stan }) {
    const nameRef = useRef()
    const contentRef = useRef()

    useEffect(() => {
        if (name) { // name ở đây là tên của người mà mình muốn trả lời bình luận
            contentRef.current.innerHTML = `
                <a href="#!"
                    style="color: crimson;
                    font-weight: 600;
                    text-transform: capitalize;"
                >${name} </a>
            `
        }
    }, [name])

    const commentSubmit = () => {
        const username = nameRef.current.value // current là đi với useRef()
        const content = contentRef.current.innerHTML

        if (!username.trim()) return alert('Not Empty!')
        if (contentRef.current.textContent.trim().length < 1)
            return alert('Contents too short, must be at least 1 characters')

        const createdAt = new Date().toISOString()

        socket.emit('createComment', { // gán id (mã của sản phẩm) cho field product_id của docs comments
            username, content, product_id: id, createdAt, send
        })

        if (true) { // nếu rating = 0 thì không cập nhật lại product tương ứng -- nghĩa là field numReviews, rating không tăng
            patchData(`/api/products/${id_prd_stan}`) // update dữ liệu cho docs products chứ k phải comments đâu
            // .then(res => console.log(res))
        }

        contentRef.current.innerHTML = ''

        if (setReply) setReply(false)
    }

    return (
        <div className="form_input">
            <p>Nhập tên bạn</p>
            <input type="text" ref={nameRef} />

            <p>Nội dung</p>
            <div ref={contentRef}
                contentEditable="true"
                style={{
                    height: '100px',
                    border: '1px solid #ccc',
                    padding: '5px 10px',
                    outline: 'none'
                }}
            />

            <button onClick={commentSubmit}>Gửi</button>
        </div>
    )
}

export default FormInput
