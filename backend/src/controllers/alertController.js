const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q.status = status;
    const alerts = await Alert.find(q)
      .sort({ createdAt: -1 })
      .populate('patientId', 'name');
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ackAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Not found' });

    alert.status = 'in_progress';
    alert.handledBy.push(req.user._id);
    await alert.save();

    res.json({ ok: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
    if (!alert) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveAlertsPatientCount = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: { $ne: 'closed' } }).populate('patientId');
    // Filter alerts where patient is assigned to current nurse
    const filteredAlerts = alerts.filter(a => a.patientId && a.patientId.assignedNurses.some(n => n.toString() === req.user._id.toString()));
    const patientIds = [...new Set(filteredAlerts.map(a => a.patientId._id.toString()))];
    res.json({ count: patientIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
