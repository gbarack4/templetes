import type { WebsiteIntegrations } from "./types";

export async function insertCustomCode(
  snippets: WebsiteIntegrations["customCode"],
  installed: Set<string>,
): Promise<void> {
  const ordered = [...snippets].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );

  const bodyStart = document.createComment("school custom code");
  document.body.prepend(bodyStart);

  try {
    await runSequentially(ordered, (snippet) =>
      insertSnippet(snippet, installed, bodyStart),
    );
  } finally {
    bodyStart.remove();
  }
}

async function insertSnippet(
  snippet: WebsiteIntegrations["customCode"][number],
  installed: Set<string>,
  bodyStart: Comment,
): Promise<void> {
  if (installed.has(snippet.id)) return;
  installed.add(snippet.id);

  try {
    const { template, scripts } = parseSnippet(snippet.code);

    switch (snippet.placement) {
      case "head":
        document.head.append(template.content);
        break;
      case "body_start":
        bodyStart.before(template.content);
        break;
      case "body_end":
        document.body.append(template.content);
        break;
    }

    await runSequentially(scripts, ({ script, marker }) =>
      activateScript(script, marker),
    );
  } catch {
    console.warn("A website custom code snippet could not be loaded.");
  }
}

function runSequentially<T>(
  items: readonly T[],
  action: (item: T) => Promise<void>,
): Promise<void> {
  let sequence = Promise.resolve();

  for (const item of items) {
    sequence = sequence.then(() => action(item));
  }

  return sequence;
}

function parseSnippet(code: string) {
  const template = document.createElement("template");
  template.innerHTML = code;
  const scripts: { script: HTMLScriptElement; marker: Comment }[] = [];
  for (const inert of template.content.querySelectorAll("script")) {
    const script = document.createElement("script");
    for (const attr of inert.attributes)
      script.setAttribute(attr.name, attr.value);
    script.textContent = inert.textContent;
    const marker = document.createComment("custom script");
    inert.replaceWith(marker);
    scripts.push({ script, marker });
  }
  return { template, scripts };
}

function activateScript(
  script: HTMLScriptElement,
  marker: Comment,
): Promise<void> {
  if (!script.src || script.hasAttribute("async")) {
    marker.replaceWith(script);
    return Promise.resolve();
  } 
  script.async = false;
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 5000);
    const done = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", done, { once: true });
    marker.replaceWith(script);
  });
}
