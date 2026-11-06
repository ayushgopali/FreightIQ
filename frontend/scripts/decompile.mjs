import fs from 'fs';
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

const raw = fs.readFileSync('C:/Users/Anirudh/.gemini/antigravity/brain/5abefc25-ce1e-4bf1-867a-d9ec32d001b0/scratch/extracted_futura/components_Logo.jsx', 'utf-8');
let code = raw;
if (code.startsWith('// MODULE:')) {
    code = code.substring(code.indexOf('\n') + 1);
}
const funcStart = code.indexOf('{');
const funcEnd = code.lastIndexOf('}');
if (funcStart !== -1 && funcEnd !== -1) {
    code = code.slice(funcStart + 1, funcEnd);
}

const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
});

traverse(ast, {
    CallExpression: {
        exit(p) {
            convertJsxDev(p);
        }
    }
});

const output = generate(ast, {}, code);
console.log('--- GENERATED JSX SNIPPET (1000..2500) ---');
console.log(output.code.substring(1000, 2500));
