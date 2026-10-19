const fs = require('fs');

const ENTITY_PATTERN = /<!ENTITY\s+(\w+)\s+(SYSTEM\s+)?"([^"]*)"\s*>/g;
const DOCTYPE_PATTERN = /<!DOCTYPE[^\[>]*\[([\s\S]*?)\]\s*>/;
const PRODUCT_PATTERN = /<product>([\s\S]*?)<\/product>/g;

async function resolveExternal(uri) {
  if (/^https?:\/\//i.test(uri)) {
    const resp = await fetch(uri);
    return await resp.text();
  }
  const filePath = uri.replace(/^file:\/\//i, '');
  return fs.readFileSync(filePath, 'utf8');
}

async function collectEntities(xml) {
  const entities = {};
  const doctype = xml.match(DOCTYPE_PATTERN);
  if (!doctype) return entities;

  const subset = doctype[1];
  let match;
  ENTITY_PATTERN.lastIndex = 0;
  while ((match = ENTITY_PATTERN.exec(subset)) !== null) {
    const [, name, isSystem, value] = match;
    if (isSystem) {
      entities[name] = await resolveExternal(value);
    } else {
      entities[name] = value;
    }
  }
  return entities;
}

function expand(text, entities) {
  let output = text;
  for (let pass = 0; pass < 4; pass++) {
    let changed = false;
    output = output.replace(/&(\w+);/g, (whole, name) => {
      if (Object.prototype.hasOwnProperty.call(entities, name)) {
        changed = true;
        return entities[name];
      }
      return whole;
    });
    if (!changed) break;
  }
  return output;
}

function childText(block, tag) {
  const m = block.match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>'));
  return m ? m[1].trim() : '';
}

async function parseProductFeed(xml) {
  const entities = await collectEntities(xml);
  const body = expand(xml.replace(DOCTYPE_PATTERN, ''), entities);

  const products = [];
  let match;
  PRODUCT_PATTERN.lastIndex = 0;
  while ((match = PRODUCT_PATTERN.exec(body)) !== null) {
    const block = match[1];
    products.push({
      name: childText(block, 'name'),
      origin: childText(block, 'origin'),
      roast: childText(block, 'roast'),
      category: childText(block, 'category'),
      price_cents: parseInt(childText(block, 'price_cents'), 10) || 0,
      tasting: childText(block, 'tasting'),
      description: childText(block, 'description')
    });
  }
  return products;
}

module.exports = { parseProductFeed };
