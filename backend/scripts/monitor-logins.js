// Re-writing the script to run the backend and intercept the logs directly, 
// since the current terminal is just running `npm run start` without writing to a file.
import { spawn } from 'child_process';
import path from 'path';

console.log('👀 Starting Backend & Monitoring Kyamatu SMS Logins...\n');
console.log('NOTE: Please make sure no other backend terminals are running on port 3000.\n');

// we'll run the actual node process and pipe it
const server = spawn('node', ['src/app.js'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        try {
            if (line.trim()) {
                const log = JSON.parse(line);

                // Print general errors
                if (log.level >= 50) {
                    console.error(`[ERROR] ${log.msg || 'Unknown Error'}`);
                }

                // Look for auth routes or explicit login actions
                if (log.action === 'LOGIN_ATTEMPT' || log.action === 'LOGIN_SUCCESS' || (log.req && log.req.url && log.req.url.includes('/auth/login'))) {

                    const time = new Date(log.time || Date.now()).toLocaleTimeString();
                    const email = log.email || (log.req && log.req.body && log.req.body.email) || 'Unknown User';

                    if ((log.msg && log.msg.includes('successful')) || log.action === 'LOGIN_SUCCESS' || (log.res && log.res.statusCode === 200)) {
                        console.log(`\n[${time}] ✅ SUCCESS: ${email}`);
                    } else if ((log.msg && log.msg.includes('failed')) || (log.msg && log.msg.includes('Invalid')) || log.action === 'LOGIN_ATTEMPT' || (log.res && log.res.statusCode > 299)) {
                        console.log(`\n[${time}] ❌ FAILED: ${email} - ${log.msg || 'Invalid credentials'}`);
                    } else {
                        console.log(`\n[${time}] 📝 LOGIN EVENT: ${email}`);
                    }
                }
            }
        } catch (e) {
            // Ignore parse errors from non-JSON lines
        }
    });
});

server.stderr.on('data', (data) => {
    console.error(data.toString());
});
