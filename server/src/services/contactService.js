const { resolveService } = require("../lib/serviceFactory");

module.exports = resolveService({
  mongo: () => require("./contactService.mongo"),
  prisma: () => require("./contactService.prisma"),
});
