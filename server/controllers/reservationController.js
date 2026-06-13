const { Reservation } = require('../models/Extra');

// POST /api/reservations
const createReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json({ success: true, data: reservation });
  } catch (err) { next(err); }
};

// GET /api/reservations
const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().sort({ date: 1, time: 1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (err) { next(err); }
};

// PATCH /api/reservations/:id/status
const updateReservationStatus = async (req, res, next) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, tableNumber: req.body.tableNumber },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (err) { next(err); }
};

// DELETE /api/reservations/:id
const deleteReservation = async (req, res, next) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reservation deleted' });
  } catch (err) { next(err); }
};

module.exports = { createReservation, getAllReservations, updateReservationStatus, deleteReservation };
