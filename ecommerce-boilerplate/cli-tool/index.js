#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

program
  .version('1.0.0')
  .description('CLI to add new modules to the e-commerce microservices project');

program
  .command('add-module')
  .description('Add a new module to the project')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'moduleName',
        message: 'What is the name of the new module?',
        validate: input => {
          if (!/^[A-Za-z][A-Za-z0-9]*$/.test(input.trim())) {
            return 'Use letters and digits only, starting with a letter (e.g. Wishlist)';
          }
          const dir = path.join(__dirname, '..', 'services', `${input.trim().toLowerCase()}-service`);
          return !fs.existsSync(dir) || `services/${input.trim().toLowerCase()}-service already exists`;
        }
      },
      {
        type: 'input',
        name: 'port',
        message: 'Host port to publish the service on (3000 = not published)?',
        default: '3000',
        validate: input => (Number.isInteger(Number(input)) && Number(input) > 0 && Number(input) < 65536) || 'Port must be a number between 1 and 65535'
      }
    ]);

    const moduleName = answers.moduleName.trim();
    const port = String(answers.port).trim();
    const moduleNameLower = moduleName.toLowerCase();

    // Check everything that could fail before writing any file, so a failed
    // run never leaves the project half-modified.
    const serviceDir = path.join(__dirname, '..', 'services', `${moduleNameLower}-service`);
    const apiGatewayPath = path.join(__dirname, '..', 'api-gateway', 'src', 'routes', 'route.js');
    const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
    if (await fs.pathExists(serviceDir)) {
      throw new Error(`services/${moduleNameLower}-service already exists`);
    }
    const compose = yaml.load(await fs.readFile(dockerComposePath, 'utf8'));
    if (compose.services[`${moduleNameLower}-service`]) {
      throw new Error(`${moduleNameLower}-service is already defined in docker-compose.yml`);
    }
    const gatewayContent = await fs.readFile(apiGatewayPath, 'utf8');
    if (gatewayContent.includes(`'/api/${moduleNameLower}s'`)) {
      throw new Error(`The gateway already routes /api/${moduleNameLower}s`);
    }
    const updatedGatewayContent = addApiGatewayRoute(gatewayContent, moduleNameLower);

    // Create service directory
    await fs.ensureDir(serviceDir);

    // Create directory structure
    const dirs = [
      'src/controllers',
      'src/models',
      'src/routes',
      'src/middleware',
      'src/utils',
      'src/config',
      'tests/integration'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(serviceDir, dir));
    }

    // Create basic files
    await fs.writeFile(path.join(serviceDir, 'Dockerfile'), createDockerfile());
    await fs.writeFile(path.join(serviceDir, 'package.json'), createPackageJson(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, '.env'), createEnvFile(moduleNameLower, port));
    await fs.writeFile(path.join(serviceDir, '.gitignore'), createGitignore());
    
    // Create source files
    await fs.writeFile(path.join(serviceDir, 'src', 'app.js'), createAppJs(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, 'src', 'server.js'), createServerJs());
    await fs.writeFile(path.join(serviceDir, 'src/models', `${moduleNameLower}.model.js`), createModel(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, 'src/routes', `${moduleNameLower}.routes.js`), createRoutes(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, 'src/controllers', `${moduleNameLower}.controller.js`), createController(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, 'src/middleware', 'auth.middleware.js'), createAuthMiddleware());
    await fs.writeFile(path.join(serviceDir, 'src/middleware', 'error.middleware.js'), createErrorMiddleware());
    await fs.writeFile(path.join(serviceDir, 'src/utils', 'logger.js'), createLogger());
    await fs.writeFile(path.join(serviceDir, 'src/config', 'database.js'), createDatabaseConfig());

    // Create test files
    await fs.writeFile(path.join(serviceDir, 'tests/integration', `${moduleNameLower}.test.js`), createIntegrationTest(moduleNameLower));

    // The Dockerfile installs with `npm ci`, which needs a lockfile.
    try {
      execSync('npm install --package-lock-only --no-audit --no-fund', { cwd: serviceDir, stdio: 'ignore' });
    } catch (error) {
      console.warn(`Could not create package-lock.json; run "npm install" in ${serviceDir} before building the image.`);
    }

    // Update docker-compose.yml
    await updateDockerCompose(moduleNameLower, port);

    // Update API Gateway
    await fs.writeFile(apiGatewayPath, updatedGatewayContent);

    console.log(`Module ${moduleName} has been successfully added!`);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});

function createDockerfile() {
  return `FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Run as the unprivileged user that the node image provides.
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]`;
}

function createPackageJson(moduleName) {
  return `{
  "name": "${moduleName}-service",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^8.24.8",
    "dotenv": "^10.0.0",
    "jsonwebtoken": "^9.0.2",
    "winston": "^3.14.2"
  },
  "devDependencies": {
    "jest": "29.7.0",
    "supertest": "7.3.1"
  },
  "jest": {
    "testEnvironment": "node"
  }
}`;
}

function createEnvFile(moduleName, port) {
  return `# The container always listens on 3000; the gateway proxies to it.
PORT=3000
MONGODB_URI=mongodb://mongo:27017/${moduleName}-service
# Set the same secret as the other services (see ../../.env.example).
JWT_SECRET=`;
}

function createGitignore() {
  return `node_modules
.env
*.log`;
}

function createAppJs(moduleName) {
  return `const express = require('express');
const mongoose = require('mongoose');
const ${moduleName}Routes = require('./routes/${moduleName}.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

// Liveness: the process answers. Readiness: MongoDB is connected as well.
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ok: ready });
});

app.use('/', ${moduleName}Routes);

app.use(errorMiddleware);

module.exports = app;`;
}

function createServerJs() {
  return `require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => logger.info(\`Server running on port \${PORT}\`));`;
}

function createModel(moduleName) {
  const moduleNameCapitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `const mongoose = require('mongoose');

const ${moduleName}Schema = new mongoose.Schema({
  // Define your schema here
}, { timestamps: true });

module.exports = mongoose.model('${moduleNameCapitalized}', ${moduleName}Schema);`;
}

function createRoutes(moduleName) {
  return `const express = require('express');
const router = express.Router();
const ${moduleName}Controller = require('../controllers/${moduleName}.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, ${moduleName}Controller.create);
router.get('/', ${moduleName}Controller.getAll);
router.get('/:id', ${moduleName}Controller.getById);
router.put('/:id', authMiddleware, ${moduleName}Controller.update);
router.delete('/:id', authMiddleware, ${moduleName}Controller.delete);

module.exports = router;`;
}

function createController(moduleName) {
  const moduleNameCapitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `const ${moduleNameCapitalized} = require('../models/${moduleName}.model');
const logger = require('../utils/logger');

exports.create = async (req, res, next) => {
  try {
    const new${moduleNameCapitalized} = new ${moduleNameCapitalized}(req.body);
    const saved${moduleNameCapitalized} = await new${moduleNameCapitalized}.save();
    res.status(201).json(saved${moduleNameCapitalized});
  } catch (error) {
    logger.error('Error in create ${moduleName}:', error);
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const ${moduleName}s = await ${moduleNameCapitalized}.find();
    res.json(${moduleName}s);
  } catch (error) {
    logger.error('Error in getAll ${moduleName}s:', error);
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const ${moduleName} = await ${moduleNameCapitalized}.findById(req.params.id);
    if (!${moduleName}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json(${moduleName});
  } catch (error) {
    logger.error('Error in getById ${moduleName}:', error);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated${moduleNameCapitalized} = await ${moduleNameCapitalized}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated${moduleNameCapitalized}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json(updated${moduleNameCapitalized});
  } catch (error) {
    logger.error('Error in update ${moduleName}:', error);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted${moduleNameCapitalized} = await ${moduleNameCapitalized}.findByIdAndDelete(req.params.id);
    if (!deleted${moduleNameCapitalized}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json({ message: '${moduleNameCapitalized} deleted successfully' });
  } catch (error) {
    logger.error('Error in delete ${moduleName}:', error);
    next(error);
  }
};`;
}

function createAuthMiddleware() {
  return `const jwt = require('jsonwebtoken');

// A missing secret stops the service at startup instead of failing every request.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { id: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};`;
}

function createErrorMiddleware() {
  return `const logger = require('../utils/logger');

// Logs every error. Clients get the message only for their own mistakes (4xx).
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error(err.stack || String(err));

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: statusCode < 500 ? err.message : 'Internal Server Error',
  });
};

module.exports = errorMiddleware;`;
}

function createLogger() {
  return `const winston = require('winston');

// Logs go to stdout only: containers collect stdout, and the app folder is read-only.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

module.exports = logger;`;
}

function createDatabaseConfig() {
  return `const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Stops the process when MongoDB cannot be reached at startup, so the
// container platform restarts it instead of serving errors.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(\`MongoDB connection error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = connectDB;`;
}

function createIntegrationTest(moduleName) {
  return `process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const app = require('../../src/app');

describe('${moduleName} API', () => {
  it('rejects writes without a token', async () => {
    const res = await request(app).post('/').send({});
    expect(res.status).toBe(401);
  });

  // Add tests for your endpoints here. Mock the Mongoose model with
  // jest.mock('../../src/models/${moduleName}.model') to run without a database.
});
`;
}

async function updateDockerCompose(moduleName, port) {
  const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
  let dockerComposeContent = await fs.readFile(dockerComposePath, 'utf8');
  
  // Parse the existing docker-compose.yml
  const dockerCompose = yaml.load(dockerComposeContent);

  // Add the new service
  dockerCompose.services[`${moduleName}-service`] = {
    build: `./services/${moduleName}-service`,
    restart: 'unless-stopped',
    environment: {
      JWT_SECRET: '${JWT_SECRET:?Set JWT_SECRET in .env (openssl rand -hex 32)}',
      MONGODB_URI: `mongodb://mongo:27017/${moduleName}-service`,
    },
    depends_on: { mongo: { condition: 'service_healthy' } },
    healthcheck: {
      test: ['CMD', 'node', '-e', "fetch('http://127.0.0.1:3000/ready').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"],
      interval: '10s',
      timeout: '3s',
      retries: 6,
      start_period: '10s',
    },
  };

  // If a specific port was provided, publish it on this machine only.
  if (port !== '3000') {
    dockerCompose.services[`${moduleName}-service`].ports = [`127.0.0.1:${port}:3000`];
  }

  // The gateway waits until the new service is healthy.
  const gateway = dockerCompose.services['api-gateway'];
  if (gateway) {
    gateway.depends_on = { ...(gateway.depends_on || {}), [`${moduleName}-service`]: { condition: 'service_healthy' } };
  }

  // Convert the updated object back to YAML
  const updatedDockerComposeContent = yaml.dump(dockerCompose, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    noCompatMode: true
  });

  const formattedYaml = updatedDockerComposeContent.replace(/^(\S.*):$/gm, (match, p1) => {
    return `\n${match}`;
  });

  // Write the updated content back to the file
  await fs.writeFile(dockerComposePath, formattedYaml, 'utf8');
}

function addApiGatewayRoute(content, moduleName) {
  const marker = '\n];\n\nfor (const [path, target] of routes)';
  if (!content.includes(marker)) {
    throw new Error('Could not find the routes table in api-gateway/src/routes/route.js');
  }
  const envName = `${moduleName.toUpperCase()}_SERVICE_URL`;
  const entry = `\n  ['/api/${moduleName}s', process.env.${envName} || 'http://${moduleName}-service:3000'],`;
  return content.replace(marker, entry + marker);
}
