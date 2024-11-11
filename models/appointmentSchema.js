import mongoose from 'mongoose'
const appointmentSchema = new mongoose.Schema(
  {
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: false,
      default: null
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
      default: null
    },
    providers: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Providers',
      required: false,
      default: null
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'canceled', 'paid'],
      default: 'pending'
    },
    bookingDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    notes: {
      type: String,
    },
    payment: {
      type: String,
      enum: ['cash', 'online']
    }
  },
  { timestamps: true }
)
export const Appointment = mongoose.model('Appointment', appointmentSchema)
