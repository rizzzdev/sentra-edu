const fs = require("fs");
const path = require("path");

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".svelte")) results.push(file);
    }
  });
  return results;
};

const processFile = (file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  const hasButton = /<button/g.test(content);
  const hasInput = /<input/g.test(content);

  if (hasButton || hasInput) {
    if (hasButton && !content.includes("import Button")) {
      content = content.replace(/<script[^>]*>/, (match) => match + "\n  import Button from '$lib/components/atoms/button.svelte';");
      modified = true;
    }
    if (hasInput && !content.includes("import Input")) {
      content = content.replace(/<script[^>]*>/, (match) => match + "\n  import Input from '$lib/components/atoms/input.svelte';");
      modified = true;
    }

    if (hasInput) {
      content = content.replace(/<input/g, "<Input");
      modified = true;
    }

    if (hasButton) {
      content = content.replace(/<button([^>]*)class="btn btn-primary([^"]*)"([^>]*)>/g, `<Button variant="primary" className="btn btn-primary$2" $1 $3>`);
      content = content.replace(/<button([^>]*)class="btn btn-outline([^"]*)"([^>]*)>/g, `<Button variant="outline" className="btn btn-outline$2" $1 $3>`);
      content = content.replace(/<button([^>]*)class="btn btn-danger([^"]*)"([^>]*)>/g, `<Button variant="danger" className="btn btn-danger$2" $1 $3>`);
      content = content.replace(/<button([^>]*)class="btn-icon([^"]*)"([^>]*)>/g, `<Button variant="outline" size="sm" className="btn-icon$2" $1 $3>`);
      content = content.replace(/<button([^>]*)class="page-btn([^"]*)"([^>]*)>/g, `<Button variant="outline" className="page-btn$2" $1 $3>`);
      
      content = content.replace(/<button([^>]*)class=([^>]*)>/g, `<Button$1className=$2>`);
      
      content = content.replace(/<button/g, "<Button");
      content = content.replace(/<\/button>/g, "</Button>");
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(file, content, "utf8");
      console.log("Updated", file);
    }
  }
};

const dir = "c:/Users/rplsm/Documents/rizzzdev/sentra-edu/src/routes/(dashboard)";
const files = walk(dir);
files.forEach(processFile);
