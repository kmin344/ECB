# ECB CLI

Adds a new Express service to the stack and wires it into Docker Compose and the API gateway.

```bash
npm install
npm link        # installs the `ecb` command
cd ..           # run from ecommerce-boilerplate/
ecb add-module
```

The CLI prompts for a module name (for example `Wishlist`) and an optional host port. It then:

- generates `services/wishlist-service` with routes, controller, model, JWT middleware, Dockerfile and a starter test
- adds the service to `docker-compose.yml` and to the API gateway at `/api/wishlists`
