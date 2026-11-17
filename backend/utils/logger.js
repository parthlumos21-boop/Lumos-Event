/**
 * Lumos Terminal Process Logger
 * Provides colorized, timestamped, formatted logging in the backend terminal
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

const getTimestamp = () => {
  const now = new Date();
  return `${colors.dim}[${now.toLocaleTimeString()}]${colors.reset}`;
};

const logger = {
  info: (tag, message, details = null) => {
    console.log(
      `${getTimestamp()} ${colors.cyan}${colors.bright}[${tag}]${colors.reset} ${message}`
    );
    if (details) {
      console.log(`${colors.dim}  ↳ Details: ${JSON.stringify(details)}${colors.reset}`);
    }
  },

  success: (tag, message, details = null) => {
    console.log(
      `${getTimestamp()} ${colors.green}${colors.bright}[✓ ${tag}]${colors.reset} ${colors.green}${message}${colors.reset}`
    );
    if (details) {
      console.log(`${colors.dim}  ↳ Details: ${JSON.stringify(details)}${colors.reset}`);
    }
  },

  warn: (tag, message, details = null) => {
    console.log(
      `${getTimestamp()} ${colors.yellow}${colors.bright}[⚠ ${tag}]${colors.reset} ${colors.yellow}${message}${colors.reset}`
    );
    if (details) {
      console.log(`${colors.dim}  ↳ Details: ${JSON.stringify(details)}${colors.reset}`);
    }
  },

  error: (tag, message, err = null) => {
    console.error(
      `${getTimestamp()} ${colors.red}${colors.bright}[✕ ${tag}]${colors.reset} ${colors.red}${message}${colors.reset}`
    );
    if (err) {
      console.error(`${colors.red}  ↳ Error: ${err.message || err}${colors.reset}`);
    }
  },

  form: (title, guestData) => {
    console.log('\n' + colors.cyan + '════════════════════════════════════════════════════════════════' + colors.reset);
    console.log(`${getTimestamp()} ${colors.bgCyan}${colors.white}${colors.bright} [GUEST FORM CREATION] ${colors.reset} ${colors.cyan}${title}${colors.reset}`);
    console.log(`  ${colors.bright}Name:${colors.reset}     ${guestData.name || 'N/A'}`);
    console.log(`  ${colors.bright}Mobile:${colors.reset}   +91 ${guestData.phone || 'N/A'}`);
    console.log(`  ${colors.bright}Email:${colors.reset}    ${guestData.email || 'None'}`);
    console.log(`  ${colors.bright}Interest:${colors.reset} ${(guestData.interests || []).join(', ') || 'General'}`);
    console.log(`  ${colors.bright}Rating:${colors.reset}   ${guestData.rating ? '★'.repeat(guestData.rating) : 'N/A'}`);
    console.log(`  ${colors.bright}Creator:${colors.reset}  ${guestData.createdBy?.role || 'guest'} (${guestData.createdBy?.email || 'public'})`);
    console.log(colors.cyan + '════════════════════════════════════════════════════════════════\n' + colors.reset);
  },

  user: (title, userData, status = 'SUCCESS') => {
    const isSuccess = status === 'SUCCESS';
    const tagColor = isSuccess ? colors.bgGreen : colors.bgRed;
    const barColor = isSuccess ? colors.green : colors.red;
    console.log('\n' + barColor + '────────────────────────────────────────────────────────────────' + colors.reset);
    console.log(`${getTimestamp()} ${tagColor}${colors.white}${colors.bright} [USER / EMPLOYEE MANAGEMENT] ${colors.reset} ${colors.bright}${title}${colors.reset}`);
    console.log(`  ${colors.bright}Name:${colors.reset}       ${userData.name || 'N/A'}`);
    console.log(`  ${colors.bright}Email:${colors.reset}      ${userData.email || 'N/A'}`);
    console.log(`  ${colors.bright}Role:${colors.reset}       ${userData.role || 'employee'}`);
    console.log(`  ${colors.bright}Department:${colors.reset} ${userData.department || 'General'}`);
    console.log(`  ${colors.bright}Status:${colors.reset}     ${isSuccess ? colors.green + 'CREATED IN MONGODB' : colors.red + 'FAILED: ' + userData.reason}${colors.reset}`);
    console.log(barColor + '────────────────────────────────────────────────────────────────\n' + colors.reset);
  }
};

module.exports = logger;
