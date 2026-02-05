import esbuild from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');
// Get specific feature from args (skip node executable and script path)
const specificFeature = process.argv.slice(2).find(arg => !arg.startsWith('--'));

// Discover all features in src/
const srcDir = join(process.cwd(), 'src');
const allItems = readdirSync(srcDir);
const features = allItems
  .filter(item => {
    const itemPath = join(srcDir, item);
    try {
      return statSync(itemPath).isDirectory();
    } catch (e) {
      return false;
    }
  })
  .filter(feature => !specificFeature || feature === specificFeature);

if (features.length === 0) {
  console.error('No features found in src/');
  process.exit(1);
}

// Build configuration for each feature
const buildConfigs = features.map(feature => ({
  entryPoints: [join(process.cwd(), `src/${feature}/index.ts`)],
  bundle: true,
  format: 'iife',
  outfile: join(process.cwd(), `dist/heard-${feature}.js`),
  target: 'es2020',
  minify: !isWatch,
  sourcemap: isWatch,
  banner: {
    js: `/* Heard Custom Code - ${feature} */`
  }
}));

const build = async () => {
  try {
    if (isWatch) {
      const contexts = await Promise.all(
        buildConfigs.map(config => esbuild.context(config))
      );
      
      await Promise.all(contexts.map(ctx => ctx.watch()));
      console.log(`Watching ${features.length} feature(s): ${features.join(', ')}`);
    } else {
      await Promise.all(
        buildConfigs.map(config => esbuild.build(config))
      );
      console.log(`Built ${features.length} feature(s): ${features.join(', ')}`);
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

build();
