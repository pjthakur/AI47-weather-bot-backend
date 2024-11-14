require('dotenv').config();
const express = require("express")
const app = new express();
require ("./utils/db")
require("./utils/bot")
const router = require("./routers/admin_routes")
const port = process.env.port || 3000

app.use(express.json())

app.use(router)

app.listen(port, ()=>{
    console.log(`connection is live at port ${port}`)
})