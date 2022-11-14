require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

const Comments = require('./models/commentModel')

const app = express()
app.use(express.json())
app.use(cors())

const http = require('http').createServer(app)
const io = require('socket.io')(http)

// Soket IO
let users = []
io.on('connection', socket => {
    // console.log(socket.id + ' connected.')
    socket.on('joinRoom', id => {
        // console.log(id) // id = field _id của docs trong collection productsroducts
        const user = { userId: socket.id, room: id }
        // console.log(user) // userId không đổi giữa các lần join room -- chỉ thay đổi nếu refresh trang

        // Đọan code này sẽ check xem có một người dùng mới hoàn toàn join vào room hay một nguời dùng cũ di chuyển giữa các room để thay đổi user.room cho người đó
        const check = users.every(user => user.userId !== socket.id)
        if (check) {
            users.push(user)
            socket.join(user.room)
        } else {
            users.map(user => {
                if (user.userId === socket.id) {
                    if (user.room !== id) {
                        socket.leave(user.room)
                        socket.join(id)
                        user.room = id
                    }
                }
            })
        }
        // console.log(users)
        // console.log(socket.adapter.rooms) // kiểm tra xem có bao nhiêu user đang ở trong một room_room hiện tại 2:05:00
    })

    // socket.emit('createComment', -- file FormInput.js
    socket.on('createComment', async msg => {
        // console.log(msg) // Tạo cmt rồi ân send -- bên này sẽ nhận được những field đó
        const { username, content, product_id, createdAt, rating, send } = msg
        const newComment = new Comments({
            username, content, product_id, createdAt, rating
        }) // Cú pháp của obj literal -- viết tắt nếu key và value trùng nhau

        if (send === 'replyComment') {
            const { _id, username, content, product_id, createdAt, rating } = newComment
            const comment = await Comments.findById(product_id)

            if (comment) {
                comment.reply.push({ _id, username, content, createdAt, rating })
                await comment.save()
                io.to(comment.product_id).emit('sendReplyCommentToClient', comment) // Tìm sendReplyCommentToClient trong DetailProduct.js_2:33:00
            }
        } else {
            await newComment.save()
            io.to(newComment.product_id).emit('sendCommentToClient', newComment)
        }
    })
    socket.on('disconnect', () => {
        // console.log(socket.id + ' disconnected.')
        users = users.filter(user => user.userId !== socket.id) // Lọc bỏ những users đã thoát web/ hoặc refresh web_2:54:30
    })
})

// Routes
app.use('/api', require('./routes/productRouter'))
app.use('/api', require('./routes/commentRouter'))

// Connection to mongodb
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if (err) throw err;
    console.log('Connected to mongodb')
})

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

// Listen server
const PORT = process.env.PORT || 5555
http.listen(PORT, () => {
    console.log('Server is running on port', PORT)
}) 