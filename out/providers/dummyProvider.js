"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyProvider = void 0;
const parser_1 = require("../core/parser");
class DummyProvider {
    async generateProject(spec, _prompt) {
        return (0, parser_1.createDummyGeneratedProject)(spec);
    }
}
exports.DummyProvider = DummyProvider;
//# sourceMappingURL=dummyProvider.js.map