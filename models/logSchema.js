
import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  originalAppointmentId: mongoose.Schema.Types.ObjectId,
  users: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  providers: { type: mongoose.Schema.Types.ObjectId, ref: 'Providers' },
  status: String,
  cancelledByProvider:Boolean,
}, { timestamps: true });

export const Log = mongoose.model('Log', logSchema);
