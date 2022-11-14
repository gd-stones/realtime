import React from 'react'
import moment from 'moment'
import './CommentCard.css' // Chỉnh thời gian cmt ngang hàng với {load more comments, hide, reply} trong file này

function CommentCard({ children, comment }) {
    return (
        <div className="comment_card">
            <div className="comment_card_row">
                <h3>{comment.username}</h3>
            </div>

            <span>{moment(comment.createdAt).fromNow()}</span>

            <span>{new Date(comment.createdAt).toLocaleString()}</span>

            <p dangerouslySetInnerHTML={{ __html: comment.content }} />

            {children}
        </div>
    )
}

export default CommentCard
