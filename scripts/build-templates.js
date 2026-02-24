const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'templates.json');

function parseTemplate(text, filePath) {
  try {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    const frontMatch = cleanText.match(/^---\s+([\s\S]*?)\s+---/);
    if (!frontMatch) return null;

    const frontmatter = frontMatch[1];
    const meta = {};

    frontmatter.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join(':').trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        meta[key] = value;
      }
    });

    // Category
    let category = 'professional';
    const rawCat = (meta.category || '').toLowerCase();
    if (rawCat.includes('studio')) category = 'studio';
    else if (rawCat.includes('viral')) category = 'viral';
    else if (rawCat.includes('productivity') || rawCat.includes('source-management')) category = 'productivity';
    else if (rawCat.includes('learning')) category = 'learning';
    else if (rawCat.includes('critical-analysis')) category = 'critical-analysis';
    else if (rawCat.includes('troubleshooting')) category = 'troubleshooting';
    else if (rawCat.includes('data-engineering')) category = 'data-engineering';
    else if (rawCat.includes('advanced-techniques')) category = 'professional';
    else if (rawCat.includes('professional')) category = 'professional';

    // Level
    let level = 'intermediate';
    const rawDiff = (meta.difficulty || '').toLowerCase();
    if (rawDiff.includes('beginner')) level = 'beginner';
    else if (rawDiff.includes('advanced')) level = 'advanced';

    // Format
    let format = 'text-chat';
    const rawFormat = (meta.format || meta.subcategory || '').toLowerCase();
    const lcPath = filePath.toLowerCase().replace(/\\/g, '/');
    if (rawFormat.includes('slide') || lcPath.includes('slide-deck')) format = 'slide-deck';
    else if (rawFormat.includes('audio') || rawFormat.includes('brief') || rawFormat.includes('deep_dive') || rawFormat.includes('critique') || rawFormat.includes('debate') || lcPath.includes('audio')) format = 'audio-overview';
    else if (rawFormat.includes('video') || rawFormat.includes('explainer') || lcPath.includes('video')) format = 'video-overview';
    else if (rawFormat.includes('infographic') || lcPath.includes('infographic')) format = 'infographic';
    else if (rawFormat.includes('configure-chat') || lcPath.includes('configure-chat')) format = 'configure-chat';
    else if (rawFormat.includes('flashcard') || lcPath.includes('flashcard')) format = 'flashcards';
    else if (rawFormat.includes('quiz') || lcPath.includes('quiz')) format = 'quiz';
    else if (rawFormat.includes('data-table') || rawFormat.includes('data_table') || lcPath.includes('data-table')) format = 'data-table';
    else if (rawFormat.includes('report') || lcPath.includes('report')) format = 'report';
    else if (rawFormat.includes('chat') || lcPath.includes('text-chat')) format = 'text-chat';

    // Prompt extraction
    let promptContent = '';

    // Strategy 1: Explicit "## Prompt" or "## Steering Prompt"
    // Find the heading, then extract the FIRST code block after it.
    // We use indexOf instead of a section-capture regex so that ## sub-headers
    // inside the code block content (e.g. ## Position A, ## Synthesis) do not
    // prematurely terminate the capture.
    const promptHeadingMatch = cleanText.match(/^##\s+(?:Prompt|Steering Prompt)(?: Template)?/im);
    if (promptHeadingMatch) {
      const afterHeading = cleanText.slice(promptHeadingMatch.index + promptHeadingMatch[0].length);
      const codeBlock = afterHeading.match(/```(?:[a-z]*)?\n([\s\S]*?)\n```/);
      if (codeBlock) {
        promptContent = codeBlock[1].trim();
      } else {
        // No code fence — take text until the next top-level heading
        const rawSection = afterHeading.match(/^([\s\S]*?)(?=\n## |\n# |$)/);
        promptContent = rawSection ? rawSection[1].trim() : afterHeading.trim();
      }
    }

    // Strategy 2: Video with Split Sections
    if (!promptContent && format === 'video-overview') {
      const styleMatch = cleanText.match(/## (?:Style visuel|Visual Style)[\s\S]*?```(?:text)?\n([\s\S]*?)\n```/i);
      const focusMatch = cleanText.match(/## (?:Focus IA|AI Focus)[\s\S]*?```(?:text)?\n([\s\S]*?)\n```/i);
      const parts = [];
      if (styleMatch) parts.push(`[VISUAL STYLE]\n${styleMatch[1].trim()}`);
      if (focusMatch) parts.push(`[AI FOCUS]\n${focusMatch[1].trim()}`);
      if (parts.length > 0) promptContent = parts.join('\n\n');
    }

    // Strategy 3: Any first code block
    if (!promptContent) {
      const firstCodeBlock = cleanText.match(/```(?:text|markdown|yaml)?\n([\s\S]*?)\n```/);
      if (firstCodeBlock) promptContent = firstCodeBlock[1].trim();
    }

    // Strategy 4: Fallback
    if (!promptContent) {
      promptContent = meta.description || meta.use_case || 'No specific prompt content found.';
    }

    return {
      id: filePath.replace(/\\/g, '/'),
      title: meta.name || 'Untitled Template',
      level,
      category,
      format,
      description: meta.use_case || meta.description || '',
      prompt: promptContent,
      settings: `Source: ${meta.source || 'Library'}`,
      isUserDefined: false,
    };
  } catch (e) {
    console.warn('Failed to parse:', filePath, e.message);
    return null;
  }
}

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (file.endsWith('.md')) {
      results.push(filePath);
    }
  });
  return results;
}

// Main — walk each language subdirectory separately so we can tag `lang`
const LANGS = ['en', 'hu'];
const templates = [];

for (const lang of LANGS) {
  const langDir = path.join(TEMPLATES_DIR, lang);
  if (!fs.existsSync(langDir)) {
    console.warn(`Language directory not found, skipping: ${langDir}`);
    continue;
  }
  const files = walkDir(langDir);
  console.log(`[${lang}] Found ${files.length} template files`);

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf-8');
    // id = path relative to the language dir (e.g. "configure-chat/business-strategist.md")
    const relPath = path.relative(langDir, file).replace(/\\/g, '/');
    const parsed = parseTemplate(text, relPath);
    if (parsed) {
      parsed.lang = lang;
      templates.push(parsed);
    } else {
      console.warn(`Skipping (no frontmatter): [${lang}] ${relPath}`);
    }
  }
}

// Ensure output dir exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(templates, null, 2), 'utf-8');
console.log(`Generated ${templates.length} templates -> ${OUTPUT_FILE}`);
