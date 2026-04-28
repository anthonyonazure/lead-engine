import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'lead-engine-test-'));
process.env.LEAD_ENGINE_DB = join(dir, 'test.db');
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-not-real';
