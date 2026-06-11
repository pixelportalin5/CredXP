const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./savedPropertyService.mongo"),
  prisma: () => require("./savedPropertyService.prisma"),
});
