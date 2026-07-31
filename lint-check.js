const fs = require('fs');

try {
  const html = fs.readFileSync('index.html', 'utf8');
  const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  let hasErrors = false;

  while ((match = regex.exec(html)) !== null) {
    count++;
    // If the script tag has a src attribute, we skip parsing it since it's an external library
    const openingTag = match[0].substring(0, match[0].indexOf('>') + 1);
    if (/src=/i.test(openingTag)) {
      console.log(`Script block ${count} has src attribute, skipping compilation check.`);
      continue;
    }

    const scriptContent = match[1];
    try {
      new Function(scriptContent);
      console.log(`Script block ${count} parsed successfully (no syntax errors).`);
    } catch (err) {
      console.error(`Syntax error in script block ${count}:`, err.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('All inline scripts parsed successfully!');
  }
} catch (err) {
  console.error('Error reading index.html:', err.message);
  process.exit(1);
}
