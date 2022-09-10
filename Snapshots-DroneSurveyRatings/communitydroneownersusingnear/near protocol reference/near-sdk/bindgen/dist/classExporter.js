"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassExporter = void 0;
const as_1 = require("visitor-as/as");
const visitor_as_1 = require("visitor-as");
const JSONBuilder_1 = require("./JSONBuilder");
const utils_1 = require("./utils");
const toString = visitor_as_1.utils.toString;
const privateDecorator = "contractPrivate";
class ClassExporter extends visitor_as_1.ClassDecorator {
    constructor() {
        super(...arguments);
        this.sb = [];
    }
    static get className() {
        return toString(ClassExporter.classSeen.name);
    }
    checkMethods(name) {
        let _class = ClassExporter.classSeen;
        _class.members.forEach((member) => {
            if (member instanceof as_1.MethodDeclaration &&
                !member.is(as_1.CommonFlags.PRIVATE)) {
                if (toString(member.name) === name) {
                    throw new Error(`Method "${toString(member.name)}" already used; cannot export constructor using the same name.`);
                }
            }
        });
    }
    visitFieldDeclaration(node) { }
    visitMethodDeclaration(node) {
        if (node.is(as_1.CommonFlags.SET) || node.is(as_1.CommonFlags.GET)) {
            throw new Error("Exported Singleton class cannot have properties. Found " +
                node.name.text);
        }
        // Private methods should be skipped.
        if (node.is(as_1.CommonFlags.PRIVATE)) {
            return;
        }
        let privateCheck = visitor_as_1.utils.hasDecorator(node, privateDecorator)
            ? `__assertPrivate();`
            : "";
        let name = toString(node.name);
        let decorators = (node.decorators || []).map(toString);
        let returnType = toString(node.signature.returnType);
        let origParams = node.signature.parameters.map(visitor_as_1.utils.cloneNode);
        let parameters = origParams.map((param) => {
            if (param.implicitFieldDeclaration) {
                param.name.text = param.name.text.substring(2);
            }
            return toString(param);
        });
        let pramNames = origParams.map((param) => {
            return toString(param.name);
        });
        let isInit = name === "constructor";
        let assertStr = "";
        if (isInit) {
            assertStr = `assert(isNull(__contract), "contract is already initialized");`;
        }
        else if (ClassExporter.hasConstructor) {
            assertStr = `assert(!isNull(__contract), "contract is not initialized");`;
        }
        let isVoid = returnType === "void";
        let body = isInit
            ? `__contract = new ${ClassExporter.className}(${pramNames.join(", ")});`
            : `${!isVoid ? "let res =  " : ""}__contract.${name}(${pramNames.join(", ")});`;
        if (isInit) {
            name = "init";
            parameters = origParams.map((node) => `${toString(node.name)}: ${toString(node.type)}${node.initializer ? " = " + toString(node.initializer) : ""}`);
            returnType = "void";
        }
        if (isInit) {
            if (!decorators.some((decorator) => decorator.includes("exportAs"))) {
                decorators.push(`@exportAs("new")`);
                this.checkMethods("new");
            }
            else {
                let decorator = node.decorators.find((d) => toString(d.name) === "exportAs");
                if (decorator.args.length == 1) {
                    this.checkMethods(toString(decorator.args[0]));
                }
            }
        }
        const hasMutateState = decorators.some((decorator) => {
            let res = decorator.includes("mutateState");
            return res;
        });
        this.sb.push(`${decorators.join("\n")}
export function ${name}(${parameters.join(", ")}): ${returnType} {
  ${privateCheck}
  ${assertStr}
  ${body}
  ${isInit || hasMutateState ? `__setState(__contract);` : ""}
  ${isVoid || isInit ? "" : "return res;"}
}`);
    }
    visitClassDeclaration(node) {
        if (JSONBuilder_1.isEntry(node) && node.is(as_1.CommonFlags.EXPORT)) {
            let name = toString(node.name);
            if (ClassExporter.classSeen) {
                throw new Error(`Cannot export class ${name}. ${ClassExporter.className} already exported. `);
            }
            ClassExporter.classSeen = node;
            ClassExporter.hasConstructor = node.members.some((member) => {
                if (member instanceof as_1.MethodDeclaration) {
                    return toString(member.name) === "constructor";
                }
                return false;
            });
            this.sb.push(`let __contract: ${name};
if (__checkState()) {
  __contract = __getState<${name}>();
}${!ClassExporter.hasConstructor
                ? ` else {
  __contract = new ${name}();
}`
                : ""}`);
            this.visit(node.members);
            node.flags = node.flags ^ as_1.CommonFlags.EXPORT;
            let newStatements = utils_1.SimpleParser.parseTopLevel(this.sb.join("\n")).map((n) => {
                if (n instanceof as_1.FunctionDeclaration) {
                    n.flags = n.flags | as_1.CommonFlags.EXPORT;
                    n.flags = n.flags | as_1.CommonFlags.MODULE_EXPORT;
                }
                n.range = node.range;
                return n;
            });
            node.range.source.statements.push(...newStatements);
        }
    }
    get name() {
        return "nearBindgen";
    }
    static visit(source) {
        if (source.sourceKind != as_1.SourceKind.USER_ENTRY) {
            return;
        }
        let visitor = new ClassExporter();
        visitor.visit(source);
    }
}
exports.ClassExporter = ClassExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3NFeHBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGFzc0V4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQVF1QjtBQUN2QiwyQ0FBbUQ7QUFDbkQsK0NBQXdDO0FBQ3hDLG1DQUF1QztBQUV2QyxNQUFNLFFBQVEsR0FBRyxrQkFBSyxDQUFDLFFBQVEsQ0FBQztBQUNoQyxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBRTNDLE1BQWEsYUFBYyxTQUFRLDJCQUFjO0lBQWpEOztRQUNFLE9BQUUsR0FBYSxFQUFFLENBQUM7SUFpS3BCLENBQUM7SUE3SkMsTUFBTSxLQUFLLFNBQVM7UUFDbEIsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsWUFBWSxDQUFDLElBQVk7UUFDdkIsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQztRQUNyQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hDLElBQ0UsTUFBTSxZQUFZLHNCQUFpQjtnQkFDbkMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGdCQUFXLENBQUMsT0FBTyxDQUFDLEVBQy9CO2dCQUNBLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7b0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQ2IsV0FBVyxRQUFRLENBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQ1osZ0VBQWdFLENBQ2xFLENBQUM7aUJBQ0g7YUFDRjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHFCQUFxQixDQUFDLElBQXNCLElBQVMsQ0FBQztJQUV0RCxzQkFBc0IsQ0FBQyxJQUF1QjtRQUM1QyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQVcsQ0FBQyxHQUFHLENBQUMsSUFB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LElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUNwRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNKLElBQUksQ0FBQyxZQUFZLHdCQUFtQixFQUFFO29CQUNwQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsZ0JBQVcsQ0FBQyxNQUFNLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxnQkFBVyxDQUFDLGFBQWEsQ0FBQztpQkFDL0M7Z0JBQ0QsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNyQixPQUFPLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FDRixDQUFDO1lBQ0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxDQUFDO1NBQ3JEO0lBQ0gsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sYUFBYSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWM7UUFDekIsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLGVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDOUMsT0FBTztTQUNSO1FBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7Q0FDRjtBQWxLRCxzQ0FrS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDbGFzc0RlY2xhcmF0aW9uLFxuICBGaWVsZERlY2xhcmF0aW9uLFxuICBNZXRob2REZWNsYXJhdGlvbixcbiAgU291cmNlLFxuICBDb21tb25GbGFncyxcbiAgU291cmNlS2luZCxcbiAgRnVuY3Rpb25EZWNsYXJhdGlvbixcbn0gZnJvbSBcInZpc2l0b3ItYXMvYXNcIjtcbmltcG9ydCB7IHV0aWxzLCBDbGFzc0RlY29yYXRvciB9IGZyb20gXCJ2aXNpdG9yLWFzXCI7XG5pbXBvcnQgeyBpc0VudHJ5IH0gZnJvbSBcIi4vSlNPTkJ1aWxkZXJcIjtcbmltcG9ydCB7IFNpbXBsZVBhcnNlciB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmNvbnN0IHRvU3RyaW5nID0gdXRpbHMudG9TdHJpbmc7XG5jb25zdCBwcml2YXRlRGVjb3JhdG9yID0gXCJjb250cmFjdFByaXZhdGVcIjtcblxuZXhwb3J0IGNsYXNzIENsYXNzRXhwb3J0ZXIgZXh0ZW5kcyBDbGFzc0RlY29yYXRvciB7XG4gIHNiOiBzdHJpbmdbXSA9IFtdO1xuICBzdGF0aWMgY2xhc3NTZWVuOiBDbGFzc0RlY2xhcmF0aW9uO1xuICBzdGF0aWMgaGFzQ29uc3RydWN0b3I6IGJvb2xlYW47XG5cbiAgc3RhdGljIGdldCBjbGFzc05hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdG9TdHJpbmcoQ2xhc3NFeHBvcnRlci5jbGFzc1NlZW4ubmFtZSk7XG4gIH1cblxuICBjaGVja01ldGhvZHMobmFtZTogc3RyaW5nKSB7XG4gICAgbGV0IF9jbGFzcyA9IENsYXNzRXhwb3J0ZXIuY2xhc3NTZWVuO1xuICAgIF9jbGFzcy5tZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBtZW1iZXIgaW5zdGFuY2VvZiBNZXRob2REZWNsYXJhdGlvbiAmJlxuICAgICAgICAhbWVtYmVyLmlzKENvbW1vbkZsYWdzLlBSSVZBVEUpXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRvU3RyaW5nKG1lbWJlci5uYW1lKSA9PT0gbmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBNZXRob2QgXCIke3RvU3RyaW5nKFxuICAgICAgICAgICAgICBtZW1iZXIubmFtZVxuICAgICAgICAgICAgKX1cIiBhbHJlYWR5IHVzZWQ7IGNhbm5vdCBleHBvcnQgY29uc3RydWN0b3IgdXNpbmcgdGhlIHNhbWUgbmFtZS5gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRGaWVsZERlY2xhcmF0aW9uKG5vZGU6IEZpZWxkRGVjbGFyYXRpb24pOiB2b2lkIHt9XG5cbiAgdmlzaXRNZXRob2REZWNsYXJhdGlvbihub2RlOiBNZXRob2REZWNsYXJhdGlvbik6IHZvaWQge1xuICAgIGlmIChub2RlLmlzKENvbW1vbkZsYWdzLlNFVCkgfHwgbm9kZS5pcyhDb21tb25GbGFncy5HRVQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiRXhwb3J0ZWQgU2luZ2xldG9uIGNsYXNzIGNhbm5vdCBoYXZlIHByb3BlcnRpZXMuIEZvdW5kIFwiICtcbiAgICAgICAgICBub2RlLm5hbWUudGV4dFxuICAgICAgKTtcbiAgICB9XG4gICAgLy8gUHJpdmF0ZSBtZXRob2RzIHNob3VsZCBiZSBza2lwcGVkLlxuICAgIGlmIChub2RlLmlzKENvbW1vbkZsYWdzLlBSSVZBVEUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBwcml2YXRlQ2hlY2sgPSB1dGlscy5oYXNEZWNvcmF0b3Iobm9kZSwgcHJpdmF0ZURlY29yYXRvcilcbiAgICAgID8gYF9fYXNzZXJ0UHJpdmF0ZSgpO2BcbiAgICAgIDogXCJcIjtcbiAgICBsZXQgbmFtZSA9IHRvU3RyaW5nKG5vZGUubmFtZSk7XG4gICAgbGV0IGRlY29yYXRvcnMgPSAobm9kZS5kZWNvcmF0b3JzIHx8IFtdKS5tYXAodG9TdHJpbmcpO1xuICAgIGxldCByZXR1cm5UeXBlID0gdG9TdHJpbmcobm9kZS5zaWduYXR1cmUucmV0dXJuVHlwZSk7XG4gICAgbGV0IG9yaWdQYXJhbXMgPSBub2RlLnNpZ25hdHVyZS5wYXJhbWV0ZXJzLm1hcCh1dGlscy5jbG9uZU5vZGUpO1xuICAgIGxldCBwYXJhbWV0ZXJzID0gb3JpZ1BhcmFtcy5tYXAoKHBhcmFtKSA9PiB7XG4gICAgICBpZiAocGFyYW0uaW1wbGljaXRGaWVsZERlY2xhcmF0aW9uKSB7XG4gICAgICAgIHBhcmFtLm5hbWUudGV4dCA9IHBhcmFtLm5hbWUudGV4dC5zdWJzdHJpbmcoMik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9TdHJpbmcocGFyYW0pO1xuICAgIH0pO1xuICAgIGxldCBwcmFtTmFtZXMgPSBvcmlnUGFyYW1zLm1hcCgocGFyYW0pID0+IHtcbiAgICAgIHJldHVybiB0b1N0cmluZyhwYXJhbS5uYW1lKTtcbiAgICB9KTtcbiAgICBsZXQgaXNJbml0ID0gbmFtZSA9PT0gXCJjb25zdHJ1Y3RvclwiO1xuICAgIGxldCBhc3NlcnRTdHI6IHN0cmluZyA9IFwiXCI7XG4gICAgaWYgKGlzSW5pdCkge1xuICAgICAgYXNzZXJ0U3RyID0gYGFzc2VydChpc051bGwoX19jb250cmFjdCksIFwiY29udHJhY3QgaXMgYWxyZWFkeSBpbml0aWFsaXplZFwiKTtgO1xuICAgIH0gZWxzZSBpZiAoQ2xhc3NFeHBvcnRlci5oYXNDb25zdHJ1Y3Rvcikge1xuICAgICAgYXNzZXJ0U3RyID0gYGFzc2VydCghaXNOdWxsKF9fY29udHJhY3QpLCBcImNvbnRyYWN0IGlzIG5vdCBpbml0aWFsaXplZFwiKTtgO1xuICAgIH1cbiAgICBsZXQgaXNWb2lkID0gcmV0dXJuVHlwZSA9PT0gXCJ2b2lkXCI7XG4gICAgbGV0IGJvZHkgPSBpc0luaXRcbiAgICAgID8gYF9fY29udHJhY3QgPSBuZXcgJHtDbGFzc0V4cG9ydGVyLmNsYXNzTmFtZX0oJHtwcmFtTmFtZXMuam9pbihcIiwgXCIpfSk7YFxuICAgICAgOiBgJHshaXNWb2lkID8gXCJsZXQgcmVzID0gIFwiIDogXCJcIn1fX2NvbnRyYWN0LiR7bmFtZX0oJHtwcmFtTmFtZXMuam9pbihcbiAgICAgICAgICBcIiwgXCJcbiAgICAgICAgKX0pO2A7XG4gICAgaWYgKGlzSW5pdCkge1xuICAgICAgbmFtZSA9IFwiaW5pdFwiO1xuICAgICAgcGFyYW1ldGVycyA9IG9yaWdQYXJhbXMubWFwKFxuICAgICAgICAobm9kZSkgPT5cbiAgICAgICAgICBgJHt0b1N0cmluZyhub2RlLm5hbWUpfTogJHt0b1N0cmluZyhub2RlLnR5cGUpfSR7XG4gICAgICAgICAgICBub2RlLmluaXRpYWxpemVyID8gXCIgPSBcIiArIHRvU3RyaW5nKG5vZGUuaW5pdGlhbGl6ZXIpIDogXCJcIlxuICAgICAgICAgIH1gXG4gICAgICApO1xuICAgICAgcmV0dXJuVHlwZSA9IFwidm9pZFwiO1xuICAgIH1cbiAgICBpZiAoaXNJbml0KSB7XG4gICAgICBpZiAoIWRlY29yYXRvcnMuc29tZSgoZGVjb3JhdG9yKSA9PiBkZWNvcmF0b3IuaW5jbHVkZXMoXCJleHBvcnRBc1wiKSkpIHtcbiAgICAgICAgZGVjb3JhdG9ycy5wdXNoKGBAZXhwb3J0QXMoXCJuZXdcIilgKTtcbiAgICAgICAgdGhpcy5jaGVja01ldGhvZHMoXCJuZXdcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZGVjb3JhdG9yID0gbm9kZS5kZWNvcmF0b3JzIS5maW5kKFxuICAgICAgICAgIChkKSA9PiB0b1N0cmluZyhkLm5hbWUpID09PSBcImV4cG9ydEFzXCJcbiAgICAgICAgKSE7XG4gICAgICAgIGlmIChkZWNvcmF0b3IuYXJncyEubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICB0aGlzLmNoZWNrTWV0aG9kcyh0b1N0cmluZyhkZWNvcmF0b3IuYXJncyFbMF0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoYXNNdXRhdGVTdGF0ZSA9IGRlY29yYXRvcnMuc29tZSgoZGVjb3JhdG9yKSA9PiB7XG4gICAgICBsZXQgcmVzID0gZGVjb3JhdG9yLmluY2x1ZGVzKFwibXV0YXRlU3RhdGVcIik7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xuICAgIHRoaXMuc2IucHVzaChcbiAgICAgIGAke2RlY29yYXRvcnMuam9pbihcIlxcblwiKX1cbmV4cG9ydCBmdW5jdGlvbiAke25hbWV9KCR7cGFyYW1ldGVycy5qb2luKFwiLCBcIil9KTogJHtyZXR1cm5UeXBlfSB7XG4gICR7cHJpdmF0ZUNoZWNrfVxuICAke2Fzc2VydFN0cn1cbiAgJHtib2R5fVxuICAke2lzSW5pdCB8fCBoYXNNdXRhdGVTdGF0ZSA/IGBfX3NldFN0YXRlKF9fY29udHJhY3QpO2AgOiBcIlwifVxuICAke2lzVm9pZCB8fCBpc0luaXQgPyBcIlwiIDogXCJyZXR1cm4gcmVzO1wifVxufWBcbiAgICApO1xuICB9XG5cbiAgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IENsYXNzRGVjbGFyYXRpb24pOiB2b2lkIHtcbiAgICBpZiAoaXNFbnRyeShub2RlKSAmJiBub2RlLmlzKENvbW1vbkZsYWdzLkVYUE9SVCkpIHtcbiAgICAgIGxldCBuYW1lID0gdG9TdHJpbmcobm9kZS5uYW1lKTtcbiAgICAgIGlmIChDbGFzc0V4cG9ydGVyLmNsYXNzU2Vlbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYENhbm5vdCBleHBvcnQgY2xhc3MgJHtuYW1lfS4gJHtDbGFzc0V4cG9ydGVyLmNsYXNzTmFtZX0gYWxyZWFkeSBleHBvcnRlZC4gYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgQ2xhc3NFeHBvcnRlci5jbGFzc1NlZW4gPSBub2RlO1xuICAgICAgQ2xhc3NFeHBvcnRlci5oYXNDb25zdHJ1Y3RvciA9IG5vZGUubWVtYmVycy5zb21lKChtZW1iZXIpID0+IHtcbiAgICAgICAgaWYgKG1lbWJlciBpbnN0YW5jZW9mIE1ldGhvZERlY2xhcmF0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRvU3RyaW5nKG1lbWJlci5uYW1lKSA9PT0gXCJjb25zdHJ1Y3RvclwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5zYi5wdXNoKFxuICAgICAgICBgbGV0IF9fY29udHJhY3Q6ICR7bmFtZX07XG5pZiAoX19jaGVja1N0YXRlKCkpIHtcbiAgX19jb250cmFjdCA9IF9fZ2V0U3RhdGU8JHtuYW1lfT4oKTtcbn0ke1xuICAgICAgICAgICFDbGFzc0V4cG9ydGVyLmhhc0NvbnN0cnVjdG9yXG4gICAgICAgICAgICA/IGAgZWxzZSB7XG4gIF9fY29udHJhY3QgPSBuZXcgJHtuYW1lfSgpO1xufWBcbiAgICAgICAgICAgIDogXCJcIlxuICAgICAgICB9YFxuICAgICAgKTtcbiAgICAgIHRoaXMudmlzaXQobm9kZS5tZW1iZXJzKTtcbiAgICAgIG5vZGUuZmxhZ3MgPSBub2RlLmZsYWdzIF4gQ29tbW9uRmxhZ3MuRVhQT1JUO1xuICAgICAgbGV0IG5ld1N0YXRlbWVudHMgPSBTaW1wbGVQYXJzZXIucGFyc2VUb3BMZXZlbCh0aGlzLnNiLmpvaW4oXCJcXG5cIikpLm1hcChcbiAgICAgICAgKG4pID0+IHtcbiAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEZ1bmN0aW9uRGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgIG4uZmxhZ3MgPSBuLmZsYWdzIHwgQ29tbW9uRmxhZ3MuRVhQT1JUO1xuICAgICAgICAgICAgbi5mbGFncyA9IG4uZmxhZ3MgfCBDb21tb25GbGFncy5NT0RVTEVfRVhQT1JUO1xuICAgICAgICAgIH1cbiAgICAgICAgICBuLnJhbmdlID0gbm9kZS5yYW5nZTtcbiAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIG5vZGUucmFuZ2Uuc291cmNlLnN0YXRlbWVudHMucHVzaCguLi5uZXdTdGF0ZW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBcIm5lYXJCaW5kZ2VuXCI7XG4gIH1cblxuICBzdGF0aWMgdmlzaXQoc291cmNlOiBTb3VyY2UpOiB2b2lkIHtcbiAgICBpZiAoc291cmNlLnNvdXJjZUtpbmQgIT0gU291cmNlS2luZC5VU0VSX0VOVFJZKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB2aXNpdG9yID0gbmV3IENsYXNzRXhwb3J0ZXIoKTtcbiAgICB2aXNpdG9yLnZpc2l0KHNvdXJjZSk7XG4gIH1cbn1cbiJdfQ==