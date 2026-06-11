const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./authService.mongo"),
  prisma: () => require("./authService.prisma"),
});
