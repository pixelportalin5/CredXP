const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./propertyService.mongo"),
  prisma: () => require("./propertyService.prisma"),
});
