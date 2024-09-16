# E-commerce Microservices CLI Tool

This CLI tool is designed to streamline the process of adding new modules to our e-commerce microservices architecture. It automates the creation of new services, updates the necessary configuration files, and sets up basic testing infrastructure.

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/ecommerce-microservices.git
   cd ecommerce-microservices/cli-tool
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Link the package globally:
   ```
   npm link
   ```

## Usage

To add a new module to your e-commerce microservices project:

1. Navigate to your project root directory.
2. Run the command:
   ```
   add-module
   ```
   OR
   ```
   node cli-tool/index.js add-module
   ```
3. Follow the prompts to enter the module name and port number.

The CLI tool will:
- Create a new service directory with the basic file structure
- Update the docker-compose.yml file
- Update the API Gateway
- Add basic integration tests

## What it Creates

For each new module, the CLI tool will create:

1. A new directory under `services/` with the module name
2. Basic file structure including:
   - `Dockerfile`
   - `package.json`
   - `src/app.js`
   - `src/<module>.model.js`
   - `src/<module>.routes.js`
   - `src/<module>.controller.js`
3. Updates to `docker-compose.yml` to include the new service
4. Updates to the API Gateway to route requests to the new service
5. Basic integration tests for the new module

## After Running the Tool

After adding a new module, you'll need to:

1. Customize the generated files according to your specific module requirements.
2. Implement the actual functionality in the controller.
3. Define the schema in the model file.
4. Add any necessary dependencies to the package.json file.
5. Rebuild and restart your Docker containers:
   ```
   docker-compose down
   docker-compose up --build
   ```

## Troubleshooting

If you encounter the error "command not found: add-module", try the following:

1. Ensure you've run `npm link` in the cli-tool directory.
2. If using nvm, run `nvm use system` before `npm link`.
3. Try installing the package globally: `npm install -g .` in the cli-tool directory.
4. Run the script directly: `node /path/to/your/cli-tool/index.js add-module`

## Contributing

Contributions to improve the CLI tool are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/your-username/ecommerce-microservices](https://github.com/your-username/ecommerce-microservices)