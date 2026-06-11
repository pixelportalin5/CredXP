const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./proposalService.mongo"),
  prisma: () => require("./proposalService.prisma"),
});
