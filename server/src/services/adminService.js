const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./adminService.mongo"),
  prisma: () => require("./adminService.prisma"),
});
