const express    = require("express")
const cors       = require("cors")

const app = express()
app.use(cors())

app.use(express.json({limit: '2mb'}))
// app.use(express.urlencoded({limit: '2mb'}))

app.use('/image', require('./routes/image'))
app.use('/api', require('./routes/api'))

app.use((req, res) => {
    res.status(404).send({ error: { error: "nothing_found", error_description: "Page not found" }})
})

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Server started on port ${port}`))