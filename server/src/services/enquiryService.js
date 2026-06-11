const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./enquiryService.mongo"),
  prisma: () => require("./enquiryService.prisma"),
});
