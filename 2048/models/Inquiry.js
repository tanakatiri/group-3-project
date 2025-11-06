import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },
  tenantName: {
    type: String,
    required: true
  },
  tenantEmail: {
    type: String,
    required: true
  },
  tenantPhone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+263[0-9]{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Zimbabwe phone number! Format: +263 followed by 9 digits`
    }
  },
  message: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);
export default Inquiry;
