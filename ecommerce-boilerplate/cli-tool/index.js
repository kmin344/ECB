#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

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
        validate: input => input.trim() !== '' || 'Module name cannot be empty'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Which port should this module run on?',
        default: '3000',
        validate: input => !isNaN(input) || 'Port must be a number'
      }
    ]);

    const { moduleName, port } = answers;
    const moduleNameLower = moduleName.toLowerCase();

    // Create service directory
    const serviceDir = path.join(__dirname, '..', 'services', `${moduleNameLower}-service`);
    await fs.ensureDir(serviceDir);

    // Create directory structure
    const dirs = [
      'src/controllers',
      'src/models',
      'src/routes',
      'src/middleware',
      'src/utils',
      'src/config',
      'tests/unit',
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
    await fs.writeFile(path.join(serviceDir, 'tests/unit', `${moduleNameLower}.test.js`), createUnitTest(moduleNameLower));
    await fs.writeFile(path.join(serviceDir, 'tests/integration', `${moduleNameLower}.test.js`), createIntegrationTest(moduleNameLower));

    // Update docker-compose.yml
    await updateDockerCompose(moduleNameLower, port);

    // Update API Gateway
    const apiGatewayPath = path.join(__dirname, '..', 'api-gateway', 'src', 'routes', 'route.js');
    let apiGatewayContent = await fs.readFile(apiGatewayPath, 'utf8');
    apiGatewayContent += createApiGatewayRoute(moduleNameLower);
    await fs.writeFile(apiGatewayPath, apiGatewayContent);

    console.log(`Module ${moduleName} has been successfully added!`);
  });

program.parse(process.argv);

function createDockerfile() {
  return `FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]`;
}

function createPackageJson(moduleName) {
  return `{
  "name": "${moduleName}-service",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^5.12.3",
    "dotenv": "^10.0.0",
    "jsonwebtoken": "^9.0.2",
    "winston": "^3.3.3"
  },
  "devDependencies": {
    "jest": "^27.0.6",
    "nodemon": "^2.0.12",
    "supertest": "^6.1.3"
  }
}`;
}

function createEnvFile(moduleName, port) {
  return `PORT=${port}
MONGODB_URI=mongodb://mongo:27017/${moduleName}_db
JWT_SECRET=your_jwt_secret`;
}

function createGitignore() {
  return `node_modules
.env
*.log`;
}

function createAppJs(moduleName) {
  return `const express = require('express');
const ${moduleName}Routes = require('./routes/${moduleName}.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(express.json());

app.use('/api/${moduleName}s', ${moduleName}Routes);

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

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed' });
  }
};`;
}

function createErrorMiddleware() {
  return `const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(err.stack);

  // Determine the status code
  const statusCode = err.statusCode || 500;

  // Send the error response
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;`;

function createLogger() {
  return `const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;`;
}

function createDatabaseConfig() {
  return `const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;`;
}

function createUnitTest(moduleName) {
  const moduleNameCapitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `const ${moduleNameCapitalized} = require('../../src/models/${moduleName}.model');

describe('${moduleNameCapitalized} Model Test', () => {
  // Describe your unit tests here
});`;
}

function createIntegrationTest(moduleName) {
  return `const request = require('supertest');
const app = require('../../src/app');

describe('${moduleName} API', () => {
  it('should create a new ${moduleName}', async () => {
    // Write your integration test here
  });

  // Add more integration tests for other endpoints
});`;
}

async function updateDockerCompose(moduleName, port) {
  const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
  let dockerComposeContent = await fs.readFile(dockerComposePath, 'utf8');
  
  // Parse the existing docker-compose.yml
  const dockerCompose = yaml.load(dockerComposeContent);

  // Add the new service
  dockerCompose.services[`${moduleName}-service`] = {
    build: `./services/${moduleName}-service`,
    volumes: [
      `./services/${moduleName}-service:/usr/src/app`,
      '/usr/src/app/node_modules'
    ],
    environment: [
      'JWT_SECRET=your_jwt_secret'
    ],
    depends_on: [
      'mongo'
    ]
  };

  // If a specific port was provided, add it to the service configuration
  if (port !== '3000') {
    dockerCompose.services[`${moduleName}-service`].ports = [`${port}:3000`];
  }

  // Update the api-gateway dependencies
  if (dockerCompose.services['api-gateway'] && dockerCompose.services['api-gateway'].depends_on) {
    dockerCompose.services['api-gateway'].depends_on.push(`${moduleName}-service`);
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

function createApiGatewayRoute(moduleName) {
  return `

const ${moduleName}ServiceProxy = createProxyMiddleware({
  target: 'http://${moduleName}-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/${moduleName}s': '/api/${moduleName}s',
  },
});

app.use('/api/${moduleName}s', ${moduleName}ServiceProxy);`;
}