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

function decompileFile(srcPath) {
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

    const importMap = new Map();
    const importRegex = /\/\* harmony import \*\/ var (\w+) = __webpack_require__\(\/\*! ([^*]+) \*\/\s*"([^"]+)"\);/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
        const varName = match[1];
        let reqPath = match[2].trim();

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

    traverse(ast, {
        MemberExpression(p) {
            if (t.isIdentifier(p.node.object) && importMap.has(p.node.object.name)) {
                const info = importMap.get(p.node.object.name);
                if (p.node.computed && t.isStringLiteral(p.node.property, { value: 'default' })) {
                    info.usedDefault = true;
                    let defId = info.cleanImport.replace(/[^a-zA-Z0-9]/g, '_');
                    if (info.cleanImport === 'react') defId = 'React';
                    else if (info.cleanImport === '@/components/ForecastChart') defId = 'ForecastChart';
                    else if (info.cleanImport.startsWith('@/components/')) defId = info.cleanImport.split('/').pop().replace(/\.\w+$/, '');
                    info.defaultIdentifier = defId;
                    p.replaceWith(t.jsxIdentifier(defId));
                } else if (!p.node.computed && t.isIdentifier(p.node.property)) {
                    const propName = p.node.property.name;
                    if (info.cleanImport === 'react/jsx-dev-runtime' || propName === 'jsxDEV') {
                        // ignore
                    } else {
                        info.usedNamed.add(propName);
                        p.replaceWith(t.jsxIdentifier(propName));
                    }
                }
            }
        },
        CallExpression: {
            exit(p) {
                if (t.isIdentifier(p.node.callee) && (p.node.callee.name.startsWith('_s') || p.node.callee.name.startsWith('_c'))) {
                    p.remove();
                    return;
                }
                convertJsxDev(p);
            }
        }
    });

    // Remove webpack, FastRefresh, and boilerplate
    ast.program.body = ast.program.body.filter(stmt => {
        // Direct string directives like "use strict"
        if (t.isExpressionStatement(stmt) && t.isStringLiteral(stmt.expression, { value: 'use strict' })) {
            return false;
        }
        if (t.isExpressionStatement(stmt)) {
            const expr = stmt.expression;
            if (t.isCallExpression(expr)) {
                if (t.isMemberExpression(expr.callee) && t.isIdentifier(expr.callee.object, { name: '__webpack_require__' })) return false;
                if (t.isIdentifier(expr.callee, { name: '$ReactRefreshModuleRuntime$' })) return false;
                if (t.isIdentifier(expr.callee) && (expr.callee.name.startsWith('_s') || expr.callee.name.startsWith('_c'))) return false;
            }
            if (t.isAssignmentExpression(expr)) {
                const left = expr.left;
                if (t.isMemberExpression(left)) {
                    const objStr = generate(left).code;
                    if (objStr.includes('__webpack_require__') || objStr.includes('$Refresh$')) return false;
                }
            }
            if (t.isSequenceExpression(expr)) return false;
        }
        if (t.isVariableDeclaration(stmt)) {
            const dec = stmt.declarations[0];
            if (dec && t.isIdentifier(dec.id)) {
                const name = dec.id.name;
                if (name.includes('__WEBPACK_IMPORTED_MODULE') || name === '_jsxFileName' || name.startsWith('_s') || name.startsWith('_c') || name.startsWith('$ReactRefresh') || name.startsWith('__react_refresh')) {
                    return false;
                }
            }
        }
        if (t.isFunctionDeclaration(stmt)) {
            if (stmt.id && stmt.id.name.startsWith('$ReactRefresh')) return false;
        }
        if (t.isIfStatement(stmt)) {
            const codeStr = generate(stmt).code;
            if (codeStr.includes('ReactRefresh') || codeStr.includes('$Refresh$')) return false;
        }
        return true;
    });

    // Prepend imports
    const importStatements = [];
    for (const [varName, info] of importMap.entries()) {
        if (info.cleanImport === 'react/jsx-dev-runtime') continue;

        const specifiers = [];
        if (info.usedDefault && info.defaultIdentifier) {
            specifiers.push(t.importDefaultSpecifier(t.identifier(info.defaultIdentifier)));
        }
        for (const named of info.usedNamed) {
            specifiers.push(t.importSpecifier(t.identifier(named), t.identifier(named)));
        }

        if (specifiers.length > 0) {
            importStatements.push(t.importDeclaration(specifiers, t.stringLiteral(info.cleanImport)));
        }
    }

    ast.program.body.unshift(...importStatements);

    // Append exports
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

const panels = [
    { name: 'BacktestPanel', file: 'C:/Users/Anirudh/.gemini/antigravity/brain/5abefc25-ce1e-4bf1-867a-d9ec32d001b0/scratch/extracted_futura/components_console_BacktestPanel.jsx' },
    { name: 'TimeMachinePanel', file: 'C:/Users/Anirudh/.gemini/antigravity/brain/5abefc25-ce1e-4bf1-867a-d9ec32d001b0/scratch/extracted_futura/components_console_TimeMachinePanel.jsx' },
    { name: 'DecidePanel', file: 'C:/Users/Anirudh/.gemini/antigravity/brain/5abefc25-ce1e-4bf1-867a-d9ec32d001b0/scratch/extracted_futura/components_console_DecidePanel.jsx' }
];

const targetDir = 'C:/Users/Anirudh/OneDrive/Desktop/FreightIQ/freightiq/frontend/src/components/console';

for (const panel of panels) {
    console.log(`Decompiling ${panel.name}...`);
    const cleanCode = decompileFile(panel.file);
    const targetPath = path.join(targetDir, `${panel.name}.jsx`);
    fs.writeFileSync(targetPath, cleanCode, 'utf-8');
    console.log(`Saved ${panel.name}.jsx (${cleanCode.length} bytes)`);
}
