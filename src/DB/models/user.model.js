import mongoose from "mongoose";

export const GenderTypes = {
  MALE: "MALE",
  FEMALE: "FEMALE",
};
export const GenderProviders = {
  SYSTEM: "SYSTEM",
  GOOGLE: "GOOGLE",
};

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [3, "First name must be at least 3 characters"],
      maxlength: [20, "First name must be less than 20 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [3, "Last name must be at least 3 characters"],
      maxlength: [20, "Last name must be less than 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function (){
        return GenderProviders.GOOGLE ? false:true

      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
    },
    confirmEmail: Date,
    confirmemailOtp: String,
    forgetPsswordOtp:String,
    resetPassword:String,
    otpExpiresAt: Date,
    gender: {
      type: String,
      enum: Object.values(GenderTypes),
      default: GenderTypes.MALE,
      required: true,
    },
      providers: {
      type: String,
      enum: Object.values(GenderProviders),
      default: GenderTypes.SYSTEM,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ ضيف الـ virtual هنا بعد ما تعمل الـ Schema
userSchema.virtual("messages", {
  localField: "_id",
  foreignField: "receieverId", // تأكد الاسم مطابق للموديل التاني
  ref: "Message",
});

const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
