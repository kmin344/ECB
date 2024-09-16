#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

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

    // Create basic file structure
    await fs.writeFile(path.join(serviceDir, 'Dockerfile'), createDockerfile());
    await fs.writeFile(path.join(serviceDir, 'package.json'), createPackageJson(moduleNameLower));
    
    const srcDir = path.join(serviceDir, 'src');
    await fs.ensureDir(srcDir);
    await fs.writeFile(path.join(srcDir, 'app.js'), createAppJs(moduleNameLower));
    await fs.writeFile(path.join(srcDir, `${moduleNameLower}.model.js`), createModel(moduleNameLower));
    await fs.writeFile(path.join(srcDir, `${moduleNameLower}.routes.js`), createRoutes(moduleNameLower));
    await fs.writeFile(path.join(srcDir, `${moduleNameLower}.controller.js`), createController(moduleNameLower));

    // Update docker-compose.yml
    const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');
    let dockerComposeContent = await fs.readFile(dockerComposePath, 'utf8');
    dockerComposeContent += createDockerComposeService(moduleNameLower, port);
    await fs.writeFile(dockerComposePath, dockerComposeContent);

    // Update API Gateway
    const apiGatewayPath = path.join(__dirname, '..', 'api-gateway', 'src', 'app.js');
    let apiGatewayContent = await fs.readFile(apiGatewayPath, 'utf8');
    apiGatewayContent += createApiGatewayRoute(moduleNameLower);
    await fs.writeFile(apiGatewayPath, apiGatewayContent);

    // Add test to integration test file
    const testPath = path.join(__dirname, '..', 'tests', 'integration.test.js');
    let testContent = await fs.readFile(testPath, 'utf8');
    testContent += createIntegrationTest(moduleNameLower);
    await fs.writeFile(testPath, testContent);

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
CMD [ "node", "src/app.js" ]`;
}

function createPackageJson(moduleName) {
  return `{
  "name": "${moduleName}-service",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "mongoose": "^5.12.3"
  }
}`;
}

function createAppJs(moduleName) {
  return `const express = require('express');
const mongoose = require('mongoose');
const ${moduleName}Routes = require('./${moduleName}.routes');

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use('/api/${moduleName}s', ${moduleName}Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`${moduleName} service running on port \${PORT}\`));`;
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
const ${moduleName}Controller = require('./${moduleName}.controller');

router.post('/', ${moduleName}Controller.create);
router.get('/', ${moduleName}Controller.getAll);
router.get('/:id', ${moduleName}Controller.getById);
router.put('/:id', ${moduleName}Controller.update);
router.delete('/:id', ${moduleName}Controller.delete);

module.exports = router;`;
}

function createController(moduleName) {
  const moduleNameCapitalized = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  return `const ${moduleNameCapitalized} = require('./${moduleName}.model');

exports.create = async (req, res) => {
  try {
    const new${moduleNameCapitalized} = new ${moduleNameCapitalized}(req.body);
    const saved${moduleNameCapitalized} = await new${moduleNameCapitalized}.save();
    res.status(201).json(saved${moduleNameCapitalized});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const ${moduleName}s = await ${moduleNameCapitalized}.find();
    res.json(${moduleName}s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const ${moduleName} = await ${moduleNameCapitalized}.findById(req.params.id);
    if (!${moduleName}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json(${moduleName});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated${moduleNameCapitalized} = await ${moduleNameCapitalized}.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated${moduleNameCapitalized}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json(updated${moduleNameCapitalized});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted${moduleNameCapitalized} = await ${moduleNameCapitalized}.findByIdAndDelete(req.params.id);
    if (!deleted${moduleNameCapitalized}) return res.status(404).json({ message: '${moduleNameCapitalized} not found' });
    res.json({ message: '${moduleNameCapitalized} deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};`;
}

function createDockerComposeService(moduleName, port) {
  return `
  ${moduleName}-service:
    build: ./services/${moduleName}-service
    ports:
      - "${port}:3000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/${moduleName}_db
    depends_on:
      - mongo
`;
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

function createIntegrationTest(moduleName) {
  return `

async function test${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service(token) {
  console.log('Testing ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Service...');

  try {
    const headers = { Authorization: \`Bearer \${token}\` };

    // Test creating a ${moduleName}
    const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Response = await axios.post(\`\${API_GATEWAY_URL}/api/${moduleName}s\`, {
      // Add necessary fields here
    }, { headers });
    console.log('Create ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Response:', create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Response.data);

    const ${moduleName}Id = create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Response.data._id;

    // Test getting all ${moduleName}s
    const getAll${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}sResponse = await axios.get(\`\${API_GATEWAY_URL}/api/${moduleName}s\`, { headers });
    console.log('Get All ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s Response:', getAll${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}sResponse.data);

    // Test getting a single ${moduleName}
    const get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Response = await axios.get(\`\${API_GATEWAY_URL}/api/${moduleName}s/\${${moduleName}Id}\`, { headers });
    console.log('Get Single ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Response:', get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Response.data);

    console.log('${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Service tests passed successfully!');
  } catch (error) {
    console.error('${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} Service Test Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Add the following line inside the runTests function
await test${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Service(token);`;
}