const fs = require('fs');
let itemsTsx = fs.readFileSync('src/pages/Items.tsx', 'utf-8');

itemsTsx = itemsTsx.replace(
  /<td className="px-6 py-4 font-medium text-indigo-900">\{item\.model\}<\/td>\s*<td className="px-6 py-4">\{item\.brandName\}<\/td>\s*<td className="px-6 py-4 truncate max-w-\[200px\]" title=\{item\.name\}>\{item\.name\}<\/td>\s*<td className="px-6 py-4">\{item\.categoryName\}<\/td>/,
  '<td className="px-6 py-4 font-medium text-slate-900">{item.categoryName}</td>\n                    <td className="px-6 py-4">{item.brandName}</td>\n                    <td className="px-6 py-4 font-medium text-indigo-900">{item.model}</td>\n                    <td className="px-6 py-4 truncate max-w-[200px]" title={item.name}>{item.name}</td>'
);
itemsTsx = itemsTsx.replace(/colSpan=\{9\}/g, "colSpan={8}");

fs.writeFileSync('src/pages/Items.tsx', itemsTsx);
