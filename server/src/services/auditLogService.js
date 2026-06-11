const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./auditLogService.mongo"),
  prisma: () => require("./auditLogService.prisma"),
});
