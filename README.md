[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgitlab.com%2FMomchil_Kalestrov%2Fseraphimcms.git&env=MONGODB_URI,BLOB_READ_WRITE_TOKEN,URL,AUTH_SECRET,NEXT_PUBLIC_BLOB_URL)

***WARNING***: The repository has moved from GitHub to GitLab. The git repo will be moved to [here](https://gitlab.com/Momchil_Kalestrov/seraphimcms.git).
For the near future, the GitHub repo will act as a mirror.

## Building

### Installing dependencies

`npm i`

### Starting dev server

`npm run dev`

### Start production server

`npm run build`

`npm run start`

### Env vars

To run properly add the `MONGODB_URI`, `URL` and `AUTH_SECRET` environment variables.

For integration with cloud blob storage providers, add `BLOB_READ_WRITE_TOKEN` and `NEXT_PUBLIC_BLOB_URL`. If they are omitted, the deployment will use the disk storage available on the server.

To override the marketplace server, add `NEXT_PUBLIC_MARKETPLACE_URL`.