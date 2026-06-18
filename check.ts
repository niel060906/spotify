import { execSync } from 'child_process';
try {
  console.log('pip:', execSync('pip --version').toString());
} catch (e: any) {
  console.log('pip not found', e.message);
}
try {
  console.log('python:', execSync('python --version').toString());
} catch (e: any) {
  console.log('python not found', e.message);
}
