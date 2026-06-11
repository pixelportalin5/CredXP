const AuditLog = require("../models/AuditLog");

const auditLogService = {
  async create({ actor, action, entityType, entityId, metadata = {} }) {
    return AuditLog.create({
      actor: actor?._id,
      action,
      entityType,
      entityId,
      metadata,
    });
  },

  async list({ limit = 150 } = {}) {
    return AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async getById(id) {
    return AuditLog.findById(id).populate("actor", "name email role").lean();
  },

  async update(id, data) {
    return AuditLog.findByIdAndUpdate(id, data, { new: true }).populate("actor", "name email role").lean();
  },

  async delete(id) {
    const deleted = await AuditLog.findByIdAndDelete(id);
    if (!deleted) return null;
    return { id };
  },
};

module.exports = auditLogService;
