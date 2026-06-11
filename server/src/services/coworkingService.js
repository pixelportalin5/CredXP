const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./coworkingService.mongo"),
  prisma: () => require("./coworkingService.prisma"),
});
