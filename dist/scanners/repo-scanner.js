"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanRepo = scanRepo;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FRAMEWORK_SIGNALS = {
    'Next.js': ['next.config.js', 'next.config.ts', 'next.config.mjs'],
    'React': ['src/App.tsx', 'src/App.jsx', 'src/index.tsx'],
    'Vue': ['vue.config.js', 'src/App.vue'],
    'Express': ['app.js', 'server.js', 'src/app.ts', 'src/server.ts'],
    'FastAPI': ['main.py', 'app/main.py'],
    'Django': ['manage.py', 'settings.py'],
    'Flask': ['app.py', 'wsgi.py'],
    'Vite': ['vite.config.ts', 'vite.config.js'],
    'NestJS': ['nest-cli.json', 'src/main.ts'],
};
const LANG_SIGNALS = {
    'TypeScript': ['.ts', '.tsx'],
    'JavaScript': ['.js', '.jsx'],
    'Python': ['.py'],
    'Go': ['.go'],
    'Rust': ['.rs'],
    'Java': ['.java'],
    'C#': ['.cs'],
};
function scanRepo(dir) {
    const ctx = {
        tech_stack: [], entry_files: [], main_folders: [],
        framework: 'unknown', language: 'unknown',
        estimated_size: '', has_tests: false,
        has_docs: false, readme_summary: ''
    };
    // Detect framework
    for (const [fw, signals] of Object.entries(FRAMEWORK_SIGNALS)) {
        if (signals.some(s => fs_1.default.existsSync(path_1.default.join(dir, s)))) {
            ctx.framework = fw;
            ctx.tech_stack.push(fw);
            break;
        }
    }
    // Detect language by counting files
    const langCount = {};
    function countFiles(current, depth = 0) {
        if (depth > 3)
            return;
        try {
            for (const e of fs_1.default.readdirSync(current, { withFileTypes: true })) {
                if (['node_modules', '.git', 'dist', 'build'].includes(e.name))
                    continue;
                if (e.isDirectory()) {
                    countFiles(path_1.default.join(current, e.name), depth + 1);
                    continue;
                }
                const ext = path_1.default.extname(e.name);
                for (const [lang, exts] of Object.entries(LANG_SIGNALS)) {
                    if (exts.includes(ext)) {
                        langCount[lang] = (langCount[lang] || 0) + 1;
                    }
                }
            }
        }
        catch { }
    }
    countFiles(dir);
    const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];
    if (topLang) {
        ctx.language = topLang[0];
        ctx.tech_stack.push(topLang[0]);
    }
    // Main folders
    try {
        ctx.main_folders = fs_1.default.readdirSync(dir, { withFileTypes: true })
            .filter(e => e.isDirectory() &&
            !['node_modules', '.git', 'dist', 'build', '.next', 'agentos'].includes(e.name))
            .map(e => e.name)
            .slice(0, 8);
    }
    catch { }
    // Check for tests and docs
    ctx.has_tests = ['tests', 'test', '__tests__', 'spec'].some(t => fs_1.default.existsSync(path_1.default.join(dir, t)));
    ctx.has_docs = ['docs', 'documentation', 'wiki'].some(d => fs_1.default.existsSync(path_1.default.join(dir, d)));
    // Read README first 300 chars
    const readmePaths = ['README.md', 'README.txt', 'readme.md'];
    for (const rp of readmePaths) {
        const full = path_1.default.join(dir, rp);
        if (fs_1.default.existsSync(full)) {
            ctx.readme_summary = fs_1.default.readFileSync(full, 'utf8')
                .slice(0, 300).replace(/[#*`]/g, '').trim();
            break;
        }
    }
    // Size estimate
    const total = Object.values(langCount).reduce((a, b) => a + b, 0);
    ctx.estimated_size = total < 20 ? 'small' : total < 100 ? 'medium' : 'large';
    return ctx;
}
