import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traversePkg from '@babel/traverse';
const traverse = traversePkg.default || traversePkg;
import generatePkg from '@babel/generator';
const generate = generatePkg.default || generatePkg;
import * as t from '@babel/types';

function convertJsxDev(p) {
    const node = p.node;
    if (!t.isCallExpression(node)) return;

    let callee = node.callee;
    if (t.isSequenceExpression(callee)) {
        callee = callee.expressions[callee.expressions.length - 1];
    }

    const isJsxDev = (
        (t.isMemberExpression(callee) && (callee.property.name === 'jsxDEV' || callee.property.name === 'jsxs' || callee.property.name === 'jsx')) ||
        (t.isIdentifier(callee) && (callee.name === 'jsxDEV' || callee.name === 'jsxs' || callee.name === 'jsx'))
    );
    if (!isJsxDev) return;

    const [tagArg, propsArg, keyArg] = node.arguments;
    if (!tagArg) return;

    let tagName;
    if (t.isStringLiteral(tagArg)) {
        tagName = t.jsxIdentifier(tagArg.value);
    } else if (t.isIdentifier(tagArg)) {
        tagName = t.jsxIdentifier(tagArg.name);
    } else if (t.isMemberExpression(tagArg)) {
        const getObjName = (obj) => {
            if (t.isIdentifier(obj)) return t.jsxIdentifier(obj.name);
            if (t.isMemberExpression(obj)) return t.jsxMemberExpression(getObjName(obj.object), t.jsxIdentifier(obj.property.name));
            return t.jsxIdentifier('Component');
        };
        tagName = t.jsxMemberExpression(getObjName(tagArg.object), t.jsxIdentifier(tagArg.property.name));
    } else {
        return;
    }

    const attributes = [];
    const children = [];

    if (t.isObjectExpression(propsArg)) {
        for (const prop of propsArg.properties) {
            if (!t.isObjectProperty(prop)) {
                if (t.isSpreadElement(prop)) {
                    attributes.push(t.jsxSpreadAttribute(prop.argument));
                }
                continue;
            }
            const propName = t.isIdentifier(prop.key) ? prop.key.name : (t.isStringLiteral(prop.key) ? prop.key.value : null);
            if (!propName) continue;

            if (propName.startsWith('x-')) continue;

            if (propName === 'children') {
                const childVal = prop.value;
                if (t.isArrayExpression(childVal)) {
                    for (const elem of childVal.elements) {
                        if (elem) processChild(elem, children);
                    }
                } else {
                    processChild(childVal, children);
                }
                continue;
            }

            let attrValue;
            if (t.isStringLiteral(prop.value)) {
                attrValue = prop.value;
            } else if (t.isBooleanLiteral(prop.value) && prop.value.value === true) {
                attrValue = null;
            } else {
                attrValue = t.jsxExpressionContainer(prop.value);
            }
            attributes.push(t.jsxAttribute(t.jsxIdentifier(propName), attrValue));
        }
    }

    if (keyArg && !t.isUnaryExpression(keyArg, { operator: 'void' }) && !t.isIdentifier(keyArg, { name: 'undefined' })) {
        const hasKey = attributes.some(a => t.isJSXAttribute(a) && a.name.name === 'key');
        if (!hasKey) {
            const keyVal = t.isStringLiteral(keyArg) ? keyArg : t.jsxExpressionContainer(keyArg);
            attributes.unshift(t.jsxAttribute(t.jsxIdentifier('key'), keyVal));
        }
    }

    function processChild(cNode, childrenList) {
        if (t.isJSXElement(cNode) || t.isJSXFragment(cNode)) {
            childrenList.push(cNode);
        } else if (t.isStringLiteral(cNode)) {
            childrenList.push(t.jsxText(cNode.value));
        } else {
            childrenList.push(t.jsxExpressionContainer(cNode));
        }
    }

    const openTag = t.jsxOpeningElement(tagName, attributes, children.length === 0);
    const closeTag = children.length === 0 ? null : t.jsxClosingElement(tagName);

    const jsxElem = t.jsxElement(openTag, closeTag, children, children.length === 0);
    p.replaceWith(jsxElem);
}

export function decompileFile(srcPath) {
    const raw = fs.readFileSync(srcPath, 'utf-8');
    let code = raw;
    if (code.startsWith('// MODULE:')) {
        code = code.substring(code.indexOf('\n') + 1);
    }
    const funcStart = code.indexOf('{');
    const funcEnd = code.lastIndexOf('}');
    if (funcStart !== -1 && funcEnd !== -1) {
        code = code.slice(funcStart + 1, funcEnd);
    }

    // Extract import mappings from webpack comments/imports
    // e.g. /* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
    const importMap = new Map();
    const importRegex = /\/\* harmony import \*\/ var (\w+) = __webpack_require__\(\/\*! ([^*]+) \*\/\s*"([^"]+)"\);/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
        const varName = match[1];
        let reqPath = match[2].trim();
        let actualModule = match[3];

        let cleanImport = reqPath;
        if (reqPath.startsWith('./node_modules/')) {
            const parts = reqPath.replace('./node_modules/', '').split('/');
            cleanImport = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
        } else if (reqPath.startsWith('@/')) {
            cleanImport = reqPath;
        }

        importMap.set(varName, {
            varName,
            cleanImport,
            usedDefault: false,
            usedNamed: new Set()
        });
    }

    // Extract exports
    // /* harmony export */ __webpack_require__.d(__webpack_exports__, {
    // /* harmony export */   "default": () => (/* binding */ Logo),
    // /* harmony export */   LogoMark: () => (/* binding */ LogoMark)
    // /* harmony export */ });
    const exportMap = new Map();
    const exportBlockMatch = code.match(/\/\* harmony export \*\/ __webpack_require__\.d\(__webpack_exports__,\s*\{([\s\S]*?)\}\);/);
    if (exportBlockMatch) {
        const block = exportBlockMatch[1];
        const itemRegex = /["']?([\w-]+)["']?:\s*\(\)\s*=>\s*\(\/\* binding \*\/\s*(\w+)\)/g;
        let em;
        while ((em = itemRegex.exec(block)) !== null) {
            exportMap.set(em[1], em[2]);
        }
    }

    const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx']
    });

    // Replace webpack imported modules
    traverse(ast, {
        MemberExpression(p) {
            if (t.isIdentifier(p.node.object) && importMap.has(p.node.object.name)) {
                const info = importMap.get(p.node.object.name);
                if (p.node.computed && t.isStringLiteral(p.node.property, { value: 'default' })) {
                    // It's varName["default"]
                    info.usedDefault = true;
                    // Compute a default identifier name
                    let defId = info.cleanImport.replace(/[^a-zA-Z0-9]/g, '_');
                    if (info.cleanImport === 'react') defId = 'React';
                    else if (info.cleanImport === 'lenis') defId = 'Lenis';
                    else if (info.cleanImport === 'axios') defId = 'axios';
                    else if (info.cleanImport.startsWith('@/components/')) defId = info.cleanImport.split('/').pop().replace(/\.\w+$/, '');
                    else if (info.cleanImport.startsWith('@/pages/')) defId = info.cleanImport.split('/').pop().replace(/\.\w+$/, '');
                    info.defaultIdentifier = defId;
                    p.replaceWith(t.jsxIdentifier(defId));
                } else if (!p.node.computed && t.isIdentifier(p.node.property)) {
                    // It's varName.named
                    const propName = p.node.property.name;
                    if (info.cleanImport === 'react_jsx_dev_runtime' || propName === 'jsxDEV') {
                        // ignore, will be handled by JSX converter
                    } else if (info.cleanImport === 'framer-motion' && propName === 'motion') {
                        info.usedNamed.add('motion');
                        p.replaceWith(t.jsxMemberExpression(t.jsxIdentifier('motion'), t.jsxIdentifier(p.parent.property ? p.parent.property.name : '')));
                    } else {
                        info.usedNamed.add(propName);
                        p.replaceWith(t.jsxIdentifier(propName));
                    }
                }
            }
        },
        CallExpression: {
            exit(p) {
                // If callee is hook signature helper _s(), remove or noop
                if (t.isIdentifier(p.node.callee) && (p.node.callee.name === '_s' || p.node.callee.name === '_s2' || p.node.callee.name === '_c' || p.node.callee.name === '_c2')) {
                    p.remove();
                    return;
                }
                convertJsxDev(p);
            }
        }
    });

    // Filter top-level statements to remove Webpack / Fast Refresh boilerplate
    ast.program.body = ast.program.body.filter(stmt => {
        if (t.isExpressionStatement(stmt)) {
            const expr = stmt.expression;
            if (t.isCallExpression(expr)) {
                // __webpack_require__.r
                if (t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.object, { name: '__webpack_require__' })) {
                    return false;
                }
                // __webpack_require__.$Refresh$
                if (t.isMemberExpression(expr.callee) && t.isMemberExpression(expr.callee.object) && t.isIdentifier(expr.callee.object.property, { name: '$Refresh$' })) {
                    return false;
                }
                // $ReactRefreshModuleRuntime$
                if (t.isIdentifier(expr.callee, { name: '$ReactRefreshModuleRuntime$' })) {
                    return false;
                }
                // _s()
                if (t.isIdentifier(expr.callee) && (expr.callee.name.startsWith('_s') || expr.callee.name.startsWith('_c'))) {
                    return false;
                }
            }
            if (t.isSequenceExpression(expr)) {
                return false;
            }
        }
        if (t.isVariableDeclaration(stmt)) {
            const dec = stmt.declarations[0];
            if (dec && t.isIdentifier(dec.id)) {
                const name = dec.id.name;
                if (name.includes('__WEBPACK_IMPORTED_MODULE') || name === '_jsxFileName' || name === '_s' || name === '_s2' || name === '_c' || name === '_c2' || name.startsWith('$ReactRefresh') || name.startsWith('__react_refresh')) {
                    return false;
                }
            }
        }
        if (t.isFunctionDeclaration(stmt)) {
            if (stmt.id.name === '$ReactRefreshModuleRuntime$') return false;
        }
        if (t.isIfStatement(stmt)) {
            if (t.isBinaryExpression(stmt.test) && t.isUnaryExpression(stmt.test.left, { operator: 'typeof' }) && t.isIdentifier(stmt.test.left.argument, { name: 'Promise' })) {
                return false;
            }
        }
        return true;
    });

    // Build standard ES imports to prepend
    const importStatements = [];
    for (const [varName, info] of importMap.entries()) {
        if (info.cleanImport === 'react/jsx-dev-runtime') continue;

        let importSource = info.cleanImport;
        // Fix relative imports: @/ -> src/
        if (importSource.startsWith('@/')) {
            // Replace with relative path or keep @/ if supported
            // Vite handles '@/...' with resolve.alias, let's keep '@/...'
        }

        const specifiers = [];
        if (info.usedDefault && info.defaultIdentifier) {
            specifiers.push(t.importDefaultSpecifier(t.identifier(info.defaultIdentifier)));
        }
        for (const named of info.usedNamed) {
            specifiers.push(t.importSpecifier(t.identifier(named), t.identifier(named)));
        }

        if (specifiers.length > 0) {
            importStatements.push(t.importDeclaration(specifiers, t.stringLiteral(importSource)));
        }
    }

    ast.program.body.unshift(...importStatements);

    // Build standard exports to append
    for (const [expName, localName] of exportMap.entries()) {
        if (expName === 'default') {
            ast.program.body.push(t.exportDefaultDeclaration(t.identifier(localName)));
        } else {
            ast.program.body.push(t.exportNamedDeclaration(null, [
                t.exportSpecifier(t.identifier(localName), t.identifier(expName))
            ]));
        }
    }

    const result = generate(ast, {
        retainLines: false,
        comments: false
    });

    return result.code;
}

console.log('Decompiler initialized!');
