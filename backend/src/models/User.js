const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name :{ type: String, required: true },
    email :{ type: String, required: true, unique: true },
    hashedPassword :{ type: String, required: true },
    roleIds:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Role'}]
}, {timestamps :true });

module.exports = mongoose.model("User", userSchema);
