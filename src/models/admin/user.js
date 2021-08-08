const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    f_name: {
      type: String,
      required: true,
      trim: true,
    },
    l_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      index: {
        unique: true,
        dropDups: true,
      },
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter correct email address");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    avatar: {
      type: Buffer,
    },
    role: {
      type: Number,
      trim: true,
      default: 0,
      validate(val) {
        if (val !== 0 && val !== 1) {
          throw new Error("Role can only be 0 or 1");
        }
      },
    },
    address: [{}],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  userObj.name = user.f_name + " " + userObj.l_name;
  userObj.image = '/moglix/user/image/' + user._id;

  delete userObj.avatar;
  delete userObj.f_name;
  delete userObj.l_name;
  delete userObj.password;
  delete userObj.tokens;
  delete userObj.__v;

  return userObj;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    process.env.UNIQUE_KEY
  );
  user.tokens.push({ token });
  await user.save();

  return token;
};

// Static function to login
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login as user doesn't exist");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Incorrect password");
  }

  return user;
};

// Middleware which runs just before save and validate
// Used to HASH the password
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
